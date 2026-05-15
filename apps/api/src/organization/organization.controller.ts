import { Controller, Headers, Param, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('ministries')
export class OrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Post(':ministryId/memberships/:volunteerId/deactivate')
  deactivateMembership(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.organization.deactivateMinistryMembership({
      ministryId,
      volunteerId,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }
}
