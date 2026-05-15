import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const church = await prisma.church.upsert({
    where: { id: 'seed-church-demo' },
    update: {},
    create: {
      id: 'seed-church-demo',
      name: 'Demo Church',
      defaultTimezone: 'America/Chicago',
    },
  });

  await prisma.ministry.upsert({
    where: { id: 'seed-ministry-demo' },
    update: {},
    create: {
      id: 'seed-ministry-demo',
      name: 'Hospitality',
      churchId: church.id,
    },
  });

  const ministryBand = await prisma.ministry.upsert({
    where: { id: 'seed-ministry-band' },
    update: {},
    create: {
      id: 'seed-ministry-band',
      name: 'Band',
      churchId: church.id,
    },
  });

  const demoAuthSubjectId = '00000000-0000-0000-0000-000000000001';

  await prisma.volunteer.upsert({
    where: { id: 'seed-volunteer-demo' },
    update: { authSubjectId: demoAuthSubjectId },
    create: {
      id: 'seed-volunteer-demo',
      displayName: 'Demo Volunteer',
      authSubjectId: demoAuthSubjectId,
    },
  });

  await prisma.ministryLeader.upsert({
    where: {
      volunteerId_ministryId: {
        volunteerId: 'seed-volunteer-demo',
        ministryId: 'seed-ministry-demo',
      },
    },
    update: {},
    create: {
      volunteerId: 'seed-volunteer-demo',
      ministryId: 'seed-ministry-demo',
    },
  });

  await prisma.ministryMembership.upsert({
    where: {
      volunteerId_ministryId: {
        volunteerId: 'seed-volunteer-demo',
        ministryId: 'seed-ministry-demo',
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      volunteerId: 'seed-volunteer-demo',
      ministryId: 'seed-ministry-demo',
      status: 'ACTIVE',
    },
  });

  await prisma.ministryMembership.upsert({
    where: {
      volunteerId_ministryId: {
        volunteerId: 'seed-volunteer-demo',
        ministryId: ministryBand.id,
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      volunteerId: 'seed-volunteer-demo',
      ministryId: ministryBand.id,
      status: 'ACTIVE',
    },
  });

  await prisma.ministryRole.upsert({
    where: { id: 'seed-role-greeter' },
    update: { retired: false },
    create: {
      id: 'seed-role-greeter',
      ministryId: 'seed-ministry-demo',
      name: 'Greeter',
      retired: false,
    },
  });

  await prisma.ministryRole.upsert({
    where: { id: 'seed-role-keys' },
    update: { retired: false },
    create: {
      id: 'seed-role-keys',
      ministryId: ministryBand.id,
      name: 'Keys',
      retired: false,
    },
  });

  await prisma.unavailability.upsert({
    where: { id: 'seed-unavailability-morning' },
    update: {},
    create: {
      id: 'seed-unavailability-morning',
      volunteerId: 'seed-volunteer-demo',
      ministryId: 'seed-ministry-demo',
      startsAtUtc: new Date('2026-06-07T15:00:00.000Z'),
      endsAtUtc: new Date('2026-06-07T16:00:00.000Z'),
    },
  });

  await prisma.event.upsert({
    where: { id: 'seed-event-public' },
    update: {},
    create: {
      id: 'seed-event-public',
      kind: 'PUBLIC',
      title: 'Sunday Gathering',
      startsAtUtc: new Date('2026-06-07T15:00:00.000Z'),
      endsAtUtc: new Date('2026-06-07T16:30:00.000Z'),
      churchId: church.id,
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
