import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { StatusService } from '@/status/status.service.js';

@Injectable()
export class ProductBatchService {
  constructor(
    private readonly productService: ProductService,
    private readonly contextService: ContextService,
    private readonly statusService: StatusService,
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly productBatchRepository: ProductBatchRepository,
  ) {}
}
