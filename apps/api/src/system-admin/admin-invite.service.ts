import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminInviteStatus, type Volunteer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  displayNameFromInviteEmail,
  normalizeAdminInviteEmail,
} from './admin-invite-email';
import { SupabaseAdminService } from './supabase-admin.service';

function adminInviteRedirectTo(): string {
  return (
    process.env.ADMIN_INVITE_REDIRECT_TO?.trim() ??
    'http://localhost:5175/dashboard'
  );
}

@Injectable()
export class AdminInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  async createInvite(input: {
    churchId: string;
    email: string;
    invitedByVolunteerId: string;
  }) {
    const email = normalizeAdminInviteEmail(input.email);
    if (!email) {
      throw new BadRequestException({
        code: 'ADMIN_INVITE_INVALID',
        message: 'A valid email address is required.',
      });
    }

    const church = await this.prisma.church.findUnique({
      where: { id: input.churchId },
      select: { id: true },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }

    const existingPending = await this.prisma.adminInvite.findFirst({
      where: {
        email,
        churchId: input.churchId,
        status: AdminInviteStatus.PENDING,
      },
    });
    if (existingPending) {
      throw new ConflictException({
        code: 'ADMIN_INVITE_ALREADY_PENDING',
        message: 'A pending admin invite already exists for this email and church.',
      });
    }

    await this.supabaseAdmin.inviteUserByEmail(email, {
      redirectTo: adminInviteRedirectTo(),
    });

    return this.prisma.adminInvite.create({
      data: {
        email,
        churchId: input.churchId,
        status: AdminInviteStatus.PENDING,
        invitedByVolunteerId: input.invitedByVolunteerId,
      },
    });
  }

  async fulfillPendingInvites(input: {
    authSubjectId: string;
    email: string;
    existingVolunteer?: Volunteer | null;
  }): Promise<Volunteer | null> {
    const email = normalizeAdminInviteEmail(input.email);
    if (!email) {
      return input.existingVolunteer ?? null;
    }

    const pendingInvites = await this.prisma.adminInvite.findMany({
      where: { email, status: AdminInviteStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });
    if (pendingInvites.length === 0) {
      return input.existingVolunteer ?? null;
    }

    return this.prisma.$transaction(async (tx) => {
      let volunteer = input.existingVolunteer ?? null;
      if (!volunteer) {
        volunteer = await tx.volunteer.create({
          data: {
            authSubjectId: input.authSubjectId,
            displayName: displayNameFromInviteEmail(email),
          },
        });
      } else if (!volunteer.authSubjectId) {
        volunteer = await tx.volunteer.update({
          where: { id: volunteer.id },
          data: { authSubjectId: input.authSubjectId },
        });
      }

      const fulfilledAt = new Date();
      for (const invite of pendingInvites) {
        await tx.adminAccreditation.upsert({
          where: {
            volunteerId_churchId: {
              volunteerId: volunteer.id,
              churchId: invite.churchId,
            },
          },
          create: {
            volunteerId: volunteer.id,
            churchId: invite.churchId,
          },
          update: {},
        });
        await tx.adminInvite.update({
          where: { id: invite.id },
          data: {
            status: AdminInviteStatus.FULFILLED,
            fulfilledVolunteerId: volunteer.id,
            fulfilledAt,
          },
        });
      }

      return volunteer;
    });
  }

  async listByChurch(churchId: string) {
    const church = await this.prisma.church.findUnique({
      where: { id: churchId },
      select: { id: true },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }

    return this.prisma.adminInvite.findMany({
      where: { churchId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        fulfilledAt: true,
      },
    });
  }

  async revokeInvite(input: { churchId: string; inviteId: string }) {
    const invite = await this.prisma.adminInvite.findFirst({
      where: { id: input.inviteId, churchId: input.churchId },
    });
    if (!invite) {
      throw new NotFoundException({
        code: 'ADMIN_INVITE_NOT_FOUND',
        message: 'Admin invite not found.',
      });
    }
    if (invite.status !== AdminInviteStatus.PENDING) {
      throw new BadRequestException({
        code: 'ADMIN_INVITE_NOT_REVOKABLE',
        message: 'Only pending admin invites can be revoked.',
      });
    }

    return this.prisma.adminInvite.update({
      where: { id: invite.id },
      data: { status: AdminInviteStatus.REVOKED },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        fulfilledAt: true,
      },
    });
  }
}
