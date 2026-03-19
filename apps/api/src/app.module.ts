import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { JwtAuthGuard, OrgMembershipGuard } from './platform/guards';
import { DatabaseModule } from './platform/database/database.module';
import { CacheModule } from './platform/cache/cache.module';
import { LoggingModule } from './platform/logging/logging.module';
import { HealthModule } from './platform/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { CustomersModule } from './modules/customers/customers.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TreasuryModule } from './modules/treasury/treasury.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggingModule,
    DatabaseModule,
    CacheModule,
    HealthModule,
    IdentityModule,
    OrganizationsModule,
    AccountingModule,
    InvoicesModule,
    CustomersModule,
    VendorsModule,
    InventoryModule,
    TreasuryModule,
    ReportsModule,
    AuditModule,
    NotificationsModule,
    FilesModule,
  ],
  providers: [
    AppConfig,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: OrgMembershipGuard },
  ],
})
export class AppModule {}
