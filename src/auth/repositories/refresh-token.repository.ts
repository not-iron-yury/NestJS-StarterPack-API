import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '@prisma/client';
import type { CreateRefreshTokenRepositoryInput } from 'src/auth/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByTokenHash(
    tokenHash: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<RefreshToken | null> {
    return await tx.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
      },
    });
  }

  async create(
    data: CreateRefreshTokenRepositoryInput,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<RefreshToken> {
    return await tx.refreshToken.create({
      data,
    });
  }

  async revokeByTokenId(
    id: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(
    userId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  // для cron-задачи (реализовать потом)
  deleteExpired() {}
}
