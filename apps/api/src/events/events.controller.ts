import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
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

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.events.getEventDetail(id);
  }

  @Post(':id/assignments')
  createAssignment(
    @Param('id') eventId: string,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
    @Body() body: CreateAssignmentBody,
  ) {
    return this.scheduling.createAssignment({
      eventId,
      leaderMinistryIdHeader: leaderMinistryId,
      volunteerId: body.volunteerId,
      ministryId: body.ministryId,
      roleId: body.roleId,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }
}
