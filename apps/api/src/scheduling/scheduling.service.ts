import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import { PrismaService } from '../prisma/prisma.service';

export type CreateAssignmentInput = {
  eventId: string;
  leaderMinistryIdHeader: string | undefined;
  volunteerId: string;
  ministryId: string;
  roleId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

function parseInstant(label: string, iso: string): Date {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException({
      code: 'INVALID_INSTANT',
      message: `${label} must be a valid ISO-8601 instant`,
    });
  }
  return d;
}

/** Half-open overlap on UTC instants: [a0,a1) overlaps [b0,b1) iff a0 < b1 && b0 < a1 */
function halfOpenIntervalsOverlap(a0: Date, a1: Date, b0: Date, b1: Date): boolean {
  return a0 < b1 && b0 < a1;
}

export type ReleaseAssignmentInput = {
  assignmentId: string;
  volunteerIdHeader: string | undefined;
};

export type CreateUnavailabilityInput = {
  volunteerId: string;
  volunteerIdHeader: string | undefined;
  ministryId: string;
  startsAtUtc: string;
  endsAtUtc: string;
};

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async createAssignment(input: CreateAssignmentInput) {
    if (!input.leaderMinistryIdHeader?.trim()) {
      throw new ForbiddenException({
        code: 'LEADER_MINISTRY_REQUIRED',
        message:
          'Missing X-Leader-Ministry-Id header (non-production dev gate for ministry-scoped leader actions).',
      });
    }
    if (input.leaderMinistryIdHeader !== input.ministryId) {
      throw new ForbiddenException({
        code: 'LEADER_MINISTRY_MISMATCH',
        message: 'Leader ministry scope does not match this assignment ministry.',
      });
    }

    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
      include: { church: true },
    });
    if (!event) {
      throw new NotFoundException();
    }
    if (event.kind !== 'PUBLIC') {
      throw new BadRequestException({
        code: 'EVENT_NOT_PUBLIC',
        message: 'Assignments in this slice are limited to public events.',
      });
    }

    const a0 = parseInstant('startsAtUtc', input.startsAtUtc);
    const a1 = parseInstant('endsAtUtc', input.endsAtUtc);
    if (!(a0 < a1)) {
      throw new BadRequestException({
        code: 'INVALID_ASSIGNMENT_WINDOW',
        message: 'Assignment window must have startsAtUtc strictly before endsAtUtc.',
      });
    }

    if (a0 < event.startsAtUtc || a1 > event.endsAtUtc) {
      throw new BadRequestException({
        code: 'ASSIGNMENT_OUTSIDE_EVENT',
        message: 'Assignment interval must lie fully within the event UTC window.',
      });
    }

    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
    });
    if (!ministry || ministry.churchId !== event.churchId) {
      throw new BadRequestException({
        code: 'MINISTRY_NOT_ON_EVENT_CHURCH',
        message: 'Ministry must belong to the same church as the event.',
      });
    }

    const membership = await this.prisma.ministryMembership.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
        },
      },
    });
    if (!membership || membership.status !== 'ACTIVE') {
      throw new BadRequestException({
        code: 'MEMBERSHIP_NOT_ACTIVE',
        message: 'Volunteer must have Active ministry membership for this ministry.',
      });
    }

    const role = await this.prisma.ministryRole.findUnique({
      where: { id: input.roleId },
    });
    if (!role || role.ministryId !== input.ministryId) {
      throw new BadRequestException({
        code: 'ROLE_NOT_IN_MINISTRY',
        message: 'Role must belong to the assignment ministry.',
      });
    }
    if (role.retired) {
      throw new BadRequestException({
        code: 'ROLE_RETIRED',
        message: 'Retired roles cannot be used for new assignments.',
      });
    }

    const blocks = await this.prisma.unavailability.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
      },
    });
    for (const u of blocks) {
      if (halfOpenIntervalsOverlap(a0, a1, u.startsAtUtc, u.endsAtUtc)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            code: 'UNAVAILABILITY_BLOCKS_ASSIGN',
            message:
              'This volunteer is unavailable for this ministry during the selected time.',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    const otherMinistryAssignments = await this.prisma.assignment.findMany({
      where: {
        volunteerId: input.volunteerId,
        ministryId: { not: input.ministryId },
        voidedAtUtc: null,
      },
    });
    for (const ex of otherMinistryAssignments) {
      if (halfOpenIntervalsOverlap(a0, a1, ex.startsAtUtc, ex.endsAtUtc)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            code: 'CROSS_MINISTRY_DOUBLE_BOOKING',
            message:
              'This volunteer is already rostered in another ministry for an overlapping time (UTC half-open intervals).',
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    const created = await this.prisma.assignment.create({
      data: {
        eventId: input.eventId,
        ministryId: input.ministryId,
        volunteerId: input.volunteerId,
        roleId: input.roleId,
        startsAtUtc: a0,
        endsAtUtc: a1,
      },
    });

    return {
      id: created.id,
      volunteerId: created.volunteerId,
      ministryId: created.ministryId,
      roleId: created.roleId,
      window: {
        startsAtUtc: created.startsAtUtc.toISOString(),
        endsAtUtc: created.endsAtUtc.toISOString(),
      },
    };
  }

  async releaseAssignment(input: ReleaseAssignmentInput) {
    if (!input.volunteerIdHeader?.trim()) {
      throw new ForbiddenException({
        code: 'VOLUNTEER_ID_REQUIRED',
        message:
          'Missing X-Volunteer-Id header (non-production dev gate for volunteer-scoped actions).',
      });
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: input.assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException();
    }
    if (assignment.volunteerId !== input.volunteerIdHeader) {
      throw new ForbiddenException({
        code: 'ASSIGNMENT_NOT_OWNED',
        message: 'Volunteers may only release their own assignments.',
      });
    }
    if (assignment.voidedAtUtc !== null) {
      throw new BadRequestException({
        code: 'ASSIGNMENT_ALREADY_VOIDED',
        message: 'This assignment is no longer an active commitment.',
      });
    }

    const now = this.clock.now();
    const updated = await this.prisma.assignment.update({
      where: { id: assignment.id },
      data: { voidedAtUtc: now },
    });

    return {
      id: updated.id,
      voidedAtUtc: updated.voidedAtUtc!.toISOString(),
      ministryId: updated.ministryId,
      window: {
        startsAtUtc: updated.startsAtUtc.toISOString(),
        endsAtUtc: updated.endsAtUtc.toISOString(),
      },
    };
  }

  async createUnavailability(input: CreateUnavailabilityInput) {
    if (!input.volunteerIdHeader?.trim()) {
      throw new ForbiddenException({
        code: 'VOLUNTEER_ID_REQUIRED',
        message:
          'Missing X-Volunteer-Id header (non-production dev gate for volunteer-scoped actions).',
      });
    }
    if (input.volunteerIdHeader !== input.volunteerId) {
      throw new ForbiddenException({
        code: 'VOLUNTEER_MISMATCH',
        message: 'Volunteer scope does not match this request.',
      });
    }

    const u0 = parseInstant('startsAtUtc', input.startsAtUtc);
    const u1 = parseInstant('endsAtUtc', input.endsAtUtc);
    if (!(u0 < u1)) {
      throw new BadRequestException({
        code: 'INVALID_UNAVAILABILITY_WINDOW',
        message:
          'Unavailability window must have startsAtUtc strictly before endsAtUtc.',
      });
    }

    const membership = await this.prisma.ministryMembership.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
        },
      },
    });
    if (!membership) {
      throw new BadRequestException({
        code: 'MEMBERSHIP_REQUIRED',
        message:
          'Volunteer must have ministry membership before recording unavailability.',
      });
    }

    const created = await this.prisma.unavailability.create({
      data: {
        volunteerId: input.volunteerId,
        ministryId: input.ministryId,
        startsAtUtc: u0,
        endsAtUtc: u1,
      },
    });

    return {
      id: created.id,
      ministryId: created.ministryId,
      window: {
        startsAtUtc: created.startsAtUtc.toISOString(),
        endsAtUtc: created.endsAtUtc.toISOString(),
      },
    };
  }
}
