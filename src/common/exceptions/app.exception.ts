import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    status: HttpStatus,
    code: string,
    details?: Record<string, unknown>,
  ) {
    super(
      {
        code,
        statusCode: status,
        ...(details && { details }),
      },
      status,
    );
  }
}
