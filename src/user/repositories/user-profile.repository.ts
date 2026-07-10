import { Injectable } from '@nestjs/common';
import { Prisma, UserProfile } from '@prisma/client';
import { PrismaService } from 'src/prisma';
import type {
  CreateUserProfileRepositoryInput,
  UpdateUserProfileRepositoryInput,
} from '../types';

@Injectable()
export class UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Создание профиля пользователя
  async create(
    data: CreateUserProfileRepositoryInput,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<UserProfile | null> {
    return await tx.userProfile.create({
      data,
    });
  }

  // Обновление профиля
  async update(
    userId: string,
    data: UpdateUserProfileRepositoryInput,
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.update({
      where: { userId },
      data,
    });
  }
}
