import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CLOCK, type Clock } from '../common/clock';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async deactivateMinistryMembership(input: {
    ministryId: string;
    volunteerId: string;
    leaderMinistryIdHeader: string | undefined;
  }) {
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
        message: 'Leader ministry scope does not match this membership ministry.',
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
      throw new NotFoundException();
    }
    if (membership.status !== 'ACTIVE') {
      throw new BadRequestException({
        code: 'MEMBERSHIP_NOT_ACTIVE',
        message: 'Only Active ministry membership can be deactivated.',
      });
    }

    const now = this.clock.now();

    await this.prisma.$transaction(async (tx) => {
      await tx.ministryMembership.update({
        where: { id: membership.id },
        data: { status: 'INACTIVE' },
      });

      const assignments = await tx.assignment.findMany({
        where: {
          volunteerId: input.volunteerId,
          ministryId: input.ministryId,
          voidedAtUtc: null,
        },
        include: { event: true },
      });

      for (const assignment of assignments) {
        if (assignment.event.endsAtUtc > now) {
          await tx.assignment.update({
            where: { id: assignment.id },
            data: { voidedAtUtc: now },
          });
        }
      }
    });

    return {
      volunteerId: input.volunteerId,
      ministryId: input.ministryId,
      status: 'INACTIVE' as const,
    };
  }
}
