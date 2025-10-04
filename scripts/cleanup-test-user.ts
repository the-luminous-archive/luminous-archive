// scripts/cleanup-test-user.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const res = await prisma.user.deleteMany({ where: { email: 'test@example.com' } })
  console.log(`Deleted ${res.count} test users`)
}

main().finally(() => prisma.$disconnect())
