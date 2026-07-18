import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { API_ROUTES } from 'src/common/constants/api-routes';
import { CurrentUser, Roles } from 'src/common/decorators';
import { JwtGuard, RolesGuard } from 'src/common/guards';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { USER_EVENT_CODES } from 'src/user/constants/user-event-codes';
import type {
  ChangeUserRoleDto,
  ChangeUserStatusDto,
  GetUsersDto,
  UpdateUserProfileDto,
} from 'src/user/dto';
import {
  ChangeUserRoleSchema,
  ChangeUserStatusSchema,
  GetUsersSchema,
  UpdateUserProfileSchema,
} from 'src/user/dto';
import type { UserCodeResponse, UserResponse } from 'src/user/types';
import { UserService } from './user.service';

@Controller(API_ROUTES.users)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Получить список пользователей (для админа)
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(
    @Query(new ZodValidationPipe(GetUsersSchema)) query: GetUsersDto,
  ) {
    return await this.userService.getUsers({
      page: query.page,
      limit: query.limit,
      role: query.role,
      status: query.status,
    });
  }

  // Получить данные своего профиля
  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@CurrentUser('sub') userId: string) {
    return await this.userService.getById(userId);
  }

  // Обновить данные своего профиля
  @Patch('me')
  @UseGuards(JwtGuard)
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(UpdateUserProfileSchema))
    dto: UpdateUserProfileDto,
  ): Promise<UserCodeResponse> {
    await this.userService.updateProfile(userId, {
      firstName: dto.firstName,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
    });

    return { code: USER_EVENT_CODES.PROFILE_UPDATED };
  }

  /** -------------- Только ADMIN --------------  **/

  // Получить все данные конкретного пользователя (для админа)
  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getById(
    @Param('id', new ParseUUIDPipe()) userId: string,
  ): Promise<UserResponse> {
    return await this.userService.getById(userId);
  }

  // Изменить роль пользователя
  @Patch(':id/role')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeRole(
    @Param('id', new ParseUUIDPipe()) targetUserId: string,
    @CurrentUser('sub') actorUserId: string,
    @Body(new ZodValidationPipe(ChangeUserRoleSchema)) dto: ChangeUserRoleDto,
  ): Promise<UserCodeResponse> {
    await this.userService.changeRole({
      targetUserId,
      newRole: dto.newRole,
      actorUserId,
    });

    return { code: USER_EVENT_CODES.ROLE_UPDATED };
  }

  // Изменить статус (заблокировать) пользователя
  @Patch(':id/status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeStatus(
    @Param('id', new ParseUUIDPipe()) targetUserId: string,
    @CurrentUser('sub') actorUserId: string,
    @Body(new ZodValidationPipe(ChangeUserStatusSchema))
    dto: ChangeUserStatusDto,
  ): Promise<UserCodeResponse> {
    await this.userService.changeStatus({
      targetUserId,
      newStatus: dto.newStatus,
      actorUserId,
    });

    return { code: USER_EVENT_CODES.STATUS_UPDATED };
  }
}
