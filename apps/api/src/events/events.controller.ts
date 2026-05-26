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

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelEvent(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.events.cancelEvent({
      eventId: id,
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerIdHeader,
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
