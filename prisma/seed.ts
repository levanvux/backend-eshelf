import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';
import * as bcrypt from 'bcrypt';

import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const adapter = new PrismaPg({
  connectionString,
});
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@eshelf.com' },
  });
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('admindz123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@eshelf.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log('Admin user created: admin@eshelf.com / admindz123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
