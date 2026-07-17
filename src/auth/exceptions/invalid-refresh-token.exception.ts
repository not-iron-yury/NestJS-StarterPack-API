import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions';
import { AUTH_ERROR_CODES } from '../constants/auth-error-codes';

export class InvalidRefreshTokenException extends AppException {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN);
  }
}
