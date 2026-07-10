import { Injectable } from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma';
import type {
  CreateUserRepositoryInput,
  FindUsersRepositoryInput,
  UpdateUserPasswordRepositoryInput,
} from '../types';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Поиск пользователя по email
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Поиск пользователя по id
  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Все данные пользователя (с профилем)
  async findByIdWithProfile(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  // возврат всех пользователей с пагинацией и фильтрацией
  async findMany(data: FindUsersRepositoryInput) {
    const { page, limit, role, status } = data;

    const skip = (page - 1) * limit;

    const where = {
      ...(role && { role }),
      ...(status && { status }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      items: users,
      total,
    };
  }

  // Создание пользователя
  async create(
    data: CreateUserRepositoryInput,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<User> {
    return await tx.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
    });
  }

  // Смена роли пользователя
  async changeRole(id: string, newRole: UserRole): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { role: newRole },
    });
  }

  // Смена статуса пользователя (блокировка)
  async changeStatus(id: string, newStatus: UserStatus): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  // Обновление времени последней авторизации
  async updateLastLogin(
    id: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  // Подтверждение email
  async verifyEmail(
    userId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
      },
    });
  }

  // Обновление пароля
  async updatePassword(
    { userId, passwordHash }: UpdateUserPasswordRepositoryInput,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
