import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common';
import { AppConfigModule, AppConfigProvider } from 'src/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  EmailThrottleRepository,
  EmailTokenRepository,
  IpThrottleRepository,
  RefreshTokenRepository,
} from './repositories';

@Module({
  imports: [AppConfigModule, CommonModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailThrottleRepository,
    EmailTokenRepository,
    IpThrottleRepository,
    RefreshTokenRepository,
    AppConfigProvider,
  ],
})
export class AuthModule {}
