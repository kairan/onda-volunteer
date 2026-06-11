import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VolunteerInviteStatus } from '@prisma/client';
import { CLOCK, type Clock } from '../common/clock';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAdminService } from '../system-admin/supabase-admin.service';
import { assertMinistryAcceptsWrites } from './ministry-write-guard';

const INVITE_TTL_DAYS = 7;

function volunteerInviteRedirectTo(): string {
  return (
    process.env.VOLUNTEER_INVITE_REDIRECT_TO?.trim() ??
    'http://localhost:5173/dashboard'
  );
}

function normalizeEmail(raw: string | undefined): string {
  const email = raw?.trim().toLowerCase();
  if (!email || !email.includes('@') || email.length < 5) {
    throw new BadRequestException({
      code: 'INVITE_EMAIL_INVALID',
      message: 'A valid email address is required.',
    });
  }
  return email;
}

@Injectable()
export class VolunteerInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async sendVolunteerInvite(input: {
    ministryId: string;
    email: string;
    auth: AuthenticatedRequestContext;
  }) {
    const ministry = await assertMinistryAcceptsWrites(
      this.prisma,
      input.ministryId,
    );
    await this.assertLeaderOrAdmin(input.auth, input.ministryId, ministry.churchId);

    const email = normalizeEmail(input.email);
    const volunteer = await input.auth.requireVolunteer();

    const existingVolunteer = await this.prisma.volunteer.findFirst({
      where: { email },
      select: { id: true, displayName: true },
    });
    if (existingVolunteer) {
      return {
        code: 'VOLUNTEER_ALREADY_EXISTS' as const,
        existingVolunteerId: existingVolunteer.id,
        displayName: existingVolunteer.displayName,
      };
    }

    const now = this.clock.now();
    const expiresAtUtc = new Date(
      now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    const existingInvite = await this.prisma.volunteerInvite.findUnique({
      where: { ministryId_email: { ministryId: input.ministryId, email } },
    });

    if (
      existingInvite &&
      existingInvite.status === VolunteerInviteStatus.PENDING &&
      existingInvite.expiresAtUtc > now
    ) {
      await this.supabaseAdmin.inviteUserByEmail(email, {
        redirectTo: volunteerInviteRedirectTo(),
      });
      const updated = await this.prisma.volunteerInvite.update({
        where: { id: existingInvite.id },
        data: { sentAtUtc: now, expiresAtUtc },
      });
      return {
        id: updated.id,
        email: updated.email,
        sentAtUtc: updated.sentAtUtc.toISOString(),
        expiresAtUtc: updated.expiresAtUtc.toISOString(),
        status: updated.status,
      };
    }

    await this.supabaseAdmin.inviteUserByEmail(email, {
      redirectTo: volunteerInviteRedirectTo(),
    });

    const invite = await this.prisma.volunteerInvite.upsert({
      where: { ministryId_email: { ministryId: input.ministryId, email } },
      create: {
        ministryId: input.ministryId,
        email,
        invitedByVolunteerId: volunteer.id,
        sentAtUtc: now,
        expiresAtUtc,
        status: VolunteerInviteStatus.PENDING,
      },
      update: {
        sentAtUtc: now,
        expiresAtUtc,
        status: VolunteerInviteStatus.PENDING,
        invitedByVolunteerId: volunteer.id,
      },
    });

    return {
      id: invite.id,
      email: invite.email,
      sentAtUtc: invite.sentAtUtc.toISOString(),
      expiresAtUtc: invite.expiresAtUtc.toISOString(),
      status: invite.status,
    };
  }

  async listMinistryInvites(input: {
    ministryId: string;
    auth: AuthenticatedRequestContext;
  }) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: input.ministryId },
      select: { churchId: true },
    });
    if (!ministry) {
      throw new NotFoundException();
    }
    await this.assertLeaderOrAdmin(input.auth, input.ministryId, ministry.churchId);

    const invites = await this.prisma.volunteerInvite.findMany({
      where: { ministryId: input.ministryId },
      orderBy: { sentAtUtc: 'desc' },
      select: {
        id: true,
        email: true,
        sentAtUtc: true,
        expiresAtUtc: true,
        status: true,
      },
    });

    return {
      invites: invites.map((row) => ({
        id: row.id,
        email: row.email,
        sentAtUtc: row.sentAtUtc.toISOString(),
        expiresAtUtc: row.expiresAtUtc.toISOString(),
        status: row.status,
      })),
    };
  }

  async searchVolunteers(input: {
    churchId: string;
    query: string;
    ministryId?: string;
    auth: AuthenticatedRequestContext;
  }) {
    if (!input.query || input.query.length < 2) {
      throw new BadRequestException({
        code: 'SEARCH_QUERY_TOO_SHORT',
        message: 'Search query must be at least 2 characters.',
      });
    }

    const church = await this.prisma.church.findUnique({
      where: { id: input.churchId },
      select: { id: true },
    });
    if (!church) {
      throw new NotFoundException();
    }

    if (input.ministryId) {
      await this.assertLeaderOrAdmin(input.auth, input.ministryId, input.churchId);
    } else {
      await input.auth.assertAdminAccreditedForChurch(input.churchId);
    }

    let excludeVolunteerIds: string[] = [];
    if (input.ministryId) {
      const existingMembers = await this.prisma.ministryMembership.findMany({
        where: {
          ministryId: input.ministryId,
          status: { in: ['ACTIVE', 'PENDING'] },
        },
        select: { volunteerId: true },
      });
      excludeVolunteerIds = existingMembers.map((m) => m.volunteerId);
    }

    const volunteers = await this.prisma.volunteer.findMany({
      where: {
        AND: [
          {
            OR: [
              { displayName: { contains: input.query, mode: 'insensitive' } },
              { email: { contains: input.query, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              {
                memberships: {
                  some: { ministry: { churchId: input.churchId } },
                },
              },
              {
                ministryLeaderships: {
                  some: { ministry: { churchId: input.churchId } },
                },
              },
              {
                adminAccreditations: {
                  some: { churchId: input.churchId },
                },
              },
            ],
          },
          ...(excludeVolunteerIds.length > 0
            ? [{ id: { notIn: excludeVolunteerIds } }]
            : []),
        ],
      },
      select: { id: true, displayName: true, email: true },
      take: 20,
      orderBy: { displayName: 'asc' },
    });

    return { volunteers };
  }

  private async assertLeaderOrAdmin(
    auth: AuthenticatedRequestContext,
    ministryId: string,
    churchId: string,
  ): Promise<void> {
    try {
      await auth.assertLeaderCanActOnMinistry(ministryId);
    } catch {
      await auth.assertAdminAccreditedForChurch(churchId);
    }
  }
}
