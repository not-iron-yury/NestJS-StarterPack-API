import { Module } from '@nestjs/common';
import { UserProfileRepository, UserRepository } from 'src/user/repositories';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, UserProfileRepository],
  exports: [UserService, UserRepository, UserProfileRepository],
})
export class UserModule {}
