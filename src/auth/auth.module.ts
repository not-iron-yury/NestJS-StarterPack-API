import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common';
import { AppConfigModule, AppConfigProvider } from 'src/config';

import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/common/services';
import { UserRepository } from 'src/user/repositories';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import {
  EmailThrottleRepository,
  EmailTokenRepository,
  IpThrottleRepository,
  RefreshTokenRepository,
} from './repositories';
import { RateLimitService, TokenService } from './services';

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

    UserRepository,
    RefreshTokenRepository,
    EmailTokenRepository,
    IpThrottleRepository,
    EmailThrottleRepository,
  ],
})
export class AuthModule {}
