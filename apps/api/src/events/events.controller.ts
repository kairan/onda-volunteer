import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SchedulingService } from '../scheduling/scheduling.service';
import { EventsService } from './events.service';

type CreateAssignmentBody = {
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

@Controller('events')
export class EventsController {
  constructor(
    private readonly events: EventsService,
    private readonly scheduling: SchedulingService,
  ) {}

  @Post()
  createEvent(
    @Body()
    body: {
      kind: 'PRIVATE';
      ministryId: string;
      title: string;
      startsAtUtc: string;
      endsAtUtc: string;
    },
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    if (body.kind !== 'PRIVATE') {
      throw new BadRequestException({
        code: 'PRIVATE_EVENT_ONLY',
        message: 'POST /events only supports PRIVATE events in this release.',
      });
    }
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
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerIdHeader,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Get()
  listEvents(
    @Query('churchId') churchId: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.events.listEvents({
      churchId,
      authorizationHeader: authorization,
      volunteerIdHeader,
    });
  }

  @Get(':id')
  getDetail(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.events.getEventDetail({
      id,
      authorizationHeader: authorization,
      volunteerIdHeader,
    });
  }

  @Post(':id/assignments')
  createAssignment(
    @Param('id') eventId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
    @Body() body: CreateAssignmentBody,
  ) {
    return this.scheduling.createAssignment({
      eventId,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
      volunteerId: body.volunteerId,
      ministryId: body.ministryId,
      roleId: body.roleId,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }
}
