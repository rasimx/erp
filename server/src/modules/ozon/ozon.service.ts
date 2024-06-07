import { Injectable } from '@nestjs/common';

import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import { OZON_STATUS_ID } from '@/ozon/ozon.constants.js';
import { ProductEntity } from '@/product/product.entity.js';
import {
  ProductBatchEntity,
  type ProductBatchEntityForInsert,
} from '@/product-batch/product-batch.entity.js';

@Injectable()
export class OzonService {
  constructor(private readonly ozonStateMicroservice: OzonStateMicroservice) {}

  // async aaa() {
  //   const statusId = OZON_STATUS_ID; // в базе данных лежит статус с id=14 для озона
  //   const queryRunner = this.dataSource.createQueryRunner();
  //
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const currentFullStateItems =
  //       await this.ozonStateMicroservice.currentFullState();
  //
  //     const skuList = currentFullStateItems.map(item => item.sku);
  //
  //     const ozonProducts =
  //       await this.ozonStateMicroservice.productList(skuList);
  //
  //     const newProducts = await queryRunner.manager.save(
  //       ProductEntity,
  //       ozonProducts,
  //     );
  //
  //     const newProductsMap = new Map(newProducts.map(item => [item.sku, item]));
  //
  //     // const products = await this.productService.findBySku(stockList.map(({sku}) => sku))
  //
  //     const items: ProductBatchEntityForInsert[] = currentFullStateItems.map(
  //       item => {
  //         const product = newProductsMap.get(item.sku);
  //         if (!product) throw new Error('product not found');
  //         const entity = new ProductBatchEntity();
  //         Object.assign(entity, {
  //           productId: product.id,
  //           statusId,
  //           count: item.presentQuantity + (item.soldQuantity || 0),
  //           costPrice: 0,
  //           date: '2024-05-12',
  //         });
  //         return entity;
  //       },
  //     );
  //
  //     await queryRunner.manager.save(ProductBatchEntity, items);
  //
  //     const b = await queryRunner.commitTransaction();
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
