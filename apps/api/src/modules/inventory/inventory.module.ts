import { Module } from '@nestjs/common';
import { WarehousesController } from './presentation/http/controllers/warehouses.controller';
import { ProductsController } from './presentation/http/controllers/products.controller';
import { WarehouseService } from './application/services/warehouse.service';
import { ProductService } from './application/services/product.service';
import { WarehouseRepository } from './infrastructure/repositories/warehouse.repository';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { ProductWarehouseStockRepository } from './infrastructure/repositories/product-warehouse-stock.repository';

@Module({
  controllers: [WarehousesController, ProductsController],
  providers: [
    WarehouseService,
    ProductService,
    WarehouseRepository,
    ProductRepository,
    ProductWarehouseStockRepository,
  ],
  exports: [WarehouseService, ProductService],
})
export class InventoryModule {}
