import { Module } from '@nestjs/common';
// Controllers
import { BanksController } from './presentation/http/controllers/banks.controller';
import { BankAccountsController } from './presentation/http/controllers/bank-accounts.controller';
import { CashboxesController } from './presentation/http/controllers/cashboxes.controller';
import { ReceivedChequesController } from './presentation/http/controllers/received-cheques.controller';
import { PaidChequesController } from './presentation/http/controllers/paid-cheques.controller';
import { BankOpeningBalancesController } from './presentation/http/controllers/bank-opening-balances.controller';
import { CashboxOpeningBalancesController } from './presentation/http/controllers/cashbox-opening-balances.controller';
// Services
import { BankService } from './application/services/bank.service';
import { BankAccountService } from './application/services/bank-account.service';
import { CashboxService } from './application/services/cashbox.service';
import { ReceivedChequeService } from './application/services/received-cheque.service';
import { PaidChequeService } from './application/services/paid-cheque.service';
import { BankOpeningBalanceService } from './application/services/bank-opening-balance.service';
import { CashboxOpeningBalanceService } from './application/services/cashbox-opening-balance.service';
// Repositories
import { BankRepository } from './infrastructure/repositories/bank.repository';
import { BankAccountRepository } from './infrastructure/repositories/bank-account.repository';
import { CashboxRepository } from './infrastructure/repositories/cashbox.repository';
import { ReceivedChequeRepository } from './infrastructure/repositories/received-cheque.repository';
import { PaidChequeRepository } from './infrastructure/repositories/paid-cheque.repository';
import { BankOpeningBalanceRepository } from './infrastructure/repositories/bank-opening-balance.repository';
import { CashboxOpeningBalanceRepository } from './infrastructure/repositories/cashbox-opening-balance.repository';

@Module({
  controllers: [
    BanksController,
    BankAccountsController,
    CashboxesController,
    ReceivedChequesController,
    PaidChequesController,
    BankOpeningBalancesController,
    CashboxOpeningBalancesController,
  ],
  providers: [
    BankService,
    BankAccountService,
    CashboxService,
    ReceivedChequeService,
    PaidChequeService,
    BankOpeningBalanceService,
    CashboxOpeningBalanceService,
    BankRepository,
    BankAccountRepository,
    CashboxRepository,
    ReceivedChequeRepository,
    PaidChequeRepository,
    BankOpeningBalanceRepository,
    CashboxOpeningBalanceRepository,
  ],
  exports: [BankService, BankAccountService, CashboxService],
})
export class TreasuryModule {}
