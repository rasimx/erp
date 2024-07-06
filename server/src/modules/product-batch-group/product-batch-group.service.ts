import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ContextService } from '@/context/context.service.js';

import { CreateProductBatchGroupCommand } from './commands/impl/create-product-batch-group.command.js';
import { MoveProductBatchGroupCommand } from './commands/impl/move-product-batch-group.command.js';
import { CreateProductBatchGroupDto } from './dtos/create-product-batch-group.dto.js';
import { MoveProductBatchGroupDto } from './dtos/move-product-batch-group.dto.js';
import { ProductBatchGroupDto } from './dtos/product-batch-group.dto.js';
import { GetProductBatchGroupListQuery } from './queries/impl/get-product-batch-group-list.query.js';

@Injectable()
export class ProductBatchGroupService {
  constructor(
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  async productBatchGroupList(
    productId?: number | null,
  ): Promise<ProductBatchGroupDto[]> {
    return this.queryBus.execute(new GetProductBatchGroupListQuery(productId));
  }

  async createProductBatchGroup(dto: CreateProductBatchGroupDto) {
    await this.commandBus.execute(new CreateProductBatchGroupCommand(dto));
    return this.queryBus.execute(new GetProductBatchGroupListQuery());
  }
  async moveProductBatchGroup(dto: MoveProductBatchGroupDto) {
    await this.commandBus.execute(new MoveProductBatchGroupCommand(dto));
    return this.queryBus.execute(new GetProductBatchGroupListQuery());
  }

  async deleteProductBatchGroup(id: number) {
    // await this.commandBus.execute(new MoveProductBatchCommand(dto));
    // return this.queryBus.execute(new GetProductBatchListQuery());
  }

  // async getProductBatchesMapByStatusId(
  //   productBatches: {
  //     productId: number;
  //     statusId: number;
  //     productBatchId?: number;
  //   }[],
  // ): Promise<Map<number, Map<number, ProductBatch[]>>> {
  //   const entityManager = this.repository;
  //
  //   // Преобразуем массив объектов в массив строк для SQL-запроса
  //   const productBatchConditions = productBatches
  //     .map(pb => {
  //       const common = `
  //       pb.product_id = ${pb.productId.toString()}
  //       AND pb.status_id = ${pb.statusId.toString()}
  //       `;
  //       if (pb.productBatchId) {
  //         return `(
  //           ${common}
  //           AND pb.date >= (SELECT date FROM product_batch WHERE id = ${pb.productBatchId.toString()})
  //           )`;
  //       } else {
  //         return `(${common})`;
  //       }
  //     })
  //     .join(' OR ');
  //
  //   const query = `
  //   SELECT pb.id
  //   FROM product_batch pb
  //   WHERE (${productBatchConditions})
  //   ORDER BY pb.product_id, pb.date;
  // `;
  //
  //   const rows: { id: number }[] = await entityManager.query(query);
  //
  //   const pbMapByProductId = new Map<number, Map<number, ProductBatch[]>>();
  //
  //   const items = await this.findProductBatchByIds(rows.map(row => row.id));
  //
  //   items.forEach(row => {
  //     let mapItem = pbMapByProductId.get(row.statusId);
  //     if (!mapItem) mapItem = new Map<number, ProductBatch[]>();
  //     let subMapItem = mapItem.get(row.productId);
  //     if (!subMapItem) subMapItem = [];
  //     subMapItem.push(row);
  //     mapItem.set(row.productId, subMapItem);
  //     pbMapByProductId.set(row.statusId, mapItem);
  //   });
  //
  //   return pbMapByProductId;
  // }
}
