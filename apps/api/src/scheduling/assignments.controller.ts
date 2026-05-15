import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';

type CreateUnavailabilityBody = {
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

@Controller()
export class AssignmentsController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Post('assignments/:assignmentId/release')
  @HttpCode(HttpStatus.OK)
  releaseAssignment(
    @Param('assignmentId') assignmentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerId: string | undefined,
  ) {
    return this.scheduling.releaseAssignment({
      assignmentId,
      authorizationHeader: authorization,
      volunteerIdHeader: volunteerId,
    });
  }

  @Post('volunteers/:volunteerId/unavailability')
  @HttpCode(HttpStatus.CREATED)
  createUnavailability(
    @Param('volunteerId') volunteerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
    @Body() body: CreateUnavailabilityBody,
  ) {
    return this.scheduling.createUnavailability({
      volunteerId,
      authorizationHeader: authorization,
      volunteerIdHeader,
      ministryId: body.ministryId,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }
}
