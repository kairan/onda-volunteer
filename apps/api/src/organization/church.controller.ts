import { Body, Controller, Patch, Param } from '@nestjs/common';
import { AuthContext } from '../identity/auth-context.decorator';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { OrganizationService } from './organization.service';

@Controller('churches')
export class ChurchController {
  constructor(private readonly organization: OrganizationService) {}

  @Patch(':churchId')
  updateChurch(
    @Param('churchId') churchId: string,
    @Body() body: { name?: string; defaultTimezone?: string },
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.updateChurchMetadata({
      churchId,
      name: body.name,
      defaultTimezone: body.defaultTimezone,
      auth,
    });
  }
}
