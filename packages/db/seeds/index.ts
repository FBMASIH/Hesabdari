import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Seed default permissions
  const permissions = [
    { code: 'journal.create', description: 'Create journal entries' },
    { code: 'journal.post', description: 'Post journal entries' },
    { code: 'journal.reverse', description: 'Reverse posted journal entries' },
    { code: 'period.close', description: 'Close accounting periods' },
    { code: 'period.reopen', description: 'Reopen closed accounting periods' },
    { code: 'account.create', description: 'Create chart of accounts entries' },
    { code: 'account.update', description: 'Update chart of accounts entries' },
    { code: 'invoice.create', description: 'Create invoices' },
    { code: 'invoice.approve', description: 'Approve invoices' },
    { code: 'report.view', description: 'View financial reports' },
    { code: 'report.export', description: 'Export financial reports' },
    { code: 'audit.view', description: 'View audit logs' },
    { code: 'org.manage', description: 'Manage organization settings' },
    { code: 'user.manage', description: 'Manage organization users' },
    { code: 'role.manage', description: 'Manage roles and permissions' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: { ...perm },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
