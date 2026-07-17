import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import {
  InvalidAccessTokenException,
  InvalidRefreshTokenException,
} from 'src/auth/exceptions';
import { AppConfigProvider } from 'src/config';
import type { JwtPayload } from '../types';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigProvider,
  ) {}

  // -------------------- геттеры -------------------- //

  private get refreshSecret() {
    return this.config.jwt.refresh.secret;
  }
  private get refreshExpiresIn() {
    return this.config.jwt.refresh.expiresIn;
  }

  private get accessSecret() {
    return this.config.jwt.access.secret;
  }
  private get accessExpiresIn() {
    return this.config.jwt.access.expiresIn;
  }

  // --------------------- методы -------------------- //

  // Генерация Access Token
  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.access.secret,
      expiresIn: this.accessExpiresIn,
    });
  }

  // Генерация Refresh Token
  async generateRefreshToken(
    payload: JwtPayload,
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    const { exp } = (await this.jwtService.decode(token)) as { exp: number };

    return {
      token,
      expiresAt: new Date(exp * 1000),
    };
  }

  // Проверка Access Token
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verifyAsync(token, {
        secret: this.accessSecret,
      });
    } catch (error) {
      throw new InvalidAccessTokenException();
    }
  }

  // Проверка Refresh Token
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verifyAsync(token, {
        secret: this.refreshSecret,
      });
    } catch (error) {
      throw new InvalidRefreshTokenException();
    }
  }

  // Генерация случайного токена (для EmailVerificationToken и PasswordResetToken)
  generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Хеширование токенов (для сохранения в БД)
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
