import { PrismaClient } from '@prisma/client';

const args = process.argv.slice(2).filter((a) => a !== '--');
const authSubjectId = args[0];
const volunteerId = args[1] ?? 'seed-volunteer-demo';

if (!authSubjectId?.trim()) {
  console.error('Usage: pnpm link:volunteer-auth <supabase-user-uuid> [volunteerId]');
  console.error('Example: pnpm link:volunteer-auth 4c544b4d-4e3f-48b4-858a-f450f16998e9');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.volunteer.findUnique({ where: { id: volunteerId } });
  if (!existing) {
    console.error(
      `Volunteer "${volunteerId}" not found. Run: pnpm --filter @onda/api prisma:seed`,
    );
    process.exit(1);
  }

  const updated = await prisma.volunteer.update({
    where: { id: volunteerId },
    data: { authSubjectId: authSubjectId.trim() },
  });
  console.log(
    `Linked Volunteer ${updated.id} (${updated.displayName}) → authSubjectId ${updated.authSubjectId}`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
