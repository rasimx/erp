import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { QueryRunner } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import { ProductBatchRepository } from '@/product-batch/domain/product-batch.repository.js';
import { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/domain/product-batch-group.repository.js';
import { ProductBatchGroupEventRepository } from '@/product-batch-group/domain/product-batch-group-event.repository.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

@Injectable()
export class ProductBatchGroupService {
  constructor(
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly productBatchGroupEventRepository: ProductBatchGroupEventRepository,
  ) {}

  async create({
    requestId,
    dto,
    queryRunner,
  }: {
    requestId: string;
    dto: CreateProductBatchGroupDto;
    queryRunner: QueryRunner;
  }): Promise<ProductBatchGroup> {
    const productBatchGroupRepository = queryRunner.manager.withRepository(
      this.productBatchGroupRepository,
    );
    const productBatchGroupEventRepository = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepository,
    );
    const productBatchRepo = queryRunner.manager.withRepository(
      this.productBatchRepo,
    );

    const aggregateId = await productBatchGroupRepository.nextId();

    const lastOrder = await productBatchRepo.getLastOrderInStatus(dto.statusId);

    const group = ProductBatchGroup.create({
      ...dto,
      id: aggregateId,
      order: lastOrder ? lastOrder + 1 : 1,
    });

    await productBatchGroupEventRepository.saveAggregateEvents({
      aggregates: [group],
      requestId: requestId,
    });

    await productBatchGroupRepository.save(group.toObject());

    return group;
  }
}
