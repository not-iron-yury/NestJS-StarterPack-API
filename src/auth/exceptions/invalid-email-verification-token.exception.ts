import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions';
import { AUTH_ERROR_CODES } from '../constants/auth-error-codes';

export class InvalidEmailVerificationTokenException extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      AUTH_ERROR_CODES.INVALID_EMAIL_VERIFICATION_TOKEN,
    );
  }
}
