import { ConflictException, Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus } from '@prisma/client';
import { InsufficientPermissionsException } from 'src/common/exceptions';
import { PrismaService } from 'src/prisma';
import {
  CannotBlockAdminException,
  CannotChangeOwnRoleException,
  CannotChangeOwnStatusException,
  RoleAlreadyAssignedException,
  StatusAlreadyAssignedException,
  UserNotFoundException,
} from 'src/user/exceptions';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserRepository } from './repositories/user.repository';
import type {
  ChangeUserRoleInputData,
  ChangeUserStatusInputData,
  CreateUserInputData,
  GetUsersInputData,
  UpdateUserProfileInputData,
  UserResponse,
  UsersResponse,
} from './types';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createUser(data: CreateUserInputData): Promise<User> {
    // Проверка наличия email в БД
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new UserNotFoundException();
    }

    // Попытка выполнить транзакционную запись в БД (user и userProfile)
    try {
      return this.prisma.$transaction(async (tx) => {
        // создание пользователя
        const user = await this.userRepository.create(
          {
            email: data.email,
            passwordHash: data.passwordHash,
          },
          tx,
        );

        // создание профиля пользователя
        await this.userProfileRepository.create(
          {
            userId: user.id,
            firstName: data.firstName,
            phone: data.phone,
            avatarUrl: data.avatarUrl,
          },
          tx,
        );

        return user;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: UpdateUserProfileInputData,
  ): Promise<void> {
    // 1. Проверяем пользователя
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }
    // 2. Меняем данные в профиле
    await this.userProfileRepository.update(userId, data);
  }

  async changeRole(data: ChangeUserRoleInputData): Promise<void> {
    // actorUserId берётся из JWT
    const { targetUserId, newRole, actorUserId } = data;

    // 1. Проверяем пользователя
    const user = await this.userRepository.findById(targetUserId);

    if (!user) {
      throw new UserNotFoundException();
    }

    // 2. Если роль не изменяется
    if (user.role === newRole) {
      throw new RoleAlreadyAssignedException();
    }

    // 3. Проверка прав (только админ может менять права)
    const actor = await this.userRepository.findById(actorUserId);

    if (!actor || actor.role !== UserRole.ADMIN) {
      throw new InsufficientPermissionsException();
    }

    // 4. Защита от самоизменения
    if (actorUserId === targetUserId) {
      throw new CannotChangeOwnRoleException();
    }

    // 5. Выполняем обновление
    await this.userRepository.changeRole(targetUserId, newRole);
  }

  async changeStatus(data: ChangeUserStatusInputData): Promise<void> {
    const { targetUserId, newStatus, actorUserId } = data;

    // 1. Проверяем пользователя
    const user = await this.userRepository.findById(targetUserId);

    if (!user) {
      throw new UserNotFoundException();
    }

    // 2. Если статус не изменяется
    if (user.status === newStatus) {
      throw new StatusAlreadyAssignedException();
    }

    // 3. Проверка прав (Нельзя заблокировать администратора)
    if (user.role === UserRole.ADMIN && newStatus === UserStatus.BLOCKED) {
      throw new CannotBlockAdminException();
    }

    // 4. Защита от самоизменения (Нельзя изменить собственный статус)
    if (actorUserId === targetUserId) {
      throw new CannotChangeOwnStatusException();
    }

    // 5. Выполняем обновление
    await this.userRepository.changeStatus(targetUserId, newStatus);
  }

  async getUsers(data: GetUsersInputData): Promise<UsersResponse> {
    const { page, limit } = data;

    const result = await this.userRepository.findMany({ page, limit });

    return {
      items: result.items,
      total: result.total,
      page: data.page,
      limit: data.limit,
    };
  }

  // Все данные пользователя (для админа или для личного кабинета)
  async getById(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findByIdWithProfile(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      profile: {
        firstName: user.profile?.firstName ?? null,
        phone: user.profile?.phone ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
      },
    };
  }
}
