import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, CommonModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
