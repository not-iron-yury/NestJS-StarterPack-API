import { IpThrottle, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';

Injectable();
export class IpThrottleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIp(ip: string): Promise<IpThrottle | null> {
    return await this.prisma.ipThrottle.findUnique({
      where: { ip },
    });
  }

  async incrementAttempts(ip: string): Promise<IpThrottle> {
    return this.prisma.ipThrottle.upsert({
      where: { ip },
      create: {
        ip,
        attempts: 1,
      },
      update: {
        attempts: { increment: 1 },
      },
    });
  }

  async reset(ip: string): Promise<void> {
    await this.prisma.ipThrottle.deleteMany({
      where: { ip },
    });
  }

  async block(
    ip: string,
    blockedUntil: Date,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.ipThrottle.update({
      where: { ip },
      data: { blockedUntil },
    });
  }
}
