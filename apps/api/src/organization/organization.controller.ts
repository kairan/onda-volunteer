import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';

type AddMembershipBody = {
  volunteerId: string;
  status: 'PENDING' | 'ACTIVE';
};

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

  @Post(':ministryId/memberships')
  @HttpCode(HttpStatus.CREATED)
  addMembership(
    @Param('ministryId') ministryId: string,
    @Body() body: AddMembershipBody,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.organization.addMinistryMembership({
      ministryId,
      volunteerId: body.volunteerId,
      status: body.status,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerIdHeader,
    });
  }

  @Post(':ministryId/memberships/:volunteerId/activate')
  @HttpCode(HttpStatus.OK)
  activateMembership(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.organization.activateMinistryMembership({
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
