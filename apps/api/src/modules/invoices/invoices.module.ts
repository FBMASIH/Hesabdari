import { Module } from '@nestjs/common';
import { InvoicesController } from './presentation/http/controllers/invoices.controller';
import { InvoiceService } from './application/services/invoice.service';
import { InvoiceRepository } from './infrastructure/repositories/invoice.repository';

@Module({
  controllers: [InvoicesController],
  providers: [InvoiceService, InvoiceRepository],
  exports: [InvoiceService],
})
export class InvoicesModule {}
