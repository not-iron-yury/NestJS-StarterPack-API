import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions';
import { USER_ERROR_CODES } from 'src/user/constants/user-error-codes';

export class UserNotFoundException extends AppException {
  constructor() {
    super(HttpStatus.NOT_FOUND, USER_ERROR_CODES.USER_NOT_FOUND);
  }
}
