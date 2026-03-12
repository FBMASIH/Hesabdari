import { Module } from '@nestjs/common';
import { OrganizationsController } from './presentation/http/controllers/organizations.controller';
import { OrganizationService } from './application/services/organization.service';
import { OrganizationRepository } from './infrastructure/repositories/organization.repository';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService],
})
export class OrganizationsModule {}
