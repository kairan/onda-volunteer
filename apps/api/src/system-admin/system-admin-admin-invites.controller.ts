import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AuthContext } from '../identity/auth-context.decorator';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AdminInviteService } from './admin-invite.service';

@Controller('system-admin/churches/:churchId/admin-invites')
export class SystemAdminAdminInvitesController {
  constructor(private readonly adminInvites: AdminInviteService) {}

  @Get()
  async list(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Param('churchId') churchId: string,
  ) {
    await auth.assertSystemAdmin();
    const rows = await this.adminInvites.listByChurch(churchId);
    return {
      items: rows.map((row) => ({
        id: row.id,
        email: row.email,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        fulfilledAt: row.fulfilledAt?.toISOString() ?? null,
      })),
    };
  }

  @Delete(':inviteId')
  @HttpCode(HttpStatus.OK)
  async revoke(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Param('churchId') churchId: string,
    @Param('inviteId') inviteId: string,
  ) {
    await auth.assertSystemAdmin();
    const invite = await this.adminInvites.revokeInvite({ churchId, inviteId });
    return {
      id: invite.id,
      email: invite.email,
      status: invite.status,
      createdAt: invite.createdAt.toISOString(),
      fulfilledAt: invite.fulfilledAt?.toISOString() ?? null,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Param('churchId') churchId: string,
    @Body() body: { email?: string },
  ) {
    const operator = await auth.assertSystemAdmin();
    const invite = await this.adminInvites.createInvite({
      churchId,
      email: body.email ?? '',
      invitedByVolunteerId: operator.id,
    });
    return {
      id: invite.id,
      email: invite.email,
      churchId: invite.churchId,
      status: invite.status,
      createdAt: invite.createdAt.toISOString(),
    };
  }
}
