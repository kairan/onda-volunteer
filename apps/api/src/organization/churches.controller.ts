import { Body, Controller, Param, Patch } from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { OrganizationService } from './organization.service';

type PatchChurchBody = {
  name?: unknown;
  defaultTimezone?: unknown;
};

@Controller('churches')
export class ChurchesController {
  constructor(private readonly organization: OrganizationService) {}

  @Patch(':churchId')
  updateMetadata(
    @Param('churchId') churchId: string,
    @Body() body: PatchChurchBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.updateChurchMetadata({
      churchId,
      name: typeof body.name === 'string' ? body.name : undefined,
      defaultTimezone:
        typeof body.defaultTimezone === 'string' ? body.defaultTimezone : undefined,
      auth,
    });
  }
}
