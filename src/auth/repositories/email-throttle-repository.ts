import { EmailThrottle, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';

Injectable();
export class EmailThrottleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIp(email: string): Promise<EmailThrottle | null> {
    return await this.prisma.emailThrottle.findUnique({
      where: { email },
    });
  }

  async incrementAttempts(email: string): Promise<EmailThrottle> {
    return await this.prisma.emailThrottle.upsert({
      where: { email },
      create: {
        email,
        attempts: 1,
      },
      update: {
        attempts: { increment: 1 },
      },
    });
  }

  async reset(email: string): Promise<void> {
    await this.prisma.emailThrottle.deleteMany({
      where: { email },
    });
  }

  async block(
    email: string,
    blockedUntil: Date,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.emailThrottle.update({
      where: { email },
      data: { blockedUntil },
    });
  }
}
