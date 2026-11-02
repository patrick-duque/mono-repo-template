import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { type JwtPayload } from '../dtos';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);

export default AuthUser;
