import { Injectable } from '@nestjs/common';
import { EmailOperationType, UserStatus } from '@prisma/client';
import {
  AccountBlockedException,
  EmailAlreadyExistsException,
  ExpiredEmailVerificationToken,
  ExpiredRefreshTokenException,
  InvalidCredentialsException,
  InvalidEmailVerificationTokenException,
  InvalidRefreshTokenException,
  PasswordAlreadyUsedException,
} from 'src/auth/exceptions';
import { PasswordService } from 'src/common/services';
import { AppConfigProvider } from 'src/config';
import { PrismaService } from 'src/prisma';
import { UserNotFoundException } from 'src/user/exceptions';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UserService } from 'src/user/user.service';
import { EmailTokenRepository, RefreshTokenRepository } from '../repositories';
import { RateLimitService, TokenService } from '../services';
import type {
  JwtPayload,
  LoginInputData,
  LoginResult,
  RefreshInputData,
  RegisterInputData,
  RequestPasswordChangeInputData,
  RequestPasswordResetInputData,
  UpdatePasswordInputData,
  VerifyEmailInputData,
} from '../types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,

    private readonly prisma: PrismaService,

    private readonly config: AppConfigProvider,

    private readonly passwordService: PasswordService,

    private readonly rateLimitService: RateLimitService,

    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,

    private readonly emailTokenRepository: EmailTokenRepository,
  ) {}

  // -------------------- геттеры -------------------- //

  private get urlFrontend() {
    return this.config.urls.frontend;
  }

  // --------------------- методы -------------------- //

  async register({ email, password }: RegisterInputData): Promise<void> {
    // 1. Хеширование пароля
    const passwordHash = await this.passwordService.hash(password);

    // 2. Создание пользователя
    const newUser = await this.userService.createUser({
      email,
      passwordHash,
    });

    // 3. Инвалидация старых EMAIL_VERIFICATION токенов
    await this.emailTokenRepository.invalidateUserTokens(
      newUser.id,
      EmailOperationType.EMAIL_VERIFICATION,
    );

    // 4. Генерация и хеширование нового EMAIL_VERIFICATION токена
    const token = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(token);

    // 5. Запись hash токена в БД
    await this.emailTokenRepository.create({
      userId: newUser.id,
      type: EmailOperationType.EMAIL_VERIFICATION,
      tokenHash,
      expiresAt: this.getEmailTokenExpiresAt(),
    });

    // 6. Высылаем на email ссылку с токеном
    const resetUrl = `${this.urlFrontend}/verify-email?token=${token}`;
    console.log(`Verify email link: ${resetUrl}`);
  }

  async verifyEmail({ token }: VerifyEmailInputData): Promise<void> {
    // 1. Вычисление tokenHash
    const tokenHash = this.tokenService.hashToken(token);

    const emailToken = await this.emailTokenRepository.findActiveByTokenHash(
      tokenHash,
      EmailOperationType.EMAIL_VERIFICATION,
    );

    // 2. Проверяем существование
    if (!emailToken) {
      throw new InvalidEmailVerificationTokenException();
    }

    // 3. Проверяем срок действия
    if (new Date() > emailToken.expiresAt) {
      throw new ExpiredEmailVerificationToken();
    }

    // 4. Убеждаемся, что пользователь ещё не подтверждён
    const user = await this.userService.findById(emailToken.userId);

    if (user.emailVerifiedAt) {
      throw new EmailAlreadyExistsException();
    }

    // 5. Помечаем EmailToken использованным и обновляем emailVerifiedAt
    await this.prisma.$transaction(async (tx) => {
      await this.emailTokenRepository.markAsUsed(emailToken.id, tx);
      await this.userRepository.verifyEmail(user.id, tx);
    });
  }

  async login({ email, password, ip }: LoginInputData): Promise<LoginResult> {
    // 1. Проверяем блокировки (ip/email уже заблокированы или нет?)
    await this.rateLimitService.checkEmail(email);
    await this.rateLimitService.checkIp(ip);

    // 2. Проверяем пользователя
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      await this.rateLimitService.loginFailedAttempt(ip, email);
      throw new InvalidCredentialsException();
    }

    // 3. Проверяем emailVerifiedAt
    if (!user.emailVerifiedAt) {
      throw new InvalidCredentialsException();
    }

    // 4. Проверяем статус пользователя (пользователь заблокирован или нет?)
    if (user.status !== UserStatus.ACTIVE) {
      throw new AccountBlockedException();
    }
    // 5. Проверяем пароль
    const isPasswordValid = await this.passwordService.verify(
      user.passwordHash,
      password,
    );

    // если пароль НЕ правильный - фиксируем неудачную попытку
    if (!isPasswordValid) {
      await this.rateLimitService.loginFailedAttempt(ip, email);
      throw new InvalidCredentialsException();
    }

    // если пароль правильный - сбрасываем счетчик неудачных попыток
    await this.rateLimitService.reset(ip, email);

    // 6. Готовим JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    // 7. Генерируем access и refresh токены
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(payload),
      this.tokenService.generateRefreshToken(payload),
    ]);

    // 8. Готовим refresh token hash
    const tokenHash = this.tokenService.hashToken(refreshToken.token);

    // 9. Обновляем дату последней авторизации и сохраняем tokenHash в RefreshToken
    await this.prisma.$transaction(async (tx) => {
      await this.userRepository.updateLastLogin(user.id, tx);

      await this.refreshTokenRepository.create(
        {
          userId: user.id,
          tokenHash,
          expiresAt: refreshToken.expiresAt,
        },
        tx,
      );
    });

    // 10. Возвращаем токены
    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async refresh({ refreshToken }: RefreshInputData): Promise<LoginResult> {
    // 1. Проверяем JWT
    // при невалидном токене jwtService.verifyAsync() выбросит исключение
    const jwtPayload = await this.tokenService.verifyRefreshToken(refreshToken);

    // 2. Ищем запись в БД (по хешу токена пользователя)
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findActiveByTokenHash(tokenHash);

    // 3. Проверяем существование токена
    if (!storedToken) {
      throw new InvalidRefreshTokenException();
    }

    // 4. Сравниваем userId из БД и из jwtPayload (sub это userId)
    if (jwtPayload.sub !== storedToken.userId) {
      throw new InvalidRefreshTokenException();
    }

    // 5. Проверяем expiresAt
    if (new Date() > storedToken.expiresAt) {
      throw new ExpiredRefreshTokenException();
    }

    // 6. Находим и проверяем пользователя
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 7. Проверяем статус пользователя
    if (user.status !== UserStatus.ACTIVE) {
      throw new AccountBlockedException();
    }

    // 8. Готовим новые токены
    const newJwtPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(newJwtPayload),
      this.tokenService.generateRefreshToken(newJwtPayload),
    ]);

    // 9. Hash нового refresh token
    const newTokenHash = this.tokenService.hashToken(newRefreshToken.token);

    // 10. Отзываем старый refresh token и записываем новый
    await this.prisma.$transaction(async (tx) => {
      await this.refreshTokenRepository.revokeByTokenId(storedToken.id, tx);
      await this.refreshTokenRepository.create(
        {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt: newRefreshToken.expiresAt,
        },
        tx,
      );
    });

    // 11. Возвращаем токены
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  async logout({ refreshToken }: RefreshInputData): Promise<void> {
    // 1. Проверяем JWT
    // при невалидном токене jwtService.verifyAsync() выбросит исключение
    await this.tokenService.verifyRefreshToken(refreshToken);

    // 2. Ищем запись в БД (по хешу токена пользователя)
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findActiveByTokenHash(tokenHash);

    // 3. Проверяем существование токена
    if (!storedToken) {
      throw new InvalidRefreshTokenException();
    }

    // 4. Отзываем refreshToken
    await this.refreshTokenRepository.revokeByTokenId(storedToken.id);
  }

  async logoutAll({ refreshToken }: RefreshInputData): Promise<void> {
    // 1. Проверяем JWT
    // при невалидном токене jwtService.verifyAsync() выбросит исключение
    await this.tokenService.verifyRefreshToken(refreshToken);

    // 2. Ищем запись в БД (по хешу токена пользователя)
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findActiveByTokenHash(tokenHash);

    // 3. Проверяем существование токена
    if (!storedToken) {
      throw new InvalidRefreshTokenException();
    }

    // 4. Отзываем все refreshToken пользователя
    await this.refreshTokenRepository.revokeAllByUserId(storedToken.userId);
  }

  // инициализация сброса пароля без авторизации (забыл пароль)
  async requestPasswordReset({
    email,
  }: RequestPasswordResetInputData): Promise<void> {
    // 1. Проверяем пользователя
    const user = await this.userRepository.findByEmail(email);

    if (!user) return; // Нельзя раскрывать существование пользователя

    // 2. Проверяем подтверждение email
    if (!user.emailVerifiedAt) return; // Нельзя сбрасывать пароль для неподтвержденного email

    // 3. Инвалидируем старые PASSWORD_CHANGE токены (на случай если они были выданы)
    await this.emailTokenRepository.invalidateUserTokens(
      user.id,
      EmailOperationType.PASSWORD_CHANGE,
    );

    // 4. Создаем новый токен для инициализации процедуры сброса пароля
    const token = this.tokenService.generateRandomToken();

    // 5. Записываем в БД хеш токена
    const tokenHash = this.tokenService.hashToken(token);
    await this.emailTokenRepository.create({
      userId: user.id,
      type: EmailOperationType.PASSWORD_CHANGE,
      tokenHash,
      expiresAt: this.getPasswordTokenExpiresAt(),
    });

    // 6. Формируем email ссылку с токеном (для фронтенда)
    const resetUrl = `${this.urlFrontend}/reset-password?token=${token}`;

    // 7. Отправляем ссылку (пока что в терминал)
    console.log(`Reset password: ${resetUrl}`);
  }

  // инициализация сброса пароля с авторизацией (из личного кабинета)
  async requestPasswordChange({
    userId,
    currentPassword,
  }: RequestPasswordChangeInputData): Promise<void> {
    // 1. Находим пользователя
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // 2. Сравниваем пароли - должны совпадать
    const isSamePassword = await this.passwordService.verify(
      user.passwordHash,
      currentPassword,
    );

    if (!isSamePassword) {
      throw new InvalidCredentialsException();
    }

    // 3. Инвалидируем старые PASSWORD_CHANGE токены
    await this.emailTokenRepository.invalidateUserTokens(
      user.id,
      EmailOperationType.PASSWORD_CHANGE,
    );

    // 4. Создаем новый токен для инициализации процедуры сброса пароля
    const token = this.tokenService.generateRandomToken();

    // 5. Записываем в БД хеш токена
    const tokenHash = this.tokenService.hashToken(token);

    await this.emailTokenRepository.create({
      userId: user.id,
      type: EmailOperationType.PASSWORD_CHANGE,
      tokenHash,
      expiresAt: this.getPasswordTokenExpiresAt(),
    });

    // 6. Формируем email ссылку с токеном (для фронтенда)
    const url = `${this.urlFrontend}/change-password?token=${token}`;

    // 7. Отправляем ссылку (пока что в терминал)
    console.log(`Change password: ${url}`);
  }

  async updatePassword({
    token,
    newPassword,
  }: UpdatePasswordInputData): Promise<void> {
    // 1. хешируем полученный от клиента токен (инициализации процедуры сброса пароля)
    const tokenHash = this.tokenService.hashToken(token);

    // 2. Проверяем существование токена
    const emailToken = await this.emailTokenRepository.findActiveByTokenHash(
      tokenHash,
      EmailOperationType.PASSWORD_CHANGE,
    );

    if (!emailToken) {
      throw new InvalidEmailVerificationTokenException();
    }

    // 3. Проверяем актуальность токена
    if (new Date() > emailToken.expiresAt) {
      throw new ExpiredEmailVerificationToken();
    }

    // 4. Проверяем существование пользователя
    const user = await this.userRepository.findById(emailToken.userId);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AccountBlockedException();
    }

    // 5. Убеждаемся, что новый пароль отличается от текущего
    const isSamePassword = await this.passwordService.verify(
      user.passwordHash,
      newPassword,
    );

    if (isSamePassword) {
      throw new PasswordAlreadyUsedException();
    }

    // 6. Хешируем новый пароль
    const passwordHash = await this.passwordService.hash(newPassword);

    // 7. Обновляем данные в БД
    await this.prisma.$transaction(async (tx) => {
      // Обновляем пароль
      await this.userRepository.updatePassword(
        { userId: user.id, passwordHash },
        tx,
      );

      // Помечаем emailToken использованным (исключаем повторную инициализацию процедуры по текущему токену)
      await this.emailTokenRepository.markAsUsed(emailToken.id, tx);

      // Отзываем все refreshToken пользователя (закрываем все активные сессии)
      await this.refreshTokenRepository.revokeAllByUserId(user.id, tx);
    });

    // После сброса пароля пользователь должен заново выполнить login(),
    // что бы получить новый refreshToken
  }

  private getEmailTokenExpiresAt(): Date {
    return new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 сутки
  }

  private getPasswordTokenExpiresAt(): Date {
    return new Date(Date.now() + 60 * 60 * 1000); // 1 час
  }
}
