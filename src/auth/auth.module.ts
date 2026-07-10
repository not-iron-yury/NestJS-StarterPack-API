import { Module } from '@nestjs/common';
import {
  EmailThrottleRepository,
  EmailTokenRepository,
  IpThrottleRepository,
  RefreshTokenRepository,
} from 'src/auth/repositories';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailThrottleRepository,
    EmailTokenRepository,
    IpThrottleRepository,
    RefreshTokenRepository,
  ],
})
export class AuthModule {}
