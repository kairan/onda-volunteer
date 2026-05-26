import {
  Controller,
  Get,
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

  @Get(':ministryId/memberships')
  listMemberships(
    @Param('ministryId') ministryId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.organization.listMinistryMemberships({
      ministryId,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Get(':ministryId/leaders')
  listLeaders(
    @Param('ministryId') ministryId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.organization.listMinistryLeaders({
      ministryId,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerIdHeader,
    });
  }

  @Post(':ministryId/leaders/:volunteerId')
  @HttpCode(HttpStatus.CREATED)
  grantLeader(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.organization.grantMinistryLeader({
      ministryId,
      volunteerId,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerIdHeader,
    });
  }

  @Post(':ministryId/leaders/:volunteerId/revoke')
  @HttpCode(HttpStatus.OK)
  revokeLeader(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.organization.revokeMinistryLeader({
      ministryId,
      volunteerId,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerIdHeader,
    });
  }

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
