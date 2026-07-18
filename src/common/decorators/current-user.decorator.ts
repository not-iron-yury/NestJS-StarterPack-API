import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, JwtPayload } from 'src/auth/types';

export const CurrentUser = createParamDecorator<keyof JwtPayload | undefined>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return data ? user[data] : user;
  },
);
