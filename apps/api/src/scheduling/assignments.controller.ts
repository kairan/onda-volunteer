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
import { SchedulingService } from './scheduling.service';

type CreateUnavailabilityBody = {
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

@Controller()
export class AssignmentsController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Get('volunteers/:volunteerId/assignments')
  getVolunteerAssignments(
    @Param('volunteerId') volunteerId: string,
    @Query('churchId') churchId: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.scheduling.getVolunteerAssignments({
      volunteerId,
      churchId,
      authorizationHeader: authorization,
      volunteerIdHeader,
    });
  }

  @Get('volunteers/:volunteerId/unavailability')
  getVolunteerUnavailability(
    @Param('volunteerId') volunteerId: string,
    @Query('churchId') churchId: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
  ) {
    return this.scheduling.getVolunteerUnavailability({
      volunteerId,
      churchId,
      authorizationHeader: authorization,
      volunteerIdHeader,
    });
  }

  @Post('volunteers/:volunteerId/unavailability/bulk')
  @HttpCode(HttpStatus.CREATED)
  createBulkUnavailability(
    @Param('volunteerId') volunteerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerIdHeader: string | undefined,
    @Body()
    body: {
      ministryIds: string[];
      startsAtUtc: string;
      endsAtUtc: string;
    },
  ) {
    return this.scheduling.createBulkUnavailability({
      volunteerId,
      authorizationHeader: authorization,
      volunteerIdHeader,
      ministryIds: body.ministryIds,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }

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
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
    @Body() body: { ministryId: string; startsAtUtc: string; endsAtUtc: string },
  ) {
    return this.scheduling.createUnavailability({
      volunteerId,
      authorizationHeader: authorization,
      volunteerIdHeader,
      leaderMinistryIdHeader: leaderMinistryId,
      ministryId: body.ministryId,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }
}
