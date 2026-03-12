import { Module } from '@nestjs/common';
import { AccountsController } from './presentation/http/controllers/accounts.controller';
import { JournalEntriesController } from './presentation/http/controllers/journal-entries.controller';
import { PeriodsController } from './presentation/http/controllers/periods.controller';
import { CurrenciesController } from './presentation/http/controllers/currencies.controller';
import { ExpensesController } from './presentation/http/controllers/expenses.controller';
import { AccountService } from './application/services/account.service';
import { JournalEntryService } from './application/services/journal-entry.service';
import { PeriodService } from './application/services/period.service';
import { CurrencyService } from './application/services/currency.service';
import { ExpenseService } from './application/services/expense.service';
import { AccountRepository } from './infrastructure/repositories/account.repository';
import { JournalEntryRepository } from './infrastructure/repositories/journal-entry.repository';
import { PeriodRepository } from './infrastructure/repositories/period.repository';
import { CurrencyRepository } from './infrastructure/repositories/currency.repository';
import { ExpenseRepository } from './infrastructure/repositories/expense.repository';

@Module({
  controllers: [
    AccountsController,
    JournalEntriesController,
    PeriodsController,
    CurrenciesController,
    ExpensesController,
  ],
  providers: [
    AccountService,
    JournalEntryService,
    PeriodService,
    CurrencyService,
    ExpenseService,
    AccountRepository,
    JournalEntryRepository,
    PeriodRepository,
    CurrencyRepository,
    ExpenseRepository,
  ],
  exports: [AccountService, JournalEntryService, PeriodService, CurrencyService, ExpenseService],
})
export class AccountingModule {}
