import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { OrganizationService } from './organization.service';

type AddMembershipBody = {
  volunteerId?: unknown;
  status?: unknown;
};

function parseAddMembershipBody(body: AddMembershipBody): {
  volunteerId: string;
  status: 'PENDING' | 'ACTIVE';
} {
  const volunteerId =
    typeof body.volunteerId === 'string' ? body.volunteerId.trim() : '';
  if (!volunteerId) {
    throw new BadRequestException({
      code: 'VOLUNTEER_ID_REQUIRED',
      message: 'volunteerId is required.',
    });
  }
  if (body.status !== 'PENDING' && body.status !== 'ACTIVE') {
    throw new BadRequestException({
      code: 'INVALID_STATUS',
      message: 'status must be PENDING or ACTIVE.',
    });
  }
  return { volunteerId, status: body.status };
}

@Controller('ministries')
export class OrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Get(':ministryId/memberships')
  listMemberships(
    @Param('ministryId') ministryId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.listMinistryMemberships({ ministryId, auth });
  }

  @Get(':ministryId/leaders')
  listLeaders(
    @Param('ministryId') ministryId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.listMinistryLeaders({ ministryId, auth });
  }

  @Post(':ministryId/memberships')
  @HttpCode(HttpStatus.CREATED)
  addMembership(
    @Param('ministryId') ministryId: string,
    @Body() body: AddMembershipBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    const parsed = parseAddMembershipBody(body);
    return this.organization.addMinistryMembership({
      ministryId,
      volunteerId: parsed.volunteerId,
      status: parsed.status,
      auth,
    });
  }

  @Post(':ministryId/leaders/:volunteerId')
  @HttpCode(HttpStatus.CREATED)
  grantLeader(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.grantMinistryLeader({
      ministryId,
      volunteerId,
      auth,
    });
  }

  @Post(':ministryId/leaders/:volunteerId/revoke')
  @HttpCode(HttpStatus.OK)
  revokeLeader(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.revokeMinistryLeader({
      ministryId,
      volunteerId,
      auth,
    });
  }

  @Post(':ministryId/memberships/:volunteerId/activate')
  @HttpCode(HttpStatus.OK)
  activateMembership(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.activateMinistryMembership({
      ministryId,
      volunteerId,
      auth,
    });
  }

  @Post(':ministryId/memberships/:volunteerId/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateMembership(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.deactivateMinistryMembership({
      ministryId,
      volunteerId,
      auth,
    });
  }
}
