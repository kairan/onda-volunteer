import { Injectable } from '@nestjs/common';
import { VolunteerInviteStatus, type Volunteer } from '@prisma/client';
import {
  displayNameFromInviteEmail,
  normalizeAdminInviteEmail,
} from '../system-admin/admin-invite-email';
import { PrismaService } from '../prisma/prisma.service';

export type FulfilledVolunteerInviteSummary = {
  ministryId: string;
  ministryName: string;
};

export type VolunteerInviteFulfillmentResult = {
  volunteer: Volunteer | null;
  newlyFulfilledInvites: FulfilledVolunteerInviteSummary[];
};

@Injectable()
export class VolunteerInviteFulfillmentService {
  constructor(private readonly prisma: PrismaService) {}

  async fulfillPendingInvites(input: {
    authSubjectId: string;
    email: string;
    existingVolunteer?: Volunteer | null;
  }): Promise<VolunteerInviteFulfillmentResult> {
    const email = normalizeAdminInviteEmail(input.email);
    if (!email) {
      return {
        volunteer: input.existingVolunteer ?? null,
        newlyFulfilledInvites: [],
      };
    }

    const now = new Date();
    const pendingInvites = await this.prisma.volunteerInvite.findMany({
      where: {
        email,
        status: VolunteerInviteStatus.PENDING,
        expiresAtUtc: { gt: now },
      },
      include: { ministry: { select: { id: true, name: true, archivedAt: true } } },
    });

    if (pendingInvites.length === 0) {
      return {
        volunteer: input.existingVolunteer ?? null,
        newlyFulfilledInvites: [],
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const newlyFulfilledInvites: FulfilledVolunteerInviteSummary[] = [];
      let volunteer = input.existingVolunteer ?? null;
      if (!volunteer) {
        volunteer = await tx.volunteer.create({
          data: {
            authSubjectId: input.authSubjectId,
            displayName: displayNameFromInviteEmail(email),
            email,
          },
        });
      } else {
        const updates: { authSubjectId?: string; email?: string } = {};
        if (!volunteer.authSubjectId) {
          updates.authSubjectId = input.authSubjectId;
        }
        if (!volunteer.email) {
          updates.email = email;
        }
        if (Object.keys(updates).length > 0) {
          volunteer = await tx.volunteer.update({
            where: { id: volunteer.id },
            data: updates,
          });
        }
      }

      for (const invite of pendingInvites) {
        if (invite.ministry.archivedAt !== null) {
          await tx.volunteerInvite.update({
            where: { id: invite.id },
            data: { status: VolunteerInviteStatus.EXPIRED },
          });
          continue;
        }

        const existingMembership = await tx.ministryMembership.findUnique({
          where: {
            volunteerId_ministryId: {
              volunteerId: volunteer.id,
              ministryId: invite.ministryId,
            },
          },
        });

        if (!existingMembership) {
          await tx.ministryMembership.create({
            data: {
              volunteerId: volunteer.id,
              ministryId: invite.ministryId,
              status: 'PENDING',
            },
          });
          newlyFulfilledInvites.push({
            ministryId: invite.ministryId,
            ministryName: invite.ministry.name,
          });
        }

        await tx.volunteerInvite.update({
          where: { id: invite.id },
          data: {
            status: VolunteerInviteStatus.ACCEPTED,
            acceptedAtUtc: now,
          },
        });
      }

      return { volunteer, newlyFulfilledInvites };
    });
  }
}
