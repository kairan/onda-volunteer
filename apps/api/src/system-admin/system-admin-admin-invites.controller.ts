import {
  Body,
  Controller,
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
