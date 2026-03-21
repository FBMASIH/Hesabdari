import { Module, forwardRef } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AccountsController } from './presentation/http/controllers/accounts.controller';
import { JournalEntriesController } from './presentation/http/controllers/journal-entries.controller';
import { PeriodsController } from './presentation/http/controllers/periods.controller';
import { CurrenciesController } from './presentation/http/controllers/currencies.controller';
import { ExpensesController } from './presentation/http/controllers/expenses.controller';
import { ExchangeRatesController } from './presentation/http/controllers/exchange-rates.controller';
import { CurrencyRevaluationController } from './presentation/http/controllers/currency-revaluation.controller';
import { AccountService } from './application/services/account.service';
import { JournalEntryService } from './application/services/journal-entry.service';
import { PeriodService } from './application/services/period.service';
import { CurrencyService } from './application/services/currency.service';
import { ExpenseService } from './application/services/expense.service';
import { ExchangeRateService } from './application/services/exchange-rate.service';
import { CurrencyRevaluationService } from './application/services/currency-revaluation.service';
import { AccountRepository } from './infrastructure/repositories/account.repository';
import { JournalEntryRepository } from './infrastructure/repositories/journal-entry.repository';
import { PeriodRepository } from './infrastructure/repositories/period.repository';
import { CurrencyRepository } from './infrastructure/repositories/currency.repository';
import { ExpenseRepository } from './infrastructure/repositories/expense.repository';
import { ExchangeRateRepository } from './infrastructure/repositories/exchange-rate.repository';
import { CurrencyRevaluationRepository } from './infrastructure/repositories/currency-revaluation.repository';
import { ExchangeRateFetcher } from './infrastructure/external/exchange-rate-fetcher';

@Module({
  imports: [AuditModule, forwardRef(() => OrganizationsModule)],
  controllers: [
    AccountsController,
    JournalEntriesController,
    PeriodsController,
    CurrenciesController,
    ExpensesController,
    ExchangeRatesController,
    CurrencyRevaluationController,
  ],
  providers: [
    AccountService,
    JournalEntryService,
    PeriodService,
    CurrencyService,
    ExpenseService,
    ExchangeRateService,
    CurrencyRevaluationService,
    AccountRepository,
    JournalEntryRepository,
    PeriodRepository,
    CurrencyRepository,
    ExpenseRepository,
    ExchangeRateRepository,
    CurrencyRevaluationRepository,
    ExchangeRateFetcher,
  ],
  exports: [
    AccountService,
    JournalEntryService,
    PeriodService,
    CurrencyService,
    ExpenseService,
    ExchangeRateService,
    CurrencyRevaluationService,
  ],
})
export class AccountingModule {}
