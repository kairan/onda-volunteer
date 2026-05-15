import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('ministries')
export class OrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Post(':ministryId/memberships/:volunteerId/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateMembership(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.organization.deactivateMinistryMembership({
      ministryId,
      volunteerId,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }
}
