import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
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
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerId: string | undefined,
    @Body()
    body: {
      kind: 'PUBLIC' | 'PRIVATE';
      title: string;
      startsAtUtc: string;
      endsAtUtc: string;
      churchId: string;
      ministryId?: string;
    },
  ) {
    return this.events.createEvent({
      ...body,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerId,
    });
  }

  @Get()
  getEvents(
    @Query('churchId') churchId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerId: string | undefined,
  ) {
    return this.events.getEvents({
      churchId,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerId,
    });
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.events.getEventDetail(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelEvent(
    @Param('id') eventId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerId: string | undefined,
  ) {
    return this.events.cancelEvent({
      eventId,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerId,
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
