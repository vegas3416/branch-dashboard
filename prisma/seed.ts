import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  }),
});

async function main() {
  const email = 'demo@branch.io';

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: 'Jason' },
    create: { email, name: 'Jason' },
  });

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, theme: 'light' },
  });

  console.log('Seeded:', { userId: user.id, email: user.email });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
