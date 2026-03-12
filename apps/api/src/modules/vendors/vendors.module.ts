import { Module } from '@nestjs/common';
import { VendorsController } from './presentation/http/controllers/vendors.controller';
import { VendorOpeningBalancesController } from './presentation/http/controllers/vendor-opening-balances.controller';
import { VendorService } from './application/services/vendor.service';
import { VendorOpeningBalanceService } from './application/services/vendor-opening-balance.service';
import { VendorRepository } from './infrastructure/repositories/vendor.repository';
import { VendorOpeningBalanceRepository } from './infrastructure/repositories/vendor-opening-balance.repository';

@Module({
  controllers: [VendorsController, VendorOpeningBalancesController],
  providers: [
    VendorService,
    VendorOpeningBalanceService,
    VendorRepository,
    VendorOpeningBalanceRepository,
  ],
  exports: [VendorService],
})
export class VendorsModule {}
