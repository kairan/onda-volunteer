import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('ministries')
export class OrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Get(':id/members')
  getMembers(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.organization.getMinistryMembers({
      ministryId: id,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Get(':id/roles')
  getRoles(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.organization.getMinistryRoles({
      ministryId: id,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Post(':id/roles')
  @HttpCode(HttpStatus.CREATED)
  createRole(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
    @Body() body: { name: string },
  ) {
    return this.organization.createMinistryRole({
      ministryId: id,
      name: body.name,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Patch(':id/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  updateRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
    @Body() body: { name?: string; retired?: boolean },
  ) {
    return this.organization.updateMinistryRole({
      ministryId: id,
      roleId,
      name: body.name,
      retired: body.retired,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
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
