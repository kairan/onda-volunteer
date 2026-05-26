import { Body, Controller, Get, Patch } from '@nestjs/common';
import { AuthContext } from './auth-context.decorator';
import type { AuthenticatedRequestContext } from './authenticated-request-context';
import { IdentityService } from './identity.service';

@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Get('me')
  getMe(@AuthContext() auth: AuthenticatedRequestContext) {
    return this.identity.getMe(auth.headers);
  }

  @Patch('me')
  updateMe(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Body() body: { uiLocale?: string },
  ) {
    return this.identity.updateMe(auth.headers, body);
  }
}
