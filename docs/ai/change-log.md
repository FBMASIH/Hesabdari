# Change Log — Hesabdari

## 2026-03-12 — Domain schema + contracts + backend implementation

### Schema

- Rewrote `packages/db/prisma/schema.prisma` with 30 models, 9 enums
- Added: Currency, Bank, Expense, BankAccount, Cashbox, Customer, Vendor, Warehouse, Product, ProductWarehouseStock, Invoice, InvoiceLine, ReceivedCheque, PaidCheque, CustomerOpeningBalance, VendorOpeningBalance, BankOpeningBalance, CashboxOpeningBalance
- Added enums: CostingMethod, DocumentType, InvoiceStatus, BalanceType, ChequeStatus, PaidChequeStatus
- Updated Organization model with 15+ relation arrays

### DB Package

- Updated `packages/db/src/index.ts` — exports all new types and enums
- Ran `prisma generate` successfully

### Contracts

- Created 12 new files in `packages/contracts/src/`: currency, bank, bank-account, cashbox, expense, warehouse, product, customer, vendor, invoice, opening-balance, cheque
- Updated `packages/contracts/src/index.ts` barrel export
- Fixed cheque contracts: aligned field names to schema (`date` not `issueDate`, removed non-schema fields)

### Backend Modules

- **accounting:** Added CurrencyRepository, CurrencyService, CurrenciesController, ExpenseRepository, ExpenseService, ExpensesController. Updated module registration.
- **customers:** Rewrote repository/service/controller with full CRUD + search + pagination. Added CustomerOpeningBalance repository/service/controller. Updated module.
- **vendors:** Same pattern as customers. Added VendorOpeningBalance. Updated module.
- **treasury:** Created from scratch: Bank, BankAccount, Cashbox repos/services/controllers. Added ReceivedCheque, PaidCheque repos/services/controllers. Added BankOpeningBalance, CashboxOpeningBalance repos/services/controllers. Full module with 7 controllers, 7 services, 7 repositories.
- **inventory:** Created from scratch: Warehouse, Product, ProductWarehouseStock repos/services/controllers. Updated module.
- **invoices:** Rewrote repository (transactional create/update with lineNumber), service (status transitions, party handling), controller (full CRUD + confirm/cancel).

### Bug Fixes During Implementation

- Fixed InvoiceLine: added `lineNumber` (required by schema)
- Fixed InvoiceLine: removed `organizationId` (not in schema)
- Fixed cheque contracts: `date` instead of `issueDate`, removed `bankId`/`branch`/`drawerName`/`payeeName` (not in schema)
- Fixed ReceivedCheque includes: removed `bank` (not a relation)
- Fixed BanksController: removed unused `Query` and `bankQuerySchema` imports
- Fixed opening-balance contract: `balanceDate` → `date` to match schema
- Fixed bank/cashbox opening balance repos/services: `balanceDate` → `date`, `Date | null` → `Date | undefined` (schema has `@default(now())`)

### Memory system bootstrap (2026-03-12)

- Created `docs/ai/` directory with 9 memory files
- Populated from full project state: working-memory, decision-log (13 decisions), progress-log, change-log, test-log, open-questions (8 items), conventions, requirement-checklist, prompt-history
