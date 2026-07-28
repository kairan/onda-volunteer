import { PrismaClient } from '@prisma/client';

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
  const churchCentral = await prisma.church.upsert({
    where: { id: 'seed-church-demo' },
    update: {
      name: 'Igreja Central',
      defaultTimezone: 'America/Sao_Paulo',
    },
    create: {
      id: 'seed-church-demo',
      name: 'Igreja Central',
      defaultTimezone: 'America/Sao_Paulo',
    },
  });

  const churchNorte = await prisma.church.upsert({
    where: { id: 'seed-church-norte' },
    update: {
      name: 'Comunidade Norte',
      defaultTimezone: 'America/Manaus',
    },
    create: {
      id: 'seed-church-norte',
      name: 'Comunidade Norte',
      defaultTimezone: 'America/Manaus',
    },
  });

  await prisma.campus.upsert({
    where: { id: 'seed-campus-central-sede' },
    update: {},
    create: {
      id: 'seed-campus-central-sede',
      churchId: churchCentral.id,
      name: 'Sede',
      timezone: 'America/Sao_Paulo',
    },
  });

  await prisma.campus.upsert({
    where: { id: 'seed-campus-central-sul' },
    update: {},
    create: {
      id: 'seed-campus-central-sul',
      churchId: churchCentral.id,
      name: 'Zona Sul',
      timezone: 'America/Sao_Paulo',
    },
  });

  await prisma.campus.upsert({
    where: { id: 'seed-campus-norte-unico' },
    update: {},
    create: {
      id: 'seed-campus-norte-unico',
      churchId: churchNorte.id,
      name: 'Único',
      timezone: 'America/Manaus',
    },
  });

  await prisma.ministry.upsert({
    where: { id: 'seed-ministry-demo' },
    update: { churchId: churchCentral.id },
    create: {
      id: 'seed-ministry-demo',
      name: 'Hospitality',
      churchId: churchCentral.id,
    },
  });

  const ministryBand = await prisma.ministry.upsert({
    where: { id: 'seed-ministry-band' },
    update: { churchId: churchCentral.id },
    create: {
      id: 'seed-ministry-band',
      name: 'Band',
      churchId: churchCentral.id,
    },
  });

  await prisma.ministry.upsert({
    where: { id: 'seed-ministry-norte' },
    update: {},
    create: {
      id: 'seed-ministry-norte',
      name: 'Louvor',
      churchId: churchNorte.id,
    },
  });

  await prisma.volunteer.upsert({
    where: { id: 'seed-volunteer-demo' },
    update: { displayName: 'Demo Volunteer' },
    create: {
      id: 'seed-volunteer-demo',
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
        churchId: churchCentral.id,
      },
    },
    update: {},
    create: {
      volunteerId: 'seed-volunteer-admin',
      churchId: churchCentral.id,
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
        volunteerId: 'seed-volunteer-hospitality',
        ministryId: 'seed-ministry-demo',
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      volunteerId: 'seed-volunteer-hospitality',
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

  await prisma.ministryMembership.upsert({
    where: {
      volunteerId_ministryId: {
        volunteerId: 'seed-volunteer-demo',
        ministryId: 'seed-ministry-norte',
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      volunteerId: 'seed-volunteer-demo',
      ministryId: 'seed-ministry-norte',
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

  await prisma.unavailability.deleteMany({
    where: {
      volunteerId: 'seed-volunteer-demo',
      ministryId: 'seed-ministry-demo',
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
      volunteerId: 'seed-volunteer-demo',
      ministryId: 'seed-ministry-demo',
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0),
    },
  });

  await prisma.event.upsert({
    where: { id: 'seed-event-public' },
    update: {
      churchId: churchCentral.id,
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30),
    },
    create: {
      id: 'seed-event-public',
      kind: 'PUBLIC',
      title: 'Sunday Gathering',
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 15, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30),
      churchId: churchCentral.id,
    },
  });

  await prisma.assignment.upsert({
    where: { id: 'seed-assignment-public-greeter' },
    update: {
      voidedAtUtc: null,
      eventId: 'seed-event-public',
      ministryId: 'seed-ministry-demo',
      volunteerId: 'seed-volunteer-demo',
      roleId: 'seed-role-greeter',
      startsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 0),
      endsAtUtc: daysFromNow(SEED_DEMO_EVENT_DAY_OFFSET, 16, 30),
    },
    create: {
      id: 'seed-assignment-public-greeter',
      eventId: 'seed-event-public',
      ministryId: 'seed-ministry-demo',
      volunteerId: 'seed-volunteer-demo',
      roleId: 'seed-role-greeter',
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
