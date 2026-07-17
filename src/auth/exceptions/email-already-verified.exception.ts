import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions';
import { AUTH_ERROR_CODES } from '../constants/auth-error-codes';

export class EmailAlreadyVerifiedException extends AppException {
  constructor() {
    super(HttpStatus.CONFLICT, AUTH_ERROR_CODES.EMAIL_ALREADY_VERIFIED);
  }
}
