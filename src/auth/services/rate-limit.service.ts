import { Injectable } from '@nestjs/common';
import { TooManyRequestsException } from 'src/common/exceptions/too-many-requests.exception';
import { AppConfigProvider } from 'src/config';
import { PrismaService } from 'src/prisma';
import { EmailThrottleRepository, IpThrottleRepository } from '../repositories';

@Injectable()
export class RateLimitService {
  constructor(
    private readonly ipThrottleRepository: IpThrottleRepository,
    private readonly emailThrottleRepository: EmailThrottleRepository,

    private readonly prisma: PrismaService,

    private readonly config: AppConfigProvider,
  ) {}

  // -------------------- геттеры -------------------- //

  private get maxAttempts() {
    return this.config.security.login.maxAttempts;
  }

  private get lockTime() {
    return this.config.security.login.lockTime;
  }

  // --------------------- методы -------------------- //

  async checkIp(ip: string) {
    // Проверка наличия записи (уже были какие-то неудачные попытки)
    const throttle = await this.ipThrottleRepository.findByIp(ip);

    // 1. Если записей нет
    if (!throttle) return;

    // 2. Если запись есть, но лимит не превышен и нет блокировки
    if (!throttle.blockedUntil) return;

    // 3. Если блокировка истекла -> сбрасываем блокировку
    // if (throttle.blockedUntil <= new Date()) {
    //   await this.ipThrottleRepository.reset(ip);
    //   return;
    // }

    // 4. Если лимит превышен
    throw new TooManyRequestsException('ip');
  }

  async checkEmail(email: string) {
    // Проверка наличия записи (уже были какие-то неудачные попытки)
    const throttle = await this.ipThrottleRepository.findByIp(email);

    // 1. Если записей нет
    if (!throttle) return;

    // 2. Если запись есть, но лимит не превышен и нет блокировки
    if (!throttle.blockedUntil) return;

    // 3. Если блокировка истекла -> сбрасываем блокировку
    // if (throttle.blockedUntil <= new Date()) {
    //   await this.ipThrottleRepository.reset(email);
    //   return;
    // }

    // 4. Если лимит превышен
    throw new TooManyRequestsException('email');
  }

  async loginFailedAttempt(ip: string, email: string): Promise<void> {
    // 1. Находим данные ip
    const ipThrottle = await this.ipThrottleRepository.incrementAttempts(ip);

    // 2. Находим данные email
    const emailThrottle =
      await this.emailThrottleRepository.incrementAttempts(email);

    // 3. Если у ip или email превышен лимит - блокируем и ip, и email
    if (
      ipThrottle.attempts >= this.maxAttempts ||
      emailThrottle.attempts >= this.maxAttempts
    ) {
      await this.prisma.$transaction(async (tx) => {
        const blockedUntil = this.getBlockedUntil();

        await this.ipThrottleRepository.block(ip, blockedUntil, tx);
        await this.emailThrottleRepository.block(email, blockedUntil, tx);
      });
    }
  }

  async reset(ip: string, email: string): Promise<void> {
    // await this.ipThrottleRepository.reset(ip);
    // await this.emailThrottleRepository.reset(email);

    await Promise.all([
      this.ipThrottleRepository.reset(ip),
      this.emailThrottleRepository.reset(email),
    ]);
  }

  private getBlockedUntil() {
    return new Date(Date.now() + this.lockTime);
  }
}
