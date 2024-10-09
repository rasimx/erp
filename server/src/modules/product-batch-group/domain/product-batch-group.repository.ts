import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import type { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';
import type { CreateProductBatchGroupDto } from '@/product-batch-group/dtos/create-product-batch-group.dto.js';
import type { MoveProductBatchGroupDto } from '@/product-batch-group/dtos/move-product-batch-group.dto.js';
import { StatusEntity } from '@/status/domain/status.entity.js';

import { ProductBatchGroupEntity } from './product-batch-group.entity.js';
import type { ProductBatchGroup } from './product-batch-group.js';

export class ProductBatchGroupRepository extends Repository<ProductBatchGroupEntity> {
  async nextId(): Promise<number> {
    const a: { nextval: number }[] = await this.query(
      "SELECT nextval('product_batch_group_id_seq')",
    );
    return Number(a[0].nextval);
  }

  async move(items: ProductBatchGroup[]) {
    if (items.length === 0) return;
    const values = items
      .map(item => {
        const obj = item.toObject();
        return `(${obj.id}, ${obj.order},${obj.statusId})`;
      })
      .join(',');

    const query = `
        update product_batch_group as pbg
        set "order" = updates."order",
            status_id = updates.status_id
        from (values ${values}) as updates(id, "order", status_id)
        where updates.id = pbg.id
    `;

    return this.manager.query(query);
  }

  async getLastOrder(statusId: number): Promise<number | null> {
    const lastItems: (ProductBatchEntity | ProductBatchGroupEntity)[] = [];
    const lastUngroupedBatch = await this.manager.findOne(ProductBatchEntity, {
      where: { statusId: statusId, groupId: IsNull() },
      order: { order: 'DESC' },
    });
    if (lastUngroupedBatch) lastItems.push(lastUngroupedBatch);

    const lastGroup = await this.findOne({
      where: { statusId: statusId },
      order: { order: 'DESC' },
    });
    if (lastGroup) lastItems.push(lastGroup);

    return lastItems.length
      ? Math.max(...lastItems.map(({ order }) => order))
      : null;
  }

  async createFromDto(dto: CreateProductBatchGroupDto & { id: number }) {
    const newEntity = new ProductBatchGroupEntity();
    Object.assign(newEntity, dto);
    return this.save(newEntity);
  }

  async moveOthersInOldStatus({
    oldOrder,
    oldStatusId,
  }: {
    oldOrder: number;
    oldStatusId: number;
  }) {
    const query = this.createQueryBuilder('pbg').where(
      '"order" > :oldOrder AND status_id = :oldStatusId',
      {
        oldOrder,
        oldStatusId,
      },
    );

    const affectedIds = await query
      .select('pbg.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    await query
      .update()
      .set({ order: () => '"order" - 1' })
      .execute();

    return affectedIds;
  }

  async moveOthersInNewStatus({
    id,
    newOrder,
    statusId,
  }: {
    id?: number;
    newOrder: number;
    statusId: number;
  }) {
    let query = this.createQueryBuilder('pbg').where(
      '"order" >= :newOrder AND status_id = :statusId',
      {
        newOrder,
        statusId,
      },
    );
    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }

    const affectedIds = await query
      .select('pbg.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    await query
      .update()
      .set({ order: () => '"order" + 1' })
      .execute();

    return affectedIds;
  }

  async moveOthersByMovingInside({
    id,
    newOrder,
    oldOrder,
    statusId,
  }: {
    id?: number;
    newOrder: number;
    oldOrder: number;
    statusId: number;
  }) {
    let query = this.createQueryBuilder('pbg');
    if (newOrder < oldOrder) {
      query = query.where(
        '"order" >= :newOrder AND "order" <= :oldOrder AND status_id = :statusId',
        {
          newOrder,
          oldOrder,
          statusId,
        },
      );
    } else {
      query = query.where(
        '"order" >= :oldOrder AND "order" <= :newOrder AND status_id = :statusId',
        {
          oldOrder,
          newOrder,
          statusId,
        },
      );
    }
    if (id) {
      query = query.andWhere('id != :id', {
        id,
      });
    }

    const affectedIds = await query
      .select('pbg.id')
      .getMany()
      .then(rows => rows.map(({ id }) => id));

    if (newOrder < oldOrder) {
      await query
        .update()
        .set({ order: () => '"order" + 1' })
        .execute();
    } else {
      await query
        .update()
        .set({ order: () => '"order" - 1' })

        .execute();
    }

    return affectedIds;
  }

  async moveOthers({
    id,
    statusId,
    oldStatusId,
    order,
    oldOrder,
  }: {
    id?: number;
    statusId: number | null;
    oldStatusId: number | null;
    order: number;
    oldOrder: number;
  }) {
    const affectedIds: number[] = [];
    if (statusId && oldStatusId === statusId) {
      // Перемещение внутри одного столбца
      affectedIds.push(
        ...(await this.moveOthersByMovingInside({
          statusId,
          id,
          newOrder: order,
          oldOrder,
        })),
      );
    } else {
      // Перемещение в другой столбец
      if (statusId) {
        affectedIds.push(
          ...(await this.moveOthersInNewStatus({
            id,
            newOrder: order,
            statusId,
          })),
        );
      }

      if (oldStatusId)
        affectedIds.push(
          ...(await this.moveOthersInOldStatus({ oldOrder, oldStatusId })),
        );
    }
    return affectedIds;
  }

  async moveProductBatchGroup(dto: MoveProductBatchGroupDto): Promise<{
    id: number;
    order: number;
    oldOrder: number;
    statusId: number;
    oldStatusId: number;
    affectedGroupIds: number[];
  }> {
    const { id, statusId } = dto;

    let order = dto.order;
    let group = await this.findOneOrFail({
      where: { id },
      relations: ['status'],
    });

    let lastOrder = 1;

    const lastOrderInStatus = await this.getLastOrder(statusId);
    if (lastOrderInStatus) {
      lastOrder =
        statusId == group.statusId ? lastOrderInStatus : lastOrderInStatus + 1;
    }

    order = order ? Math.min(order, lastOrder) : lastOrder;

    // if (!order) {
    //   const lastOrder = await this.getLastOrder(dto.statusId);
    //
    //   order = !lastOrder
    //     ? 1
    //     : statusId == group.statusId
    //       ? lastOrder
    //       : lastOrder + 1;
    // }

    const status = await this.manager.findOneOrFail(StatusEntity, {
      where: { id: statusId },
    });

    const oldOrder = group.order;
    group.order = order;
    const oldStatusId = group.statusId;
    group.status = status;
    group = await this.save(group);
    const affectedIds = await this.moveOthers({
      id: group.id,
      statusId,
      oldStatusId,
      order,
      oldOrder,
    });
    return {
      id,
      order,
      oldOrder,
      statusId,
      oldStatusId,
      affectedGroupIds: affectedIds,
    };
  }

  // todo: productId
  async findItems({ productIds, statusIds }: GetProductBatchListDto) {
    let query = this.createQueryBuilder('pbg')
      .leftJoinAndSelect(
        'pbg.productBatchList',
        'productBatchList',
        'productBatchList.count > 0',
      )
      .leftJoinAndSelect('productBatchList.product', 'product')
      .leftJoinAndSelect('product.setItems', 'setItems')
      .leftJoinAndSelect('setItems.product', 'setItemsProduct')
      .leftJoinAndSelect('pbg.status', 'status')
      .where('pbg.deleted_date is null');

    if (productIds.length) {
      query = query.andWhere('product.id in (:...productIds)', {
        productIds,
      });
    }
    if (statusIds.length) {
      query = query.andWhere('pbg.statusId in (:...statusIds)', {
        statusIds,
      });
    }

    const items = await query
      .orderBy('pbg.order', 'ASC')
      .addOrderBy('productBatchList.order', 'ASC')
      .getMany();

    return items.map(item => ({
      ...item,
      productBatchList: item.productBatchList.map(batch => ({
        ...batch,
        volume: batch.volume,
        weight: batch.weight,
        product: {
          ...batch.product,
          setItems: batch.product.setItems.map(item => ({
            ...item,
            ...item.product,
          })),
        },
      })),
    }));
  }
  async findById(id: number): Promise<ProductBatchGroupEntity> {
    const entity = await this.findOneOrFail({
      where: { id },
      relations: ['productBatchList', 'productBatchList.product', 'status'],
    });

    return {
      ...entity,
      productBatchList: entity.productBatchList.map(batch => ({
        ...batch,
        volume: batch.volume,
        weight: batch.weight,
      })),
    };
  }
}

export const ProductBatchGroupRepositoryProvider = {
  provide: ProductBatchGroupRepository,
  inject: [getRepositoryToken(ProductBatchGroupEntity)],
  useFactory: (repository: Repository<ProductBatchGroupEntity>) => {
    return new ProductBatchGroupRepository(
      repository.target,
      repository.manager,
      repository.queryRunner,
    );
  },
};
