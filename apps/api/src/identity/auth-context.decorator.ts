import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequestContext } from './authenticated-request-context';

type RequestWithAuth = {
  authenticatedRequestContext?: AuthenticatedRequestContext;
};

export const AuthContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedRequestContext => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
    if (!request.authenticatedRequestContext) {
      throw new Error(
        'AuthenticatedRequestContext missing; ensure AuthContextInterceptor is registered.',
      );
    }
    return request.authenticatedRequestContext;
  },
);
