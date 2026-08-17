import { PrismaClient } from '@prisma/client';
import {
  OBSOLETE_SEED_CAMPUS_IDS,
  ONDA_REGIONAL_CHURCHES,
  ONDA_SEED_DEMO_MEMBERSHIP_MINISTRY_IDS,
  ONDA_SEED_DEMO_MEMBERSHIP_STATUS,
  ONDA_SEED_DEMO_VOLUNTEER_ID,
  ONDA_SEED_GREETER_ASSIGNMENT,
  ONDA_SEED_MINISTRIES,
  ONDA_SEED_PUBLIC_EVENT,
} from './ondaCampuses';

const prisma = new PrismaClient();

/** Keep in sync with web-onda e2e / demo day offset (`SEED_DEMO_EVENT_DAY_OFFSET`). */
const SEED_DEMO_EVENT_DAY_OFFSET = 14;

function daysFromNow(days: number, hourUtc = 0, minuteUtc = 0): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hourUtc, minuteUtc, 0, 0);
  return date;
}

async function main() {
  await prisma.campus.deleteMany({
    where: { id: { in: [...OBSOLETE_SEED_CAMPUS_IDS] } },
  });

  for (const churchSeed of ONDA_REGIONAL_CHURCHES) {
    const church = await prisma.church.upsert({
      where: { id: churchSeed.id },
      update: {
        name: churchSeed.name,
        defaultTimezone: churchSeed.defaultTimezone,
      },
      create: {
        id: churchSeed.id,
        name: churchSeed.name,
        defaultTimezone: churchSeed.defaultTimezone,
      },
    });

    for (const campusSeed of churchSeed.campuses) {
      await prisma.campus.upsert({
        where: { id: campusSeed.id },
        update: {
          name: campusSeed.name,
          timezone: campusSeed.timezone,
          churchId: church.id,
        },
        create: {
          id: campusSeed.id,
          churchId: church.id,
          name: campusSeed.name,
          timezone: campusSeed.timezone,
        },
      });
    }
  }

  for (const ministrySeed of ONDA_SEED_MINISTRIES) {
    await prisma.ministry.upsert({
      where: { id: ministrySeed.id },
      update: {
        name: ministrySeed.name,
        churchId: ministrySeed.churchId,
      },
      create: {
        id: ministrySeed.id,
        name: ministrySeed.name,
        churchId: ministrySeed.churchId,
      },
    });
  }

  await prisma.volunteer.upsert({
    where: { id: ONDA_SEED_DEMO_VOLUNTEER_ID },
    update: { displayName: 'Demo Volunteer' },
    create: {
      id: ONDA_SEED_DEMO_VOLUNTEER_ID,
      displayName: 'Demo Volunteer',
    },
  });

  await prisma.volunteer.upsert({
    where: { id: 'seed-volunteer-admin' },
    update: {
      displayName: 'Kairan Moraes',
      authSubjectId: '4c544b4d-4e3f-48b4-858a-f450f16998e9',
    },
    create: {
      id: 'seed-volunteer-admin',
      displayName: 'Kairan Moraes',
      authSubjectId: '4c544b4d-4e3f-48b4-858a-f450f16998e9',
    },
  });

  await prisma.volunteer.upsert({
    where: { id: 'seed-volunteer-system-admin' },
    update: { displayName: 'System Operator' },
    create: {
      id: 'seed-volunteer-system-admin',
      displayName: 'System Operator',
    },
  });

  await prisma.volunteer.upsert({
    where: { id: 'seed-volunteer-hospitality' },
    update: { displayName: 'Hospitality Volunteer' },
    create: {
      id: 'seed-volunteer-hospitality',
      displayName: 'Hospitality Volunteer',
    },
  });

  await prisma.systemAdministrator.upsert({
    where: { volunteerId: 'seed-volunteer-system-admin' },
    update: {},
    create: { volunteerId: 'seed-volunteer-system-admin' },
  });

  await prisma.adminAccreditation.upsert({
    where: {
      volunteerId_churchId: {
        volunteerId: 'seed-volunteer-admin',
        churchId: ONDA_SEED_PUBLIC_EVENT.churchId,
      },
    },
    update: {},
    create: {
      volunteerId: 'seed-volunteer-admin',
      churchId: ONDA_SEED_PUBLIC_EVENT.churchId,
    },
  });

  await prisma.ministryLeader.upsert({
    where: {
      volunteerId_ministryId: {
        volunteerId: ONDA_SEED_DEMO_VOLUNTEER_ID,
        ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      },
    },
    update: {},
    create: {
      volunteerId: ONDA_SEED_DEMO_VOLUNTEER_ID,
      ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
    },
  });

  for (const ministryId of ONDA_SEED_DEMO_MEMBERSHIP_MINISTRY_IDS) {
    await prisma.ministryMembership.upsert({
      where: {
        volunteerId_ministryId: {
          volunteerId: ONDA_SEED_DEMO_VOLUNTEER_ID,
          ministryId,
        },
      },
      update: { status: ONDA_SEED_DEMO_MEMBERSHIP_STATUS },
      create: {
        volunteerId: ONDA_SEED_DEMO_VOLUNTEER_ID,
        ministryId,
        status: ONDA_SEED_DEMO_MEMBERSHIP_STATUS,
      },
    });
  }

  await prisma.ministryMembership.upsert({
    where: {
      volunteerId_ministryId: {
        volunteerId: 'seed-volunteer-hospitality',
        ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      volunteerId: 'seed-volunteer-hospitality',
      ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      status: 'ACTIVE',
    },
  });

  await prisma.ministryRole.upsert({
    where: { id: 'seed-role-greeter' },
    update: { retired: false },
    create: {
      id: 'seed-role-greeter',
      ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      name: 'Greeter',
      retired: false,
    },
  });

  await prisma.ministryRole.upsert({
    where: { id: 'seed-role-keys' },
    update: { retired: false },
    create: {
      id: 'seed-role-keys',
      ministryId: 'seed-ministry-band',
      name: 'Keys',
      retired: false,
    },
  });

  await prisma.unavailability.deleteMany({
    where: {
      volunteerId: ONDA_SEED_DEMO_VOLUNTEER_ID,
      ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      id: { not: 'seed-unavailability-morning' },
    },
  });

  await prisma.unavailability.upsert({
    where: { id: 'seed-unavailability-morning' },
    update: {
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0),
    },
    create: {
      id: 'seed-unavailability-morning',
      volunteerId: ONDA_SEED_DEMO_VOLUNTEER_ID,
      ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0),
    },
  });

  await prisma.event.upsert({
    where: { id: ONDA_SEED_PUBLIC_EVENT.id },
    update: {
      churchId: ONDA_SEED_PUBLIC_EVENT.churchId,
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30),
    },
    create: {
      id: ONDA_SEED_PUBLIC_EVENT.id,
      kind: 'PUBLIC',
      title: 'Sunday Gathering',
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30),
      churchId: ONDA_SEED_PUBLIC_EVENT.churchId,
    },
  });

  await prisma.assignment.upsert({
    where: { id: ONDA_SEED_GREETER_ASSIGNMENT.id },
    update: {
      voidedAtUtc: null,
      eventId: ONDA_SEED_GREETER_ASSIGNMENT.eventId,
      ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      volunteerId: ONDA_SEED_GREETER_ASSIGNMENT.volunteerId,
      roleId: ONDA_SEED_GREETER_ASSIGNMENT.roleId,
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30),
    },
    create: {
      id: ONDA_SEED_GREETER_ASSIGNMENT.id,
      eventId: ONDA_SEED_GREETER_ASSIGNMENT.eventId,
      ministryId: ONDA_SEED_GREETER_ASSIGNMENT.ministryId,
      volunteerId: ONDA_SEED_GREETER_ASSIGNMENT.volunteerId,
      roleId: ONDA_SEED_GREETER_ASSIGNMENT.roleId,
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30),
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
