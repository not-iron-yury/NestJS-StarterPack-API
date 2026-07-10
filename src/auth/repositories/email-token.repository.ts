import { Injectable } from '@nestjs/common';
import { EmailOperationType, EmailToken, Prisma } from '@prisma/client';
import type { CreateEmailTokenRepositoryInput } from 'src/auth/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class EmailTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByTokenHash(
    tokenHash: string,
    type: EmailOperationType,
  ): Promise<EmailToken | null> {
    return await this.prisma.emailToken.findFirst({
      where: {
        tokenHash,
        type,
        usedAt: null,
      },
    });
  }

  async create(
    data: CreateEmailTokenRepositoryInput,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<EmailToken> {
    return await tx.emailToken.create({
      data,
    });
  }

  async markAsUsed(
    id: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.emailToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidateUserTokens(
    userId: string,
    type: EmailOperationType,
  ): Promise<void> {
    this.prisma.emailToken.updateMany({
      where: {
        userId,
        type,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
  }
}
