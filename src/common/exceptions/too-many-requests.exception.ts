import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes';
import { AppException } from './app.exception';

type RateLimitScope = 'ip' | 'email';

export class TooManyRequestsException extends AppException {
  constructor(public readonly scope: RateLimitScope) {
    super(HttpStatus.TOO_MANY_REQUESTS, ERROR_CODES.TOO_MANY_REQUESTS, {
      scope,
    });
  }
}

/**
 * Примеры использования:
 *
 * throw new TooManyRequestsException('ip');
 *
 * throw new TooManyRequestsException('email');
 *
 */
