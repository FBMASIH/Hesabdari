export { PrismaClient } from './generated/prisma/client.js';
export { PrismaPg } from '@prisma/adapter-pg';
export type {
  // Identity & Auth
  User,
  Session,
  Organization,
  OrganizationMember,
  Role,
  Permission,
  RolePermission,
  // Accounting core
  Account,
  AccountingPeriod,
  JournalEntry,
  JournalLine,
  // Master data
  Currency,
  Bank,
  Expense,
  BankAccount,
  Cashbox,
  Customer,
  Vendor,
  Warehouse,
  Product,
  ProductWarehouseStock,
  // Invoices
  Invoice,
  InvoiceLine,
  // Cheques
  ReceivedCheque,
  PaidCheque,
  // Opening balances
  CustomerOpeningBalance,
  VendorOpeningBalance,
  BankOpeningBalance,
  CashboxOpeningBalance,
  // Audit
  AuditLog,
} from './generated/prisma/client.js';

// Enums - re-export as values and types
export {
  AccountType,
  AccountingPeriodStatus,
  JournalEntryStatus,
  CostingMethod,
  DocumentType,
  InvoiceStatus,
  ChequeStatus,
  PaidChequeStatus,
  BalanceType,
} from './generated/prisma/client.js';
