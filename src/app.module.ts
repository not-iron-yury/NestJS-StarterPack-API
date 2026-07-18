import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app-config.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    AuthModule,
    PrismaModule,
    AppConfigModule,
  ],
})
export class AppModule {}
