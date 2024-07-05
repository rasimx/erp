import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { formatDate } from '@/common/helpers/date.js';
import { ContextService } from '@/context/context.service.js';
import { CustomDataSource } from '@/database/custom.data-source.js';
import type { ProductBatch } from '@/graphql.schema.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import { ProductService } from '@/product/product.service.js';
import { MoveProductBatchGroupDto } from '@/product-batch/dtos/move-product-batch-group.dto.js';
import { StatusService } from '@/status/status.service.js';

import { CreateProductBatchGroupCommand } from './commands/impl/create-product-batch-group.command.js';
import { MoveProductBatchGroupCommand } from './commands/impl/move-product-batch-group.command.js';
import { CreateProductBatchGroupDto } from './dtos/create-product-batch-group.dto.js';
import { ProductBatchGroupDto } from './dtos/product-batch-group.dto.js';
import { ProductBatchGroupEntity } from './product-batch-group.entity.js';
import { GetProductBatchListQuery } from './queries/impl/get-product-batch-list.query.js';

@Injectable()
export class ProductBatchService {
  constructor(
    @InjectRepository(ProductBatchGroupEntity)
    private readonly repository: Repository<ProductBatchGroupEntity>,
    private readonly productService: ProductService,
    private readonly ozonStateMicroservice: OzonStateMicroservice,
    private readonly contextService: ContextService,
    private readonly statusService: StatusService,
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  async productBatchList(
    productId?: number | null,
  ): Promise<ProductBatchGroupDto[]> {
    return this.queryBus.execute(new GetProductBatchListQuery(productId));
  }

  async createProductBatch(dto: CreateProductBatchGroupDto) {
    await this.commandBus.execute(new CreateProductBatchGroupCommand(dto));
    return this.queryBus.execute(new GetProductBatchListQuery());
  }
  async moveProductBatch(dto: MoveProductBatchGroupDto) {
    await this.commandBus.execute(new MoveProductBatchGroupCommand(dto));
    return this.queryBus.execute(new GetProductBatchListQuery());
  }

  async deleteProductBatch(id: number) {
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
