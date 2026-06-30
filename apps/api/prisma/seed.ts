import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  const ministryTechnical = await prisma.ministry.upsert({
    where: { id: 'seed-ministry-technical' },
    update: { churchId: churchCentral.id },
    create: {
      id: 'seed-ministry-technical',
      name: 'Technical',
      churchId: churchCentral.id,
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

  await prisma.volunteer.upsert({
    where: { id: 'seed-volunteer-a' },
    update: { displayName: 'Alex Audio' },
    create: {
      id: 'seed-volunteer-a',
      displayName: 'Alex Audio',
    },
  });

  await prisma.volunteer.upsert({
    where: { id: 'seed-volunteer-b' },
    update: { displayName: 'Blake Audio' },
    create: {
      id: 'seed-volunteer-b',
      displayName: 'Blake Audio',
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

  await prisma.ministryLeader.upsert({
    where: {
      volunteerId_ministryId: {
        volunteerId: 'seed-volunteer-demo',
        ministryId: ministryTechnical.id,
      },
    },
    update: {},
    create: {
      volunteerId: 'seed-volunteer-demo',
      ministryId: ministryTechnical.id,
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

  await prisma.ministryRole.upsert({
    where: { id: 'seed-role-audio' },
    update: { retired: false },
    create: {
      id: 'seed-role-audio',
      ministryId: ministryTechnical.id,
      name: 'Audio',
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
      startsAtUtc: new Date('2026-06-07T15:00:00.000Z'),
      endsAtUtc: new Date('2026-06-07T16:00:00.000Z'),
    },
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
    update: { churchId: churchCentral.id },
    create: {
      id: 'seed-event-public',
      kind: 'PUBLIC',
      title: 'Sunday Gathering',
      startsAtUtc: new Date('2026-06-07T15:00:00.000Z'),
      endsAtUtc: new Date('2026-06-07T16:30:00.000Z'),
      churchId: churchCentral.id,
    },
  });

  await prisma.event.upsert({
    where: { id: 'seed-event-private' },
    update: {
      churchId: churchCentral.id,
      ministryId: ministryTechnical.id,
    },
    create: {
      id: 'seed-event-private',
      kind: 'PRIVATE',
      title: 'Technical Rehearsal',
      startsAtUtc: new Date('2026-06-28T18:00:00.000Z'),
      endsAtUtc: new Date('2026-06-28T20:00:00.000Z'),
      churchId: churchCentral.id,
      ministryId: ministryTechnical.id,
    },
  });

  await prisma.eventRoleCapacity.upsert({
    where: {
      eventId_ministryId_roleId: {
        eventId: 'seed-event-private',
        ministryId: ministryTechnical.id,
        roleId: 'seed-role-audio',
      },
    },
    update: { capacity: 2 },
    create: {
      eventId: 'seed-event-private',
      ministryId: ministryTechnical.id,
      roleId: 'seed-role-audio',
      capacity: 2,
    },
  });

  await prisma.assignment.upsert({
    where: { id: 'seed-assignment-audio-1' },
    update: {
      voidedAtUtc: null,
      eventId: 'seed-event-private',
      ministryId: ministryTechnical.id,
      volunteerId: 'seed-volunteer-a',
      roleId: 'seed-role-audio',
      startsAtUtc: new Date('2026-06-28T18:30:00.000Z'),
      endsAtUtc: new Date('2026-06-28T19:30:00.000Z'),
    },
    create: {
      id: 'seed-assignment-audio-1',
      eventId: 'seed-event-private',
      ministryId: ministryTechnical.id,
      volunteerId: 'seed-volunteer-a',
      roleId: 'seed-role-audio',
      startsAtUtc: new Date('2026-06-28T18:30:00.000Z'),
      endsAtUtc: new Date('2026-06-28T19:30:00.000Z'),
    },
  });

  await prisma.assignment.upsert({
    where: { id: 'seed-assignment-audio-2' },
    update: {
      voidedAtUtc: null,
      eventId: 'seed-event-private',
      ministryId: ministryTechnical.id,
      volunteerId: 'seed-volunteer-b',
      roleId: 'seed-role-audio',
      startsAtUtc: new Date('2026-06-28T18:30:00.000Z'),
      endsAtUtc: new Date('2026-06-28T19:30:00.000Z'),
    },
    create: {
      id: 'seed-assignment-audio-2',
      eventId: 'seed-event-private',
      ministryId: ministryTechnical.id,
      volunteerId: 'seed-volunteer-b',
      roleId: 'seed-role-audio',
      startsAtUtc: new Date('2026-06-28T18:30:00.000Z'),
      endsAtUtc: new Date('2026-06-28T19:30:00.000Z'),
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
      startsAtUtc: new Date('2026-06-07T16:00:00.000Z'),
      endsAtUtc: new Date('2026-06-07T16:30:00.000Z'),
    },
    create: {
      id: 'seed-assignment-public-greeter',
      eventId: 'seed-event-public',
      ministryId: 'seed-ministry-demo',
      volunteerId: 'seed-volunteer-demo',
      roleId: 'seed-role-greeter',
      startsAtUtc: new Date('2026-06-07T16:00:00.000Z'),
      endsAtUtc: new Date('2026-06-07T16:30:00.000Z'),
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
