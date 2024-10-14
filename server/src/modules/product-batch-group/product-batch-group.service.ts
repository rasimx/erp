import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { In } from 'typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomPostgresQueryRunner } from '@/database/custom.query-runner.js';
import { ProductBatchReadRepo } from '@/product-batch/domain/product-batch.read-repo.js';
import { ProductBatchGroupEventRepo } from '@/product-batch-group/domain/product-batch-group.event-repo.js';
import { ProductBatchGroup } from '@/product-batch-group/domain/product-batch-group.js';
import { ProductBatchGroupReadRepo } from '@/product-batch-group/domain/product-batch-group.read-repo.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';

@Injectable()
export class ProductBatchGroupService {
  constructor(
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly productBatchGroupReadRepo: ProductBatchGroupReadRepo,
    private readonly productBatchReadRepo: ProductBatchReadRepo,
    private readonly productBatchGroupEventRepo: ProductBatchGroupEventRepo,
  ) {}

  public async create({
    requestId,
    dto,
    queryRunner,
  }: {
    requestId: string;
    dto: CreateProductBatchGroupDto;
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<ProductBatchGroup> {
    const productBatchGroupReadRepo = queryRunner.manager.withRepository(
      this.productBatchGroupReadRepo,
    );
    const productBatchReadRepo = queryRunner.manager.withRepository(
      this.productBatchReadRepo,
    );

    const aggregateId = await productBatchGroupReadRepo.nextId();

    const lastOrder = await productBatchReadRepo.getLastOrderInStatus(
      dto.statusId,
    );

    const productBatchGroup = ProductBatchGroup.create({
      props: {
        ...dto,
        id: aggregateId,
        order: lastOrder ? lastOrder + 1 : 1,
      },
    });

    await this.saveAggregates({
      aggregates: [productBatchGroup],
      requestId: requestId,
      queryRunner,
    });

    return productBatchGroup;
  }

  async saveAggregates({
    aggregates,
    requestId,
    queryRunner,
  }: {
    aggregates: ProductBatchGroup[];
    requestId: string;
    queryRunner: CustomPostgresQueryRunner;
  }) {
    const productBatchGroupReadRepo = queryRunner.manager.withRepository(
      this.productBatchGroupReadRepo,
    );
    const productBatchGroupEventRepo = queryRunner.manager.withRepository(
      this.productBatchGroupEventRepo,
    );

    const eventEntities =
      await productBatchGroupEventRepo.saveUncommittedEvents({
        aggregates,
        requestId,
      });

    const readEntities = await productBatchGroupReadRepo.save(
      aggregates.map(item => item.toObject()),
    );
    return {
      eventEntities,
      aggregates: readEntities.map(item =>
        ProductBatchGroup.createFromReadEntity(item),
      ),
      readEntities,
    };
  }

  async getReadModel({
    id,
    queryRunner,
  }: {
    id: number;
    queryRunner?: CustomPostgresQueryRunner;
  }): Promise<ProductBatchGroup> {
    const productBatchGroupReadRepo = queryRunner
      ? queryRunner.manager.withRepository(this.productBatchGroupReadRepo)
      : this.productBatchGroupReadRepo;

    const readEntity = await productBatchGroupReadRepo.findOneOrFail({
      where: { id },
      relations: ['product'],
    });

    return ProductBatchGroup.createFromReadEntity(readEntity);
  }

  async getReadModelMap({
    ids,
    queryRunner,
  }: {
    ids: number[];
    queryRunner: CustomPostgresQueryRunner;
  }): Promise<Map<number, ProductBatchGroup>> {
    const productBatchGroupReadRepo = queryRunner.manager.withRepository(
      this.productBatchGroupReadRepo,
    );

    const entities = await productBatchGroupReadRepo.find({
      where: { id: In(ids) },
    });

    if (new Set(ids).size != entities.length) {
      throw new Error('найдены не все элементы');
    }

    return new Map(
      entities.map(item => [
        item.id,
        ProductBatchGroup.createFromReadEntity(item),
      ]),
    );
  }
}
