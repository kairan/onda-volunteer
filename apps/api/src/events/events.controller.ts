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
import { EventsService } from './events.service';

type CreateEventBody =
  | {
      kind: 'PUBLIC';
      churchId: string;
      title: string;
      startsAtUtc: string;
      endsAtUtc: string;
    }
  | {
      kind: 'PRIVATE';
      ministryId: string;
      title: string;
      startsAtUtc: string;
      endsAtUtc: string;
    };

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  createEvent(
    @Body() body: CreateEventBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    if (body.kind === 'PUBLIC') {
      if (!body.churchId) {
        throw new BadRequestException({
          code: 'CHURCH_ID_REQUIRED',
          message: 'churchId is required for public events.',
        });
      }
      return this.events.createPublicEvent({
        churchId: body.churchId,
        title: body.title,
        startsAtUtc: body.startsAtUtc,
        endsAtUtc: body.endsAtUtc,
        auth,
      });
    }

    if (body.kind === 'PRIVATE') {
      if (!body.ministryId) {
        throw new BadRequestException({
          code: 'MINISTRY_ID_REQUIRED',
          message: 'ministryId is required for private events.',
        });
      }
      return this.events.createPrivateEvent({
        ministryId: body.ministryId,
        title: body.title,
        startsAtUtc: body.startsAtUtc,
        endsAtUtc: body.endsAtUtc,
        auth,
      });
    }

    throw new BadRequestException({
      code: 'INVALID_EVENT_KIND',
      message: 'kind must be PUBLIC or PRIVATE.',
    });
  }

  @Get()
  listEvents(
    @Query('churchId') churchId: string | undefined,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.events.listEvents({ churchId, auth });
  }

  @Get(':id')
  getDetail(
    @Param('id') id: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.events.getEventDetail({ id, auth });
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelEvent(
    @Param('id') id: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.events.cancelEvent({ eventId: id, auth });
  }
}
