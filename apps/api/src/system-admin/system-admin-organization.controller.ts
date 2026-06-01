import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { OrganizationService } from '../organization/organization.service';

type GrantLeaderBody = {
  volunteerId?: unknown;
};

type AddMembershipBody = {
  volunteerId?: unknown;
  status?: unknown;
};

type PatchMembershipBody = {
  status?: unknown;
};

function parseVolunteerId(value: unknown): string {
  const volunteerId = typeof value === 'string' ? value.trim() : '';
  if (!volunteerId) {
    throw new BadRequestException({
      code: 'VOLUNTEER_ID_REQUIRED',
      message: 'volunteerId is required.',
    });
  }
  return volunteerId;
}

function parseAddMembershipBody(body: AddMembershipBody): {
  volunteerId: string;
  status: 'PENDING' | 'ACTIVE';
} {
  const volunteerId = parseVolunteerId(body.volunteerId);
  if (body.status !== 'PENDING' && body.status !== 'ACTIVE') {
    throw new BadRequestException({
      code: 'INVALID_STATUS',
      message: 'status must be PENDING or ACTIVE.',
    });
  }
  return { volunteerId, status: body.status };
}

function parsePatchMembershipBody(body: PatchMembershipBody): 'ACTIVE' | 'INACTIVE' {
  if (body.status === 'ACTIVE') {
    return 'ACTIVE';
  }
  if (body.status === 'INACTIVE') {
    return 'INACTIVE';
  }
  throw new BadRequestException({
    code: 'INVALID_STATUS',
    message: 'status must be ACTIVE or INACTIVE.',
  });
}

@Controller('system-admin/ministries')
export class SystemAdminOrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Post(':ministryId/leaders')
  @HttpCode(HttpStatus.CREATED)
  async grantLeader(
    @Param('ministryId') ministryId: string,
    @Body() body: GrantLeaderBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    const volunteerId = parseVolunteerId(body.volunteerId);
    return this.organization.grantMinistryLeader({
      ministryId,
      volunteerId,
      auth,
      systemAdminActor: true,
    });
  }

  @Delete(':ministryId/leaders/:volunteerId')
  @HttpCode(HttpStatus.OK)
  async revokeLeader(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    return this.organization.revokeMinistryLeader({
      ministryId,
      volunteerId,
      auth,
      systemAdminActor: true,
    });
  }

  @Post(':ministryId/memberships')
  @HttpCode(HttpStatus.CREATED)
  async addMembership(
    @Param('ministryId') ministryId: string,
    @Body() body: AddMembershipBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    const parsed = parseAddMembershipBody(body);
    return this.organization.addMinistryMembership({
      ministryId,
      volunteerId: parsed.volunteerId,
      status: parsed.status,
      auth,
      systemAdminActor: true,
    });
  }

  @Patch(':ministryId/memberships/:volunteerId')
  @HttpCode(HttpStatus.OK)
  async patchMembership(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @Body() body: PatchMembershipBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    const status = parsePatchMembershipBody(body);
    if (status === 'ACTIVE') {
      return this.organization.activateMinistryMembership({
        ministryId,
        volunteerId,
        auth,
        systemAdminActor: true,
      });
    }
    return this.organization.deactivateMinistryMembership({
      ministryId,
      volunteerId,
      auth,
      systemAdminActor: true,
    });
  }
}
