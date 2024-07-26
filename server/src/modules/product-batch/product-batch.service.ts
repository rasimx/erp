import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import { ProductService } from '@/product/product.service.js';
import type { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { StatusService } from '@/status/status.service.js';

import { ProductBatchDto } from './dtos/product-batch.dto.js';
import { GetProductBatchListQuery } from './queries/impl/get-product-batch-list.query.js';

@Injectable()
export class ProductBatchService {
  constructor(
    private readonly productService: ProductService,
    private readonly ozonStateMicroservice: OzonStateMicroservice,
    private readonly contextService: ContextService,
    private readonly statusService: StatusService,
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  // async productBatchList(
  //   productId?: number | null,
  // ): Promise<ProductBatchDto[]> {
  //   return this.queryBus.execute(new GetProductBatchListQuery(productId));
  // }

  // async createProductBatchGroup(dto: CreateProductBatchDto) {
  //   await this.commandBus.execute(new CreateProductBatchCommand(dto));
  //   return this.queryBus.execute(new GetProductBatchListQuery());
  // }
  // async moveProductBatchGroup(dto: MoveProductBatchDto) {
  //   await this.commandBus.execute(new MoveProductBatchCommand(dto));
  //   return this.queryBus.execute(new GetProductBatchListQuery());
  // }
  //
  // async deleteProductBatchGroup(id: number) {
  //   // await this.commandBus.execute(new MoveProductBatchCommand(dto));
  //   // return this.queryBus.execute(new GetProductBatchListQuery());
  // }
}
