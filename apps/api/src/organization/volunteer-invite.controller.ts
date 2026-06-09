import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { VolunteerInviteService } from './volunteer-invite.service';

@Controller()
export class VolunteerInviteController {
  constructor(private readonly inviteService: VolunteerInviteService) {}

  @Post('ministries/:ministryId/invites')
  @HttpCode(HttpStatus.OK)
  sendInvite(
    @Param('ministryId') ministryId: string,
    @Body() body: { email?: string },
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    if (!body.email || typeof body.email !== 'string') {
      throw new BadRequestException({
        code: 'INVITE_EMAIL_INVALID',
        message: 'A valid email address is required.',
      });
    }
    return this.inviteService.sendVolunteerInvite({
      ministryId,
      email: body.email,
      auth,
    });
  }

  @Get('ministries/:ministryId/invites')
  listInvites(
    @Param('ministryId') ministryId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.inviteService.listMinistryInvites({ ministryId, auth });
  }

  @Get('churches/:churchId/volunteers/search')
  searchVolunteers(
    @Param('churchId') churchId: string,
    @Query('q') query: string,
    @Query('ministryId') ministryId: string | undefined,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.inviteService.searchVolunteers({
      churchId,
      query,
      ministryId,
      auth,
    });
  }
}
