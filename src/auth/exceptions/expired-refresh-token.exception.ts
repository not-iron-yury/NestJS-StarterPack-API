import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions';
import { AUTH_ERROR_CODES } from '../constants/auth-error-codes';

export class ExpiredRefreshTokenException extends AppException {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, AUTH_ERROR_CODES.EXPIRED_REFRESH_TOKEN);
  }
}
