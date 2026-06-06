import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { SchedulingService } from './scheduling.service';

type CreateAssignmentBody = {
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

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
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.scheduling.getVolunteerAssignments({
      volunteerId,
      churchId,
      auth,
    });
  }

  @Post('events/:eventId/assignments')
  @HttpCode(HttpStatus.CREATED)
  createAssignment(
    @Param('eventId') eventId: string,
    @Body() body: CreateAssignmentBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.scheduling.createAssignment({
      eventId,
      auth,
      volunteerId: body.volunteerId,
      ministryId: body.ministryId,
      roleId: body.roleId,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }

  @Get('volunteers/:volunteerId/unavailability')
  getVolunteerUnavailability(
    @Param('volunteerId') volunteerId: string,
    @Query('churchId') churchId: string | undefined,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.scheduling.getVolunteerUnavailability({
      volunteerId,
      churchId,
      auth,
    });
  }

  @Patch('unavailability/:unavailabilityId')
  updateUnavailability(
    @Param('unavailabilityId') unavailabilityId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
    @Body() body: { startsAtUtc: string; endsAtUtc: string },
  ) {
    return this.scheduling.updateUnavailability({
      unavailabilityId,
      auth,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }

  @Delete('unavailability/:unavailabilityId')
  @HttpCode(HttpStatus.OK)
  deleteUnavailability(
    @Param('unavailabilityId') unavailabilityId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.scheduling.deleteUnavailability({
      unavailabilityId,
      auth,
    });
  }

  @Post('volunteers/:volunteerId/unavailability/bulk')
  async createBulkUnavailability(
    @Res({ passthrough: true }) res: Response,
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
    @Body()
    body: {
      ministryIds: string[];
      startsAtUtc: string;
      endsAtUtc: string;
    },
  ) {
    const result = await this.scheduling.createBulkUnavailability({
      volunteerId,
      auth,
      ministryIds: body.ministryIds,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
    res.status(
      result.createdCount > 0 ? HttpStatus.CREATED : HttpStatus.OK,
    );
    return result;
  }

  @Post('assignments/:assignmentId/release')
  @HttpCode(HttpStatus.OK)
  releaseAssignment(
    @Param('assignmentId') assignmentId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.scheduling.releaseAssignment({
      assignmentId,
      auth,
    });
  }

  @Post('assignments/:assignmentId/void')
  @HttpCode(HttpStatus.OK)
  voidAssignment(
    @Param('assignmentId') assignmentId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.scheduling.voidAssignment({
      assignmentId,
      auth,
    });
  }

  @Post('volunteers/:volunteerId/unavailability')
  @HttpCode(HttpStatus.CREATED)
  createUnavailability(
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
    @Body() body: CreateUnavailabilityBody,
  ) {
    return this.scheduling.createUnavailability({
      volunteerId,
      auth,
      ministryId: body.ministryId,
      startsAtUtc: body.startsAtUtc,
      endsAtUtc: body.endsAtUtc,
    });
  }
}
