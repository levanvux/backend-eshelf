import { PrismaClient } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';

import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL']!,
});
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
