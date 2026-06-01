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
import { AuthContext } from '../identity/auth-context.decorator';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { OrganizationService } from '../organization/organization.service';

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

@Controller('system-admin')
export class SystemAdminOrganizationController {
  constructor(private readonly organization: OrganizationService) {}

  @Post('ministries/:ministryId/leaders')
  @HttpCode(HttpStatus.CREATED)
  async grantLeader(
    @Param('ministryId') ministryId: string,
    @Body() body: { volunteerId?: string },
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    const volunteerId = body.volunteerId?.trim();
    if (!volunteerId) {
      throw new BadRequestException({
        code: 'VOLUNTEER_ID_REQUIRED',
        message: 'volunteerId is required.',
      });
    }
    return this.organization.grantMinistryLeader({
      ministryId,
      volunteerId,
      auth,
      asSystemAdmin: true,
    });
  }

  @Delete('ministries/:ministryId/leaders/:volunteerId')
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
      asSystemAdmin: true,
    });
  }

  @Post('ministries/:ministryId/memberships')
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
      asSystemAdmin: true,
    });
  }

  @Patch('ministries/:ministryId/memberships/:volunteerId')
  @HttpCode(HttpStatus.OK)
  async patchMembership(
    @Param('ministryId') ministryId: string,
    @Param('volunteerId') volunteerId: string,
    @Body() body: { status?: string },
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    if (body.status === 'ACTIVE') {
      return this.organization.activateMinistryMembership({
        ministryId,
        volunteerId,
        auth,
        asSystemAdmin: true,
      });
    }
    if (body.status === 'INACTIVE') {
      return this.organization.deactivateMinistryMembership({
        ministryId,
        volunteerId,
        auth,
        asSystemAdmin: true,
      });
    }
    throw new BadRequestException({
      code: 'INVALID_STATUS',
      message: 'status must be ACTIVE or INACTIVE.',
    });
  }
}
