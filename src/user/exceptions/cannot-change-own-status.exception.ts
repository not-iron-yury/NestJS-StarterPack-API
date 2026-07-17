import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions';
import { USER_ERROR_CODES } from 'src/user/constants/user-error-codes';

export class CannotChangeOwnStatusException extends AppException {
  constructor() {
    super(HttpStatus.CONFLICT, USER_ERROR_CODES.CANNOT_CHANGE_OWN_STATUS);
  }
}
