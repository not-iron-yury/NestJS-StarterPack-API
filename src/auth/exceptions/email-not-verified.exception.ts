import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions';
import { AUTH_ERROR_CODES } from '../constants/auth-error-codes';

export class EmailNotVerifiedException extends AppException {
  constructor() {
    super(HttpStatus.FORBIDDEN, AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED);
  }
}
