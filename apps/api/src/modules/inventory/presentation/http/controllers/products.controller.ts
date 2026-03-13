import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { ProductService } from '../../../application/services/product.service';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productSearchSchema,
  createProductWarehouseStockSchema,
} from '@hesabdari/contracts';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('organizations/:orgId/products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products (paginated)' })
  async list(@Param('orgId') orgId: string, @Query() query: unknown) {
    const parsed = productQuerySchema.parse(query);
    return this.productService.findByOrganization(orgId, parsed);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by code/name/barcode' })
  async search(@Param('orgId') orgId: string, @Query() query: unknown) {
    const { q } = productSearchSchema.parse(query);
    return this.productService.search(orgId, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findById(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.productService.findById(id, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  async create(@Param('orgId') orgId: string, @Body() body: unknown) {
    const data = createProductSchema.parse(body);
    return this.productService.create(orgId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  async update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: unknown) {
    const data = updateProductSchema.parse({ ...(body as object), id });
    const { id: _id, ...rest } = data;
    return this.productService.update(id, orgId, rest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product' })
  async remove(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.productService.softDelete(id, orgId);
  }

  @Get(':id/warehouse-stocks')
  @ApiOperation({ summary: 'List product warehouse stocks' })
  async listStocks(@Param('orgId') orgId: string, @Param('id') productId: string) {
    return this.productService.getWarehouseStocks(productId, orgId);
  }

  @Post(':id/warehouse-stocks')
  @ApiOperation({ summary: 'Upsert product warehouse stock' })
  async upsertStock(
    @Param('orgId') orgId: string,
    @Param('id') productId: string,
    @Body() body: unknown,
  ) {
    const data = createProductWarehouseStockSchema.parse(body);
    return this.productService.upsertWarehouseStock(orgId, productId, data);
  }

  @Delete(':id/warehouse-stocks/:stockId')
  @ApiOperation({ summary: 'Delete product warehouse stock' })
  async deleteStock(@Param('orgId') orgId: string, @Param('stockId') stockId: string) {
    return this.productService.deleteWarehouseStock(stockId, orgId);
  }
}
