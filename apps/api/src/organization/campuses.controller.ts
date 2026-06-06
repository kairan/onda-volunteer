import { Body, Controller, Param, Patch } from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { OrganizationService } from './organization.service';

type PatchCampusBody = {
  name?: unknown;
  timezone?: unknown;
};

@Controller('campuses')
export class CampusesController {
  constructor(private readonly organization: OrganizationService) {}

  @Patch(':campusId')
  updateMetadata(
    @Param('campusId') campusId: string,
    @Body() body: PatchCampusBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.updateCampusMetadata({
      campusId,
      name: typeof body.name === 'string' ? body.name : undefined,
      timezone: typeof body.timezone === 'string' ? body.timezone : undefined,
      auth,
    });
  }
}
