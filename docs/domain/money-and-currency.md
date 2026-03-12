# Money & Currency Rules

## Storage

All monetary values are stored as **integers in Rial (IRR)**.

| Property       | Value                        |
| -------------- | ---------------------------- |
| Base currency  | IRR (Iranian Rial)           |
| Storage type   | Integer (BigInt in database) |
| Decimal places | 0                            |
| Smallest unit  | 1 Rial                       |

### Why integers?

Floating-point arithmetic introduces rounding errors that accumulate over thousands of transactions. In accounting, even 1 Rial of drift is unacceptable. Integer arithmetic is exact.

```typescript
// CORRECT
const price: bigint = 15_000_000n; // 15,000,000 Rial

// WRONG — never do this
const price: number = 15000000.0; // floating-point
const price: Decimal = new Decimal('1500000.0'); // unnecessary precision
```

## Rial vs. Toman

| Concept         | Rial                                 | Toman                                    |
| --------------- | ------------------------------------ | ---------------------------------------- |
| Used in         | Storage, domain logic, API contracts | UI display only                          |
| Conversion      | —                                    | 1 Toman = 10 Rial                        |
| Where converted | —                                    | Presentation layer (frontend formatters) |

**Rule:** Toman NEVER appears in:

- Database columns
- API request/response bodies
- Domain entities or value objects
- Backend service logic

## Money Value Object

The `Money` value object in `apps/api/src/modules/accounting/domain/value-objects/money.vo.ts` encapsulates:

- Amount (integer, in Rial)
- Currency code (ISO 4217, default: `IRR`)
- Arithmetic operations (add, subtract, multiply by integer)
- Comparison operations
- Validation (non-negative where required)

## Multi-currency (Future)

The schema includes a `Currency` model and `currency_id` references on financial entities. Current implementation defaults to IRR, but the architecture supports:

- Storing amounts in their original currency
- Exchange rate tracking
- Multi-currency journal entries
- Currency-aware reporting

When implementing multi-currency:

- Each `JournalLine` carries its own currency
- Exchange rates are recorded at transaction time
- Reporting currency conversions happen at report generation
- Never silently convert between currencies

## Display Formatting

In Persian UI:

- Use Persian/Arabic numerals (۰-۹) if the user locale requires it
- Thousand separators: `۱۵,۰۰۰,۰۰۰` or `15,000,000`
- Right-to-left layout
- Label as "ریال" or "تومان" depending on display preference
- Input fields accept typed numbers with automatic thousand-separator insertion

## Database Column Conventions

```prisma
// CORRECT — BigInt for money
amount    BigInt
balance   BigInt

// WRONG — never use these for money
amount    Float
amount    Decimal
balance   Double
```

## API Contract

Money amounts in API JSON are serialized as strings (to preserve precision for large values):

```json
{
  "amount": "15000000",
  "currencyCode": "IRR"
}
```

Zod schemas in `packages/contracts/` enforce this format.
