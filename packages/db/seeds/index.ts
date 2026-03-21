import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
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

  // ── Currencies (12) ───────────────────────────────
  const currencies = [
    { id: '00000000-0000-0000-0000-000000000001', code: 'IRR', name: 'ریال ایران', symbol: '﷼', decimalPlaces: 0 },
    { id: '00000000-0000-0000-0000-000000000c02', code: 'AFN', name: 'افغانی', symbol: '؋', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c03', code: 'USD', name: 'دلار آمریکا', symbol: '$', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c04', code: 'EUR', name: 'یورو', symbol: '€', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c05', code: 'GBP', name: 'پوند بریتانیا', symbol: '£', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c06', code: 'AED', name: 'درهم امارات', symbol: 'د.إ', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c07', code: 'TRY', name: 'لیر ترکیه', symbol: '₺', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c08', code: 'CNY', name: 'یوان چین', symbol: '¥', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c09', code: 'IQD', name: 'دینار عراق', symbol: 'ع.د', decimalPlaces: 3 },
    { id: '00000000-0000-0000-0000-000000000c10', code: 'INR', name: 'روپیه هند', symbol: '₹', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c11', code: 'RUB', name: 'روبل روسیه', symbol: '₽', decimalPlaces: 2 },
    { id: '00000000-0000-0000-0000-000000000c12', code: 'PKR', name: 'روپیه پاکستان', symbol: '₨', decimalPlaces: 2 },
  ];

  for (const curr of currencies) {
    await prisma.currency.upsert({
      where: { id: curr.id },
      update: {},
      create: { ...curr, isActive: true },
    });
  }
  const irr = currencies[0]!;
  console.log(`Currencies: ${currencies.length} seeded`);

  // ── Organization + Admin User ──────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'hesabdari-dev' },
    update: { defaultCurrencyId: irr.id },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'شرکت نمونه حسابداری',
      slug: 'hesabdari-dev',
      defaultCurrencyId: irr.id,
    },
  });
  console.log(`Organization: ${org.name}`);

  // ── Default Role (Owner / مدیر) ───────────────────
  const ownerRole = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: 'مدیر',
      },
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000099',
      organizationId: org.id,
      name: 'مدیر',
      isSystem: true,
    },
  });
  // Assign all permissions to the Owner role
  for (const perm of permissions) {
    const permission = await prisma.permission.findUnique({ where: { code: perm.code } });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: ownerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: ownerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log(`Role: ${ownerRole.name} (with all permissions)`);

  // ── Accounting Period ──────────────────────────────
  const period = await prisma.accountingPeriod.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: org.id,
      name: 'سال مالی ۱۴۰۵',
      startDate: new Date('2026-03-21'),
      endDate: new Date('2027-03-20'),
      status: 'OPEN',
    },
  });
  console.log(`Period: ${period.name}`);

  // ── Chart of Accounts (tree) ───────────────────────
  const accounts = [
    { code: '1100', name: 'دارایی‌های جاری', type: 'ASSET' as const, parentId: null },
    { code: '1101', name: 'صندوق', type: 'ASSET' as const, parentId: '1100' },
    { code: '1102', name: 'بانک ملت', type: 'ASSET' as const, parentId: '1100' },
    { code: '1103', name: 'بانک ملی', type: 'ASSET' as const, parentId: '1100' },
    { code: '1200', name: 'حساب‌های دریافتنی', type: 'ASSET' as const, parentId: null },
    { code: '1201', name: 'بدهکاران تجاری', type: 'ASSET' as const, parentId: '1200' },
    { code: '2100', name: 'بدهی‌های جاری', type: 'LIABILITY' as const, parentId: null },
    { code: '2101', name: 'حساب‌های پرداختنی', type: 'LIABILITY' as const, parentId: '2100' },
    { code: '3100', name: 'حقوق صاحبان سهام', type: 'EQUITY' as const, parentId: null },
    { code: '3101', name: 'سرمایه', type: 'EQUITY' as const, parentId: '3100' },
    { code: '4100', name: 'درآمدها', type: 'REVENUE' as const, parentId: null },
    { code: '4101', name: 'فروش کالا', type: 'REVENUE' as const, parentId: '4100' },
    { code: '4102', name: 'درآمد خدمات', type: 'REVENUE' as const, parentId: '4100' },
    { code: '5100', name: 'بهای تمام‌شده', type: 'EXPENSE' as const, parentId: null },
    {
      code: '5101',
      name: 'بهای تمام‌شده کالای فروش‌رفته',
      type: 'EXPENSE' as const,
      parentId: '5100',
    },
    { code: '6100', name: 'هزینه‌های عملیاتی', type: 'EXPENSE' as const, parentId: null },
    { code: '6101', name: 'هزینه حقوق و دستمزد', type: 'EXPENSE' as const, parentId: '6100' },
    { code: '6102', name: 'هزینه اجاره', type: 'EXPENSE' as const, parentId: '6100' },
    { code: '6103', name: 'هزینه استهلاک', type: 'EXPENSE' as const, parentId: '6100' },
    { code: '7100', name: 'سود تسعیر ارز', type: 'REVENUE' as const, parentId: null },
    { code: '7200', name: 'زیان تسعیر ارز', type: 'EXPENSE' as const, parentId: null },
  ];

  // First pass: create accounts without parentId
  const accountIdMap = new Map<string, string>();
  for (const acct of accounts) {
    const existing = await prisma.account.findFirst({
      where: { organizationId: org.id, code: acct.code },
    });
    if (existing) {
      accountIdMap.set(acct.code, existing.id);
    } else {
      const created = await prisma.account.create({
        data: {
          organizationId: org.id,
          code: acct.code,
          name: acct.name,
          type: acct.type,
          isActive: true,
        },
      });
      accountIdMap.set(acct.code, created.id);
    }
  }
  // Second pass: set parent references
  for (const acct of accounts) {
    if (acct.parentId) {
      const parentDbId = accountIdMap.get(acct.parentId);
      const childDbId = accountIdMap.get(acct.code);
      if (parentDbId && childDbId) {
        await prisma.account.update({
          where: { id: childDbId },
          data: { parentId: parentDbId },
        });
      }
    }
  }
  console.log(`Accounts: ${accounts.length} seeded`);

  // ── Customers ──────────────────────────────────────
  const customers = [
    { code: 'C-001', name: 'شرکت آراد تجارت', phone1: '021-88001122' },
    { code: 'C-002', name: 'پارسیان الکترونیک', phone1: '021-66334455' },
    { code: 'C-003', name: 'فروشگاه زنجیره‌ای ستاره', phone1: '021-44556677' },
    { code: 'C-004', name: 'گروه صنعتی بهمن', phone1: '021-22778899' },
    { code: 'C-005', name: 'شرکت نوآوران فناوری', phone1: '021-77889900' },
  ];

  for (const cust of customers) {
    const exists = await prisma.customer.findFirst({
      where: { organizationId: org.id, code: cust.code },
    });
    if (!exists) {
      await prisma.customer.create({
        data: { ...cust, organizationId: org.id, isActive: true },
      });
    }
  }
  console.log(`Customers: ${customers.length} seeded`);

  // ── Vendors ────────────────────────────────────────
  const vendors = [
    { code: 'V-001', name: 'تأمین‌کننده مواد اولیه', phone1: '021-33445566' },
    { code: 'V-002', name: 'شرکت فولاد مبارکه', phone1: '031-22334455' },
    { code: 'V-003', name: 'شرکت توسعه ساختمان', phone1: '021-55667788' },
    { code: 'V-004', name: 'صنایع بسته‌بندی پارس', phone1: '021-11223344' },
    { code: 'V-005', name: 'شرکت حمل‌ونقل سریع', phone1: '021-99887766' },
  ];

  for (const vnd of vendors) {
    const exists = await prisma.vendor.findFirst({
      where: { organizationId: org.id, code: vnd.code },
    });
    if (!exists) {
      await prisma.vendor.create({
        data: { ...vnd, organizationId: org.id, isActive: true },
      });
    }
  }
  console.log(`Vendors: ${vendors.length} seeded`);

  // ── Warehouse ──────────────────────────────────────
  const _warehouse = await prisma.warehouse.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: org.id,
      code: 'WH-01',
      name: 'انبار مرکزی',
      costingMethod: 'FIFO',
      isActive: true,
    },
  });

  // ── Banks (22 Iranian banks) ──────────────────────
  const banks = [
    { code: 'melli', name: 'بانک ملی ایران' },
    { code: 'sepah', name: 'بانک سپه' },
    { code: 'mellat', name: 'بانک ملت' },
    { code: 'tejarat', name: 'بانک تجارت' },
    { code: 'saderat', name: 'بانک صادرات ایران' },
    { code: 'maskan', name: 'بانک مسکن' },
    { code: 'refah', name: 'بانک رفاه کارگران' },
    { code: 'tosesaderat', name: 'بانک توسعه صادرات' },
    { code: 'sanatmadan', name: 'بانک صنعت و معدن' },
    { code: 'keshavarzi', name: 'بانک کشاورزی' },
    { code: 'markazi', name: 'بانک مرکزی' },
    { code: 'postbank', name: 'پست بانک ایران' },
    { code: 'toseetaavon', name: 'بانک توسعه تعاون' },
    { code: 'eghtesadnovin', name: 'بانک اقتصاد نوین' },
    { code: 'parsian', name: 'بانک پارسیان' },
    { code: 'pasargad', name: 'بانک پاسارگاد' },
    { code: 'karafarin', name: 'بانک کارآفرین' },
    { code: 'saman', name: 'بانک سامان' },
    { code: 'sina', name: 'بانک سینا' },
    { code: 'sarmayeh', name: 'بانک سرمایه' },
    { code: 'shahr', name: 'بانک شهر' },
    { code: 'ayandeh', name: 'بانک آینده' },
  ];
  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      update: {},
      create: { code: bank.code, name: bank.name },
    });
  }
  console.log(`Banks: ${banks.length} seeded`);

  // ── Products ───────────────────────────────────────
  const products = [
    { code: 'P-001', name: 'لپ‌تاپ ایسوس VivoBook', countingUnit: 'عدد', salePrice1: 450000000n },
    { code: 'P-002', name: 'مانیتور سامسونگ ۲۷ اینچ', countingUnit: 'عدد', salePrice1: 180000000n },
    { code: 'P-003', name: 'کیبورد لاجیتک مکانیکال', countingUnit: 'عدد', salePrice1: 35000000n },
    { code: 'P-004', name: 'هارد اکسترنال ۱ ترابایت', countingUnit: 'عدد', salePrice1: 42000000n },
    { code: 'P-005', name: 'کابل شبکه Cat6 متری', countingUnit: 'متر', salePrice1: 150000n },
    { code: 'P-006', name: 'پرینتر لیزری HP', countingUnit: 'عدد', salePrice1: 95000000n },
    { code: 'P-007', name: 'ماوس بی‌سیم', countingUnit: 'عدد', salePrice1: 12000000n },
    { code: 'P-008', name: 'فلش مموری ۶۴ گیگ', countingUnit: 'عدد', salePrice1: 8500000n },
  ];

  for (const prod of products) {
    const exists = await prisma.product.findFirst({
      where: { organizationId: org.id, code: prod.code },
    });
    if (!exists) {
      await prisma.product.create({
        data: {
          organizationId: org.id,
          code: prod.code,
          name: prod.name,
          countingUnit: prod.countingUnit,
          salePrice1: prod.salePrice1,
          isActive: true,
        },
      });
    }
  }
  console.log(`Products: ${products.length} seeded`);

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
