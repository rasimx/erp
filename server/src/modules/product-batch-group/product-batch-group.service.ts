import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { QueryRunner } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import { ProductBatchGroupEventRepository } from '@/product-batch-group/events/product-batch-group-event.repository.js';
import { ProductBatchGroupRepository } from '@/product-batch-group/product-batch-group.repository.js';

@Injectable()
export class ProductBatchGroupService {
  constructor(
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly productBatchGroupRepository: ProductBatchGroupRepository,
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

    const aggregateId = await productBatchGroupRepository.nextId();

    const group = ProductBatchGroup.create({
      id: aggregateId,
      ...dto,
    });

    await productBatchGroupEventRepository.saveAggregateEvents({
      aggregate: group,
      eventId: requestId,
    });

    await productBatchGroupRepository.save(group.toObject());

    return group;
  }
}
