import { Controller, Get } from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationContextController {
  constructor(private readonly organization: OrganizationService) {}

  @Get('context')
  getContext(@AuthContext() auth: AuthenticatedRequestContext) {
    return this.organization.getAccessibleOrganizationContext(auth);
  }
}
