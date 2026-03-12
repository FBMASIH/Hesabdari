# Hesabdari — Domain, Schema & Backend Design Spec

**Date:** 2026-03-12
**Phase:** Domain-first / Backend-first implementation
**Scope:** Database schema, Zod contracts, NestJS modules, API endpoints, domain rules
**Currency rule:** Store in Rial (IRR), integer minor units, decimalPlaces=0. Display conversion to Toman is presentation-layer only.

---

## 1. Currency Strategy

### Storage

- All monetary values stored as `BigInt` in Rial (IRR)
- `Currency` master table exists; default seed: IRR (code="IRR", name="ریال ایران", symbol="ریال", decimalPlaces=0)
- Every entity that holds money references `currencyId` (FK to Currency)
- In this phase, all records default to IRR. Multi-currency UI is deferred.

### Display (future phase)

- Presentation layer divides by 10 for Toman display when user preference is "Toman"
- A user/org setting `displayCurrency: "IRR" | "TOMAN"` will control this (not implemented now)

---

## 2. Schema Conventions

All new models MUST follow the exact conventions of the existing schema:

- **IDs:** `String @id @default(uuid()) @db.Uuid`
- **FK fields:** `String @map("snake_case") @db.Uuid` (matching the referenced model's ID type)
- **Field mapping:** Every camelCase field gets `@map("snake_case")`
- **Table mapping:** Every model gets `@@map("table_name")`
- **Boolean fields:** `@map("snake_case")` (e.g., `isActive @map("is_active")`)
- **Timestamps:** `createdAt DateTime @default(now()) @map("created_at")`, `updatedAt DateTime @updatedAt @map("updated_at")`
- **onDelete:** `Cascade` for child-of-org relations. `Restrict` on critical FK refs (e.g., Customer->Invoice) to prevent accidental data loss. Default `SetNull` where optional FK makes sense.

---

## 3. Prisma Schema — New Enums

```prisma
enum CostingMethod {
  FIFO
  LIFO
  AVERAGE
}

enum DocumentType {
  SALES
  PURCHASE
  SALES_RETURN
  PURCHASE_RETURN
  PROFORMA
}

enum InvoiceStatus {
  DRAFT
  CONFIRMED
  CANCELLED
}

enum BalanceType {
  DEBIT
  CREDIT
}

enum ChequeStatus {
  OPEN
  DEPOSITED
  CASHED
  RETURNED
  BOUNCED
  CANCELLED
}

enum PaidChequeStatus {
  OPEN
  CLEARED
  RETURNED
  CANCELLED
}
```

---

## 4. Prisma Schema — New Models

### 4.1 Currency

```prisma
model Currency {
  id            String   @id @default(uuid()) @db.Uuid
  code          String   @unique
  name          String
  symbol        String
  decimalPlaces Int      @default(0) @map("decimal_places")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  bankAccounts              BankAccount[]
  cashboxes                 Cashbox[]
  invoices                  Invoice[]
  receivedCheques           ReceivedCheque[]
  paidCheques               PaidCheque[]
  bankOpeningBalances       BankOpeningBalance[]
  cashboxOpeningBalances    CashboxOpeningBalance[]
  customerOpeningBalances   CustomerOpeningBalance[]
  vendorOpeningBalances     VendorOpeningBalance[]

  @@map("currencies")
}
```

### 4.2 Bank (master — global, not org-scoped)

```prisma
model Bank {
  id        String   @id @default(uuid()) @db.Uuid
  code      String   @unique
  name      String
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  bankAccounts BankAccount[]

  @@map("banks")
}
```

### 4.3 BankAccount

```prisma
model BankAccount {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  code           String
  name           String   @default("")
  accountNumber  String   @map("account_number")
  bankId         String   @map("bank_id") @db.Uuid
  branch         String   @default("")
  currencyId     String   @map("currency_id") @db.Uuid
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization        Organization         @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  bank                Bank                 @relation(fields: [bankId], references: [id])
  currency            Currency             @relation(fields: [currencyId], references: [id])
  bankOpeningBalances BankOpeningBalance[]
  paidCheques         PaidCheque[]
  receivedChequeDeposits ReceivedCheque[] @relation("DepositBankAccount")

  @@unique([organizationId, code])
  @@index([organizationId, isActive])
  @@map("bank_accounts")
}
```

### 4.4 Cashbox

```prisma
model Cashbox {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  code           String
  name           String
  currencyId     String   @map("currency_id") @db.Uuid
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization           Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  currency               Currency                @relation(fields: [currencyId], references: [id])
  cashboxOpeningBalances CashboxOpeningBalance[]

  @@unique([organizationId, code])
  @@index([organizationId, isActive])
  @@map("cashboxes")
}
```

### 4.5 Expense

```prisma
model Expense {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  code           String
  name           String
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, code])
  @@map("expenses")
}
```

### 4.6 Warehouse

```prisma
model Warehouse {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @map("organization_id") @db.Uuid
  code           String
  name           String
  costingMethod  CostingMethod @default(FIFO) @map("costing_method")
  isActive       Boolean       @default(true) @map("is_active")
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  organization           Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  productWarehouseStocks ProductWarehouseStock[]
  invoiceLines           InvoiceLine[]

  @@unique([organizationId, code])
  @@index([organizationId, isActive])
  @@map("warehouses")
}
```

### 4.7 Product

```prisma
model Product {
  id                  String   @id @default(uuid()) @db.Uuid
  organizationId      String   @map("organization_id") @db.Uuid
  code                String
  name                String
  barcode             String?
  countingUnit        String   @map("counting_unit")
  majorUnit           String?  @map("major_unit")
  minorUnit           String?  @map("minor_unit")
  quantityInMajorUnit Int?     @map("quantity_in_major_unit")
  salePrice1          BigInt   @default(0) @map("sale_price_1")
  salePrice2          BigInt   @default(0) @map("sale_price_2")
  salePrice3          BigInt   @default(0) @map("sale_price_3")
  isActive            Boolean  @default(true) @map("is_active")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  organization           Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  productWarehouseStocks ProductWarehouseStock[]
  invoiceLines           InvoiceLine[]

  @@unique([organizationId, code])
  @@index([organizationId, isActive])
  @@index([organizationId, barcode])
  @@map("products")
}
```

### 4.8 ProductWarehouseStock (opening inventory per warehouse)

```prisma
model ProductWarehouseStock {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  productId      String   @map("product_id") @db.Uuid
  warehouseId    String   @map("warehouse_id") @db.Uuid
  quantity       Int      @default(0)
  purchasePrice  BigInt   @default(0) @map("purchase_price")
  totalPrice     BigInt   @default(0) @map("total_price")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  product      Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  warehouse    Warehouse    @relation(fields: [warehouseId], references: [id], onDelete: Restrict)

  @@unique([organizationId, productId, warehouseId])
  @@map("product_warehouse_stocks")
}
```

### 4.9 Customer

```prisma
model Customer {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @map("organization_id") @db.Uuid
  code           String
  name           String
  referrer       String?
  title          String?
  phone1         String?   @map("phone_1")
  phone2         String?   @map("phone_2")
  phone3         String?   @map("phone_3")
  address        String?
  creditLimit    BigInt    @default(0) @map("credit_limit")
  nationalId     String?   @map("national_id")
  economicCode   String?   @map("economic_code")
  postalCode     String?   @map("postal_code")
  bankAccount1   String?   @map("bank_account_1")
  bankAccount2   String?   @map("bank_account_2")
  bankAccount3   String?   @map("bank_account_3")
  birthDate      DateTime? @map("birth_date")
  description    String?
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  organization            Organization             @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invoices                Invoice[]
  customerOpeningBalances CustomerOpeningBalance[]
  receivedCheques         ReceivedCheque[]

  @@unique([organizationId, code])
  @@index([organizationId, isActive])
  @@index([organizationId, name])
  @@map("customers")
}
```

### 4.10 Vendor

```prisma
model Vendor {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @map("organization_id") @db.Uuid
  code           String
  name           String
  referrer       String?
  title          String?
  phone1         String?   @map("phone_1")
  phone2         String?   @map("phone_2")
  phone3         String?   @map("phone_3")
  address        String?
  creditLimit    BigInt    @default(0) @map("credit_limit")
  nationalId     String?   @map("national_id")
  economicCode   String?   @map("economic_code")
  postalCode     String?   @map("postal_code")
  bankAccount1   String?   @map("bank_account_1")
  bankAccount2   String?   @map("bank_account_2")
  bankAccount3   String?   @map("bank_account_3")
  birthDate      DateTime? @map("birth_date")
  description    String?
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  organization          Organization           @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invoices              Invoice[]
  paidCheques           PaidCheque[]
  vendorOpeningBalances VendorOpeningBalance[]

  @@unique([organizationId, code])
  @@index([organizationId, isActive])
  @@index([organizationId, name])
  @@map("vendors")
}
```

### 4.11 Invoice

```prisma
model Invoice {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @map("organization_id") @db.Uuid
  documentType   DocumentType  @map("document_type")
  invoiceNumber  String        @map("invoice_number")
  invoiceDate    DateTime      @map("invoice_date") @db.Date
  dueDate        DateTime?     @map("due_date") @db.Date
  customerId     String?       @map("customer_id") @db.Uuid
  vendorId       String?       @map("vendor_id") @db.Uuid
  currencyId     String        @map("currency_id") @db.Uuid
  totalAmount    BigInt        @default(0) @map("total_amount")
  description    String?
  status         InvoiceStatus @default(DRAFT)
  journalEntryId String?       @unique @map("journal_entry_id") @db.Uuid
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer     Customer?     @relation(fields: [customerId], references: [id], onDelete: Restrict)
  vendor       Vendor?       @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  currency     Currency      @relation(fields: [currencyId], references: [id])
  journalEntry JournalEntry? @relation(fields: [journalEntryId], references: [id])
  lines        InvoiceLine[]

  @@unique([organizationId, documentType, invoiceNumber])
  @@index([organizationId, documentType])
  @@index([organizationId, invoiceDate])
  @@map("invoices")
}
```

### 4.12 InvoiceLine

```prisma
model InvoiceLine {
  id          String   @id @default(uuid()) @db.Uuid
  invoiceId   String   @map("invoice_id") @db.Uuid
  lineNumber  Int      @map("line_number")
  productId   String   @map("product_id") @db.Uuid
  warehouseId String?  @map("warehouse_id") @db.Uuid
  description String?
  quantity    Int
  unitPrice   BigInt   @map("unit_price")
  discount    BigInt   @default(0)
  tax         BigInt   @default(0)
  totalPrice  BigInt   @map("total_price")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  invoice   Invoice    @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product   Product    @relation(fields: [productId], references: [id], onDelete: Restrict)
  warehouse Warehouse? @relation(fields: [warehouseId], references: [id])

  @@index([invoiceId])
  @@index([productId])
  @@unique([invoiceId, lineNumber])
  @@map("invoice_lines")
}
```

### 4.13 CustomerOpeningBalance

```prisma
model CustomerOpeningBalance {
  id             String      @id @default(uuid()) @db.Uuid
  organizationId String      @map("organization_id") @db.Uuid
  customerId     String      @map("customer_id") @db.Uuid
  currencyId     String      @map("currency_id") @db.Uuid
  date           DateTime    @default(now()) @db.Date
  amount         BigInt
  balanceType    BalanceType @map("balance_type")
  description    String?
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer     Customer     @relation(fields: [customerId], references: [id], onDelete: Restrict)
  currency     Currency     @relation(fields: [currencyId], references: [id])

  @@unique([organizationId, customerId, currencyId])
  @@index([organizationId, customerId])
  @@map("customer_opening_balances")
}
```

### 4.14 VendorOpeningBalance

```prisma
model VendorOpeningBalance {
  id             String      @id @default(uuid()) @db.Uuid
  organizationId String      @map("organization_id") @db.Uuid
  vendorId       String      @map("vendor_id") @db.Uuid
  currencyId     String      @map("currency_id") @db.Uuid
  date           DateTime    @default(now()) @db.Date
  amount         BigInt
  balanceType    BalanceType @map("balance_type")
  description    String?
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  vendor       Vendor       @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  currency     Currency     @relation(fields: [currencyId], references: [id])

  @@unique([organizationId, vendorId, currencyId])
  @@index([organizationId, vendorId])
  @@map("vendor_opening_balances")
}
```

### 4.15 BankOpeningBalance

```prisma
model BankOpeningBalance {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  bankAccountId  String   @map("bank_account_id") @db.Uuid
  currencyId     String   @map("currency_id") @db.Uuid
  date           DateTime @default(now()) @db.Date
  amount         BigInt
  description    String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  bankAccount  BankAccount  @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  currency     Currency     @relation(fields: [currencyId], references: [id])

  @@index([organizationId, bankAccountId])
  @@map("bank_opening_balances")
}
```

### 4.16 CashboxOpeningBalance

```prisma
model CashboxOpeningBalance {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  cashboxId      String   @map("cashbox_id") @db.Uuid
  currencyId     String   @map("currency_id") @db.Uuid
  date           DateTime @default(now()) @db.Date
  amount         BigInt
  description    String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  cashbox      Cashbox      @relation(fields: [cashboxId], references: [id], onDelete: Restrict)
  currency     Currency     @relation(fields: [currencyId], references: [id])

  @@index([organizationId, cashboxId])
  @@map("cashbox_opening_balances")
}
```

### 4.17 ReceivedCheque

```prisma
model ReceivedCheque {
  id                   String       @id @default(uuid()) @db.Uuid
  organizationId       String       @map("organization_id") @db.Uuid
  customerId           String       @map("customer_id") @db.Uuid
  currencyId           String       @map("currency_id") @db.Uuid
  depositBankAccountId String?      @map("deposit_bank_account_id") @db.Uuid
  chequeNumber         String       @map("cheque_number")
  amount               BigInt
  date                 DateTime     @db.Date
  dueDate              DateTime     @map("due_date") @db.Date
  sayadiNumber         String?      @map("sayadi_number")
  description          String?
  status               ChequeStatus @default(OPEN)
  createdAt            DateTime     @default(now()) @map("created_at")
  updatedAt            DateTime     @updatedAt @map("updated_at")

  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer         Customer     @relation(fields: [customerId], references: [id], onDelete: Restrict)
  currency         Currency     @relation(fields: [currencyId], references: [id])
  depositBankAccount BankAccount? @relation("DepositBankAccount", fields: [depositBankAccountId], references: [id])

  @@unique([organizationId, sayadiNumber])
  @@index([organizationId, status])
  @@index([organizationId, customerId])
  @@index([organizationId, dueDate])
  @@map("received_cheques")
}
```

### 4.18 PaidCheque

```prisma
model PaidCheque {
  id             String           @id @default(uuid()) @db.Uuid
  organizationId String           @map("organization_id") @db.Uuid
  vendorId       String?          @map("vendor_id") @db.Uuid
  bankAccountId  String           @map("bank_account_id") @db.Uuid
  currencyId     String           @map("currency_id") @db.Uuid
  chequeNumber   String           @map("cheque_number")
  amount         BigInt
  date           DateTime         @db.Date
  dueDate        DateTime         @map("due_date") @db.Date
  sayadiNumber   String?          @map("sayadi_number")
  description    String?
  status         PaidChequeStatus @default(OPEN)
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  vendor       Vendor?      @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  bankAccount  BankAccount  @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  currency     Currency     @relation(fields: [currencyId], references: [id])

  @@unique([organizationId, bankAccountId, chequeNumber])
  @@index([organizationId, status])
  @@index([organizationId, vendorId])
  @@index([organizationId, dueDate])
  @@map("paid_cheques")
}
```

---

## 5. Updated Organization Model

The existing Organization model must add relation arrays for all new models:

```prisma
model Organization {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // existing
  members          OrganizationMember[]
  roles            Role[]
  accounts         Account[]
  accountingPeriods AccountingPeriod[]
  journalEntries   JournalEntry[]
  auditLogs        AuditLog[]

  // new
  customers              Customer[]
  vendors                Vendor[]
  bankAccounts           BankAccount[]
  cashboxes              Cashbox[]
  expenses               Expense[]
  warehouses             Warehouse[]
  products               Product[]
  productWarehouseStocks ProductWarehouseStock[]
  invoices               Invoice[]
  receivedCheques        ReceivedCheque[]
  paidCheques            PaidCheque[]
  customerOpeningBalances  CustomerOpeningBalance[]
  vendorOpeningBalances    VendorOpeningBalance[]
  bankOpeningBalances      BankOpeningBalance[]
  cashboxOpeningBalances   CashboxOpeningBalance[]

  @@map("organizations")
}
```

Also add to JournalEntry model:

```prisma
// Add to existing JournalEntry model:
invoice Invoice?
```

---

## 6. Zod Contracts (packages/contracts/src/)

Each entity gets a create schema, update schema, and query/filter schema. All monetary fields accept `number` at the API boundary (JSON doesn't support BigInt) and are converted to `BigInt` in the service layer.

### File Structure

```
packages/contracts/src/
├── index.ts                    // barrel export
├── auth.ts                     // existing
├── common.ts                   // existing (pagination, sort, uuid)
├── currency.ts
├── bank.ts
├── bank-account.ts
├── cashbox.ts
├── expense.ts
├── warehouse.ts
├── product.ts
├── customer.ts
├── vendor.ts
├── invoice.ts
├── opening-balance.ts
├── cheque.ts
```

### Key contract patterns

- `create*Schema` — required fields for creation
- `update*Schema` — partial of create, with `id` required
- `*QuerySchema` — pagination + optional filters (search, isActive, etc.)
- All monetary fields: `z.number().int()` at API boundary (converted to BigInt in service)
- All date fields: `z.string().datetime()` or `z.coerce.date()`
- All code fields: `z.string().min(1).max(50)`

---

## 7. NestJS Backend Module Structure

### Module Boundaries

Each business domain gets a NestJS module with:

- `presentation/http/controllers/` — REST endpoints
- `application/services/` — use cases / orchestration
- `infrastructure/repositories/` — Prisma data access
- `domain/` — entities, value objects, rules (where needed)

### Modules

| Module       | Entities                                                                                          | Key Operations                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `treasury`   | BankAccount, Cashbox, Bank, BankOpeningBalance, CashboxOpeningBalance, ReceivedCheque, PaidCheque | Full CRUD for all. Cheques: create, update status. Opening balances: create, list, delete.                   |
| `inventory`  | Warehouse, Product, ProductWarehouseStock                                                         | CRUD for warehouses/products. Register opening inventory per warehouse. Product search (full list + filter). |
| `customers`  | Customer, CustomerOpeningBalance                                                                  | Full CRUD. Search/lookup endpoint. Opening balance CRUD.                                                     |
| `vendors`    | Vendor, VendorOpeningBalance                                                                      | Full CRUD. Search/lookup endpoint. Opening balance CRUD.                                                     |
| `invoices`   | Invoice, InvoiceLine                                                                              | Create with lines (transactional). Update. List by type. Confirm/cancel status transitions.                  |
| `accounting` | Currency, Expense (+ existing Account, Period, JournalEntry)                                      | Add Currency CRUD. Add Expense CRUD. Complete existing journal entry CRUD.                                   |

### API Routes

All routes scoped under `/api/v1/organizations/:orgId/` except global master data.

```
# Customers
GET    /customers                    — list (paginated, searchable)
GET    /customers/search?q=          — search by code/name (for lookup dialog)
GET    /customers/:id                — get by id
POST   /customers                    — create
PUT    /customers/:id                — update
DELETE /customers/:id                — soft delete (isActive=false)

GET    /customers/opening-balances           — list
POST   /customers/opening-balances           — create
DELETE /customers/opening-balances/:id       — delete

# Vendors
GET    /vendors                      — list
GET    /vendors/search?q=            — search
GET    /vendors/:id                  — get
POST   /vendors                      — create
PUT    /vendors/:id                  — update
DELETE /vendors/:id                  — soft delete

GET    /vendors/opening-balances             — list
POST   /vendors/opening-balances             — create
DELETE /vendors/opening-balances/:id         — delete

# Banks (global master data — NOT org-scoped)
# Route: /api/v1/banks
GET    /banks                        — list all banks
POST   /banks                        — create
PUT    /banks/:id                    — update

# Currencies (global master data — NOT org-scoped)
# Route: /api/v1/currencies
GET    /currencies                   — list
POST   /currencies                   — create
PUT    /currencies/:id               — update

# Bank Accounts (org-scoped)
GET    /bank-accounts                — list
GET    /bank-accounts/:id            — get
POST   /bank-accounts                — create
PUT    /bank-accounts/:id            — update
DELETE /bank-accounts/:id            — soft delete

GET    /bank-accounts/opening-balances       — list
POST   /bank-accounts/opening-balances       — create
DELETE /bank-accounts/opening-balances/:id   — delete

# Cashboxes
GET    /cashboxes                    — list
GET    /cashboxes/:id                — get
POST   /cashboxes                    — create
PUT    /cashboxes/:id                — update
DELETE /cashboxes/:id                — soft delete

GET    /cashboxes/opening-balances           — list
POST   /cashboxes/opening-balances           — create
DELETE /cashboxes/opening-balances/:id       — delete

# Expenses
GET    /expenses                     — list
POST   /expenses                     — create
PUT    /expenses/:id                 — update

# Warehouses
GET    /warehouses                   — list
GET    /warehouses/:id               — get
POST   /warehouses                   — create
PUT    /warehouses/:id               — update

# Products
GET    /products                     — list (full list, then filterable)
GET    /products/search?q=           — search by code/name/barcode
GET    /products/:id                 — get
POST   /products                     — create
PUT    /products/:id                 — update
DELETE /products/:id                 — soft delete

GET    /products/:id/warehouse-stocks        — list opening inventory per warehouse
POST   /products/:id/warehouse-stocks        — upsert opening inventory for a warehouse
DELETE /products/:id/warehouse-stocks/:stockId — delete

# Invoices
GET    /invoices?type=SALES          — list by document type (paginated)
GET    /invoices/:id                 — get with lines
POST   /invoices                     — create with lines (transactional)
PUT    /invoices/:id                 — update with lines (transactional)
POST   /invoices/:id/confirm         — confirm invoice
POST   /invoices/:id/cancel          — cancel invoice

# Cheques
GET    /received-cheques             — list
GET    /received-cheques/:id         — get
POST   /received-cheques             — create
PUT    /received-cheques/:id         — update
PATCH  /received-cheques/:id/status  — change status (body: { status, depositBankAccountId? })

GET    /paid-cheques                 — list
GET    /paid-cheques/:id             — get
POST   /paid-cheques                 — create
PUT    /paid-cheques/:id             — update
PATCH  /paid-cheques/:id/status      — change status
```

---

## 8. Domain Rules

### 8.1 Invoice Rules

- `invoiceNumber` is required and unique per `(organizationId, documentType)`
- `invoiceDate` is required
- `dueDate` is optional but recommended
- **Party exclusivity (strict, enforced in service + contracts):**
  - SALES: `customerId` REQUIRED, `vendorId` MUST be null
  - SALES_RETURN: `customerId` REQUIRED, `vendorId` MUST be null
  - PROFORMA: `customerId` REQUIRED, `vendorId` MUST be null
  - PURCHASE: `vendorId` REQUIRED, `customerId` MUST be null
  - PURCHASE_RETURN: `vendorId` REQUIRED, `customerId` MUST be null
- At least one `InvoiceLine` is required
- Each line: `totalPrice = (quantity * unitPrice) - discount + tax`
- Invoice `totalAmount` = sum of all line `totalPrice` values
- Status transitions (forward-only, intentional — no un-confirm):
  - DRAFT → CONFIRMED
  - DRAFT → CANCELLED
  - CONFIRMED → CANCELLED
- Cannot modify a CONFIRMED invoice (must cancel and re-create)
- **Warehouse rules for invoice lines:**
  - PROFORMA: `warehouseId` may be null (no inventory impact)
  - SALES, PURCHASE, SALES_RETURN, PURCHASE_RETURN: `warehouseId` is REQUIRED on each line (inventory-affecting documents must have warehouse context)

### 8.2 Cheque Status Transitions

**Received cheque transition matrix (forward-only except CANCELLED):**
| From | Allowed To |
|------|-----------|
| OPEN | DEPOSITED, CANCELLED |
| DEPOSITED | CASHED, RETURNED, BOUNCED, CANCELLED |
| CASHED | (terminal) |
| RETURNED | OPEN (re-deposit possible), CANCELLED |
| BOUNCED | (terminal) |
| CANCELLED | (terminal) |

When transitioning to DEPOSITED, `depositBankAccountId` is required.

**Paid cheque transition matrix:**
| From | Allowed To |
|------|-----------|
| OPEN | CLEARED, RETURNED, CANCELLED |
| CLEARED | (terminal) |
| RETURNED | OPEN (re-issue possible), CANCELLED |
| CANCELLED | (terminal) |

### 8.3 Opening Balance Rules

- Customer/Vendor opening balances: one per entity per currency (enforced at service level)
- Bank/Cashbox opening balances: multiple entries allowed (deposits over time)
- All amounts must be > 0
- Balance type (DEBIT/CREDIT) determines direction for customer/vendor balances

### 8.4 Product Rules

- Product code unique per organization
- If `majorUnit` is set, `minorUnit` and `quantityInMajorUnit` should also be set
- Sale prices are >= 0
- Opening inventory per warehouse: `totalPrice` should equal `quantity * purchasePrice` (validated in service)

### 8.5 Quantity Type Decision

- **This phase supports only whole-number (integer) quantities.**
- `InvoiceLine.quantity` and `ProductWarehouseStock.quantity` are `Int`.
- Fractional inventory units (e.g., 1.5 kg, 2.75 meters) are deferred to a future phase.
- `countingUnit`/`majorUnit`/`minorUnit` exist for labeling but the persisted quantity remains integer-only.
- If fractional quantities are needed later, migration to `Decimal` will be required.

### 8.6 Currency Consistency Rules (service-level enforcement)

- `BankOpeningBalance.currencyId` MUST equal the referenced `BankAccount.currencyId`
- `CashboxOpeningBalance.currencyId` MUST equal the referenced `Cashbox.currencyId`
- `PaidCheque.currencyId` MUST equal the referenced `BankAccount.currencyId`
- If `ReceivedCheque.depositBankAccountId` is set, the cheque's `currencyId` must match the deposit bank account's `currencyId`
- In this phase, all org-scoped transactional records should use the seeded IRR currency
- These rules are enforced in service-layer validation and tested

### 8.7 Paid Cheque Sayadi Validation

- When `PaidCheque.sayadiNumber` is provided and non-empty, it must be unique within the organization
- Enforced at service level on create/update (not at DB level due to nullable partial-unique awkwardness)
- Tested

### 8.8 Auditability (deferred)

- `createdByUserId` and `updatedByUserId` on Invoice, ReceivedCheque, PaidCheque, and opening balance records are desirable
- **Deferred to next phase.** Reason: the current auth/request user infrastructure does not yet inject user context into service methods. The existing AuditLog table provides event-level tracking. Adding per-record audit fields requires wiring request user through the NestJS DI chain first.
- This is explicitly recorded as a future improvement, not forgotten.

### 8.9 Code Uniqueness

- All "code" fields (customer, vendor, product, warehouse, cashbox, bank account, expense) are unique within their organization
- Bank codes and Currency codes are globally unique (master data)

---

## 9. Transactional Boundaries

These operations MUST be wrapped in database transactions:

1. **Invoice creation** — create Invoice + all InvoiceLines atomically
2. **Invoice update** — delete old lines + create new lines + update invoice atomically
3. **Invoice confirmation** — status change (future: create journal entries atomically)
4. **Cheque status change** — update cheque + any related accounting entries

---

## 10. Seed Data

### Currency seed

```
{ code: "IRR", name: "ریال ایران", symbol: "ریال", decimalPlaces: 0 }
```

### Bank master seed (common Iranian banks)

```
{ code: "MELLI",      name: "بانک ملی ایران" }
{ code: "SEPAH",      name: "بانک سپه" }
{ code: "TEJARAT",    name: "بانک تجارت" }
{ code: "SADERAT",    name: "بانک صادرات ایران" }
{ code: "MELLAT",     name: "بانک ملت" }
{ code: "REFAH",      name: "بانک رفاه کارگران" }
{ code: "MASKAN",     name: "بانک مسکن" }
{ code: "KESHAVARZI", name: "بانک کشاورزی" }
{ code: "SANATMADAN", name: "بانک صنعت و معدن" }
{ code: "POSTBANK",   name: "پست بانک ایران" }
{ code: "PASARGAD",   name: "بانک پاسارگاد" }
{ code: "EGHTESAD",   name: "بانک اقتصاد نوین" }
{ code: "SAMAN",      name: "بانک سامان" }
{ code: "PARSIAN",    name: "بانک پارسیان" }
{ code: "KARAFARIN",  name: "بانک کارآفرین" }
{ code: "SINA",       name: "بانک سینا" }
{ code: "SHAHR",      name: "بانک شهر" }
{ code: "DAY",        name: "بانک دی" }
{ code: "AYANDEH",    name: "بانک آینده" }
{ code: "GARDESHGARI",name: "بانک گردشگری" }
{ code: "MEHRIRAN",   name: "بانک مهر ایران" }
{ code: "RESALAT",    name: "قرض‌الحسنه رسالت" }
```

---

## 11. Bug Fixes

### Bug 1: Opening cheques not saved / not shown after save

**Root cause:** No persistence layer exists. The ReceivedCheque and PaidCheque models, repositories, services, and endpoints are all missing.
**Fix:** Implement complete CRUD stack for both cheque types with proper create, list, get, update, and status change endpoints.

### Bug 2: Invoices missing due date

**Fix:** Add `dueDate DateTime? @map("due_date") @db.Date` to Invoice model. Add to create/update contracts. Expose in API.

### Bug 3: Invoice number missing for all required types

**Fix:** `invoiceNumber` is now required with a unique constraint per `(orgId, documentType, invoiceNumber)`.

### Bug 4: Product lookup should show all products before search

**Fix:** `GET /products` returns full paginated list (default first page). `GET /products/search?q=` returns filtered results. Frontend calls list first, then filters on keystroke.

### Bug 5: Product opening inventory per warehouse

**Fix:** `ProductWarehouseStock` model with CRUD endpoint `POST /products/:id/warehouse-stocks`.

### Bug 6: Bank accounts and cashboxes need currency

**Fix:** `currencyId` FK on both BankAccount and Cashbox models, referencing Currency table.

### Bug 7: Thousand separator during typing

**Fix:** Frontend utility — deferred to minimal UI phase. Backend stores raw integers.

### Bug 8: Persian Jalali date support

**Fix:** Frontend concern — deferred to minimal UI phase. Backend stores ISO DateTime, client converts.

---

## 12. Implementation Order

### Phase A: Schema + Generation (must be first)

1. Add all new enums to schema.prisma
2. Add all new models to schema.prisma (with correct UUID, @map, @@map conventions)
3. Update Organization model with all new relation arrays
4. Add `invoice Invoice?` relation to JournalEntry model
5. Run `prisma generate` (no migrate — no DB available)
6. Update packages/db/src/index.ts with new type exports

### Phase B: Contracts

7. Create Zod schemas for all entities in packages/contracts/src/
8. Export all from barrel index

### Phase C: Backend Modules — Master Data

9. Implement `Currency` CRUD in accounting module
10. Implement `Bank` master CRUD in treasury module
11. Implement `Expense` CRUD in accounting module
12. Implement `Warehouse` CRUD in inventory module
13. Implement `BankAccount` CRUD in treasury module
14. Implement `Cashbox` CRUD in treasury module
15. Implement `Customer` CRUD + search in customers module
16. Implement `Vendor` CRUD + search in vendors module
17. Implement `Product` CRUD + search + warehouse stock in inventory module

### Phase D: Backend Modules — Transactions

18. Implement `Invoice` CRUD with lines (transactional) in invoices module
19. Implement `ReceivedCheque` CRUD + status transitions in treasury module
20. Implement `PaidCheque` CRUD + status transitions in treasury module

### Phase E: Backend Modules — Opening Balances

21. Implement `CustomerOpeningBalance` CRUD
22. Implement `VendorOpeningBalance` CRUD
23. Implement `BankOpeningBalance` CRUD
24. Implement `CashboxOpeningBalance` CRUD

### Phase F: Minimal Functional UI (temporary admin screens)

25. Minimal CRUD forms/lists for all entities (no design polish)
26. Formatted number input utility (thousand separators)
27. Basic date handling (ISO dates, Jalali conversion deferred)

---

## 13. Testing Strategy

### Unit tests (domain rules)

- Invoice line total calculation: `totalPrice = (quantity * unitPrice) - discount + tax`
- Invoice total aggregation: sum of all line totals
- Cheque status transition validation (transition matrix enforcement)
- Code uniqueness validation
- Opening inventory total = quantity \* price

### Integration tests (service layer)

- Invoice creation with lines (transactional — all-or-nothing)
- Cheque persistence and retrieval (the main "Bug 1" fix verification)
- Customer search returns correct results
- Opening balance CRUD cycle (create, list, delete)

---

## 14. What This Phase Does NOT Include

- Exchange rate management or FX revaluation
- Multi-currency reporting or cross-currency aggregation
- Jalali date picker UI component
- Advanced UI/UX polish or design-system expansion
- Report generation
- Notification system
- File upload system
- Role-based access control enforcement
- Journal entry auto-generation from invoices (placeholder FK added for future)
