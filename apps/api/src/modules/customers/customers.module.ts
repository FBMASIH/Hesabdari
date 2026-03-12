import { Module } from '@nestjs/common';
import { CustomersController } from './presentation/http/controllers/customers.controller';
import { CustomerOpeningBalancesController } from './presentation/http/controllers/customer-opening-balances.controller';
import { CustomerService } from './application/services/customer.service';
import { CustomerOpeningBalanceService } from './application/services/customer-opening-balance.service';
import { CustomerRepository } from './infrastructure/repositories/customer.repository';
import { CustomerOpeningBalanceRepository } from './infrastructure/repositories/customer-opening-balance.repository';

@Module({
  controllers: [CustomersController, CustomerOpeningBalancesController],
  providers: [
    CustomerService,
    CustomerOpeningBalanceService,
    CustomerRepository,
    CustomerOpeningBalanceRepository,
  ],
  exports: [CustomerService],
})
export class CustomersModule {}
