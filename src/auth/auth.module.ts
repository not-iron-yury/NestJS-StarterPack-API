import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common';
import { AppConfigModule, AppConfigProvider } from 'src/config';

import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/common/services';
import { UserModule, UserService } from 'src/user';
import { UserRepository } from 'src/user/repositories';
import { AuthController } from './auth.controller';
import {
  EmailThrottleRepository,
  EmailTokenRepository,
  IpThrottleRepository,
  RefreshTokenRepository,
} from './repositories';
import {
  AuthService,
  CookieService,
  RateLimitService,
  TokenService,
} from './services';

@Module({
  imports: [AppConfigModule, CommonModule, UserModule],
  controllers: [AuthController],
  providers: [
    AppConfigProvider,

    UserService,
    PasswordService,
    RateLimitService,
    TokenService,
    JwtService,
    AuthService,
    CookieService,

    UserRepository,
    RefreshTokenRepository,
    EmailTokenRepository,
    IpThrottleRepository,
    EmailThrottleRepository,
  ],
})
export class AuthModule {}
