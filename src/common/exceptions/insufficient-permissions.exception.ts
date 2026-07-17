import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes';
import { AppException } from './app.exception';

export class InsufficientPermissionsException extends AppException {
  constructor() {
    super(HttpStatus.FORBIDDEN, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
  }
}
