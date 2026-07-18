import {
  Body,
  Controller,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AUTH_EVENT_CODES } from 'src/auth/constants';
import type {
  LoginDto,
  RegisterDto,
  RequestPasswordChangeDto,
  RequestPasswordResetDto,
  UpdatePasswordDto,
  VerifyEmailDto,
} from 'src/auth/dto';
import {
  CredentialsSchema,
  RequestPasswordChangeSchema,
  RequestPasswordResetSchema,
  UpdatePasswordSchema,
  VerifyEmailSchema,
} from 'src/auth/dto';
import { AuthService } from 'src/auth/services/auth.service';
import { CookieService } from 'src/auth/services/cookie.service';
import type { AuthCodeResponse, AuthResponseType } from 'src/auth/types';
import { API_ROUTES } from 'src/common/constants/api-routes';
import { CurrentUser } from 'src/common/decorators';
import { JwtGuard } from 'src/common/guards';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller(API_ROUTES.auth)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(CredentialsSchema)) dto: RegisterDto,
  ): Promise<AuthCodeResponse> {
    // регистрация и отправка ссылки верификации на email (требуется подтверждение email)
    await this.authService.register(dto);
    return {
      code: AUTH_EVENT_CODES.EMAIL_VERIFICATION_EMAIL_SENT,
    };
  }

  @Post('verify-email')
  async verifyEmail(
    @Body(new ZodValidationPipe(VerifyEmailSchema))
    dto: VerifyEmailDto,
  ): Promise<AuthCodeResponse> {
    // фронт вызывает API после открытия ссылки из email
    await this.authService.verifyEmail(dto);
    return {
      code: AUTH_EVENT_CODES.ACCOUNT_ACTIVATED,
    };
  }

  // инициализация сброса пароля без авторизации (забыл пароль)
  @Post('password-reset-request')
  async requestPasswordReset(
    @Body(new ZodValidationPipe(RequestPasswordResetSchema))
    dto: RequestPasswordResetDto, // email: string;
  ): Promise<AuthCodeResponse> {
    await this.authService.requestPasswordReset(dto);
    return {
      code: AUTH_EVENT_CODES.PASSWORD_RESET_EMAIL_SENT,
    };
  }

  // инициализация сброса пароля с авторизацией (из личного кабинета)
  @Post('password-change-request')
  @UseGuards(JwtGuard)
  async requestPasswordChange(
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(RequestPasswordChangeSchema))
    dto: RequestPasswordChangeDto, // currentPassword: string
  ): Promise<AuthCodeResponse> {
    await this.authService.requestPasswordChange({
      userId,
      currentPassword: dto.currentPassword,
    });

    return {
      code: AUTH_EVENT_CODES.PASSWORD_CHANGE_EMAIL_SENT,
    };
  }

  @Post('update-password')
  async updatePassword(
    @Body(new ZodValidationPipe(UpdatePasswordSchema)) dto: UpdatePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthCodeResponse> {
    // Замена пароля (без выдачи refreshToken и автоматического login).
    // По ссылке из email открывается фронтенд с формой.
    // Далее фронт передает API пароль с токеном верификации.
    await this.authService.updatePassword({
      token: dto.token,
      newPassword: dto.newPassword,
    });

    // подчищаем refreshToken в cookie после успешного обновления пароля
    this.cookieService.clearRefreshToken(response);

    return {
      code: AUTH_EVENT_CODES.PASSWORD_UPDATE_SUCCESS,
    };
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(CredentialsSchema))
    dto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseType> {
    const result = await this.authService.login({ ...dto, ip });

    // формируем cookie с новым refreshToken
    this.cookieService.setRefreshToken(response, result.refreshToken);

    return { accessToken: result.accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseType> {
    // извлекаем текущее значение refreshToken из cookie
    const refreshToken = this.cookieService.getRefreshToken(request);

    // создаем новый refreshToken и обновляем запись в БД
    const result = await this.authService.refresh({ refreshToken });

    // обновляем данные refreshToken в cookie
    this.cookieService.setRefreshToken(response, result.refreshToken);

    return { accessToken: result.accessToken };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthCodeResponse> {
    // извлекаем текущее значение refreshToken из cookie
    const refreshToken = this.cookieService.getRefreshToken(request);

    try {
      // проверяем полученные refreshToken и отзываем его (в БД)
      await this.authService.logout({ refreshToken });
    } finally {
      // подчищаем refreshToken в cookie
      this.cookieService.clearRefreshToken(response);
    }

    return { code: AUTH_EVENT_CODES.LOGOUT_SUCCESS };
  }

  @Post('logout-all')
  async logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthCodeResponse> {
    // извлекаем текущее значение refreshToken из cookie
    const refreshToken = this.cookieService.getRefreshToken(request);

    try {
      // проверяем полученный refreshToken и отзываем все refreshToken пользователя
      await this.authService.logoutAll({ refreshToken });
    } finally {
      // подчищаем refreshToken в cookie
      this.cookieService.clearRefreshToken(response);
    }

    return { code: AUTH_EVENT_CODES.LOGOUT_ALL_SUCCESS };
  }
}
