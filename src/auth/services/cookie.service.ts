import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { InvalidRefreshTokenException } from 'src/auth/exceptions';
import { AppConfigProvider } from 'src/config';

@Injectable()
export class CookieService {
  constructor(private readonly config: AppConfigProvider) {}

  // -------------------- геттеры -------------------- //

  private get refreshCookie() {
    return this.config.cookie.refresh;
  }

  // --------------------- методы -------------------- //

  setRefreshToken(response: Response, token: string): void {
    const refresh = this.refreshCookie;

    response.cookie(refresh.name, token, {
      httpOnly: refresh.httpOnly, // запрещает доступ к этому cookie через JavaScript на стороне клиента (защита от XSS)
      secure: refresh.secure, // this.config.app.nodeEnv === 'production' -> используется только через защищённые соединения (HTTPS)
      sameSite: refresh.sameSite, // ограничивает передачу cookie между доменами ('strict' - только собственный сайт может отправить запрос с данным cookie)
      path: refresh.path, // cookie будут отправляться только на маршруты /auth/*
      maxAge: refresh.maxAge,
    });
  }

  clearRefreshToken(response: Response): void {
    const refresh = this.refreshCookie;

    response.clearCookie(refresh.name, {
      path: refresh.path,
    });
  }

  getRefreshToken(request: Request): string {
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    return refreshToken;
  }
}
