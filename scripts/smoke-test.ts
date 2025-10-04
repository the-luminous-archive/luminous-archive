import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Count users
  const userCount = await prisma.user.count();
  console.log(`✅ User count: ${userCount}`);

  // 2. Insert a dummy user (if none exist)
  if (userCount === 0) {
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
      },
    });
    console.log('✅ Inserted test user:', newUser);
  }

  // 3. Query all users
  const users = await prisma.user.findMany();
  console.log('✅ All users:', users);
}

main()
  .catch((e) => {
    console.error('❌ Smoke test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
