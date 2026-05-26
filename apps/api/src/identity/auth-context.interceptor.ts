import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { authHeadersFromRequest } from './authenticated-request-context';
import { AuthContextResolverService } from './auth-context-resolver.service';

type RequestWithAuth = {
  authenticatedRequestContext?: ReturnType<
    AuthContextResolverService['fromHeaders']
  >;
  headers: Record<string, string | string[] | undefined>;
};

@Injectable()
export class AuthContextInterceptor implements NestInterceptor {
  constructor(private readonly resolver: AuthContextResolverService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    if (!request.authenticatedRequestContext) {
      request.authenticatedRequestContext = this.resolver.fromHeaders(
        authHeadersFromRequest(request),
      );
    }
    return next.handle();
  }
}
