import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import omit from 'lodash/omit.js';
import { Repository } from 'typeorm';

import { StatusType } from '@/graphql.schema.js';
import type { FindLatestRequest } from '@/microservices/proto/erp.pb.js';
import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import type { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { StatusEntity } from '@/status/status.entity.js';

export class ProductBatchRepository extends Repository<ProductBatchEntity> {
  async createFromDto(dto: CreateProductBatchDto) {
    /*
     * если создается в новой колонке то order - последний
     * если создается в той же партии
     * */

    let parent: ProductBatchEntity | null = null;
    if (dto.parentId) {
      parent = await this.findOneOrFail({
        where: { id: dto.parentId },
      });
      if (dto.count >= parent.count) {
        throw new BadRequestException(
          `количество не может быть больше или равно чем у предка`,
        );
      }
      if (dto.productId && parent.productId != dto.productId) {
        throw new BadRequestException(`разные товары`);
      }
      parent.count = parent.count - dto.count;
      await this.save(parent);
    }

    let lastBatch: ProductBatchEntity | null = null;
    lastBatch = await this.findOne({
      where: { statusId: dto.statusId },
      order: { order: 'DESC' },
    });

    const order = lastBatch ? lastBatch.order + 1 : 1;

    let newEntity = new ProductBatchEntity();
    Object.assign(newEntity, dto, { order, operationsPricePerUnit: 0 });
    if (parent) {
      Object.assign(newEntity, omit(parent, ['id', 'order', 'count']), {
        parent: parent,
        count: dto.count,
        order,
      });
    }
    newEntity = await this.save(newEntity);
    return newEntity;
  }

  async moveProductBatch(dto: MoveProductBatchDto) {
    const { id, statusId: newStatusId } = dto;
    let newOrder = dto.order;
    let batch = await this.findOneOrFail({
      where: { id },
      relations: ['status'],
    });
    const newStatus = await this.manager.findOneOrFail(StatusEntity, {
      where: { id: newStatusId },
    });
    if (
      (batch.status.type != StatusType.custom ||
        newStatus.type != StatusType.custom) &&
      batch.statusId != newStatusId
    )
      throw new BadRequestException(
        'нельзя перемещать партии между магазинами',
      );

    if (!newOrder) {
      const lastBatch = await this.findOne({
        where: { statusId: newStatusId },
        order: { order: 'DESC' },
      });

      newOrder = lastBatch
        ? lastBatch.statusId == batch.statusId
          ? lastBatch.order
          : lastBatch.order + 1
        : 1;
    }

    const oldStatusId = batch.statusId;
    batch.status = newStatus;
    const oldOrder = batch.order;
    batch.order = newOrder;
    batch = await this.save(batch);
    // Обновите порядок карточек в старом столбце
    if (oldStatusId === newStatusId) {
      // Перемещение внутри одного столбца

      let query = this.createQueryBuilder().update(ProductBatchEntity);
      if (newOrder < oldOrder) {
        query = query
          .set({ order: () => '"order" + 1' })
          .where(
            'statusId = :newStatusId AND id != :id AND "order" >= :newOrder AND "order" <= :oldOrder',
            {
              newStatusId,
              newOrder,
              oldOrder,
              id,
            },
          );
      } else {
        query = query
          .set({ order: () => '"order" - 1' })
          .where(
            'statusId = :newStatusId AND id != :id AND "order" >= :oldOrder AND "order" <= :newOrder',
            {
              newStatusId,
              newOrder,
              oldOrder,
              id,
            },
          );
      }
      await query.execute();
    } else {
      // Перемещение в другой столбец
      await this.manager
        .createQueryBuilder()
        .update(ProductBatchEntity)
        .set({ order: () => '"order" + 1' })
        .where(
          'statusId = :newStatusId AND "order" >= :newOrder AND id != :id',
          {
            newStatusId,
            newOrder,
            id,
          },
        )
        .execute();

      await this.manager
        .createQueryBuilder()
        .update(ProductBatchEntity)
        .set({ order: () => '"order" - 1' })
        .where('statusId = :oldStatusId AND "order" > :oldOrder', {
          oldStatusId,
          oldOrder,
          id,
        })
        .execute();
    }
  }

  async findFromId({ storeId, id }: { storeId: number; id: number }) {
    return this.createQueryBuilder('pb')
      .leftJoinAndSelect('pb.product', 'product')
      .leftJoinAndSelect('pb.status', 'status')
      .leftJoinAndSelect(
        ProductBatchEntity,
        'pb2',
        'pb.product_id = pb2.product_id',
      )
      .where('pb2.id = :id', { id })
      .andWhere('pb.date::date >= pb2.date::date')
      .andWhere('status.store_id = :storeId', { storeId })
      .orderBy('pb.order', 'DESC')
      .getMany();
  }

  async findLatest({
    productId,
    starterId,
    storeId,
  }: FindLatestRequest): Promise<ProductBatchEntity[]> {
    if (starterId !== undefined)
      return this.findFromId({ storeId, id: starterId });
    const last = await this.findOne({
      where: { productId, status: { storeId } },
      relations: ['product', 'status'],
      order: { date: 'desc' },
    });
    return last ? [last] : [];
  }
}

export const ProductBatchRepositoryProvider = {
  provide: ProductBatchRepository,
  inject: [getRepositoryToken(ProductBatchEntity)],
  useFactory: (repository: Repository<ProductBatchEntity>) => {
    return new ProductBatchRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
