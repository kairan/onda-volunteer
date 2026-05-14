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
