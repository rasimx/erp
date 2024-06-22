import { Injectable } from '@nestjs/common';

import { ContextService } from '@/context/context.service.js';
import { StatusType, type Store } from '@/graphql.schema.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import type { StatusByStoreEntity } from '@/status/status.entity.js';
import { StatusService } from '@/status/status.service.js';

@Injectable()
export class StoreService {
  constructor(
    private readonly ozonStateMicroservice: OzonStateMicroservice,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
    private readonly productService: ProductService,
    private readonly statusService: StatusService,
  ) {
    // setTimeout(() => this.a(), 3000);
  }

  async a() {
    await this.contextService.run(async () => {
      this.contextService.userId = 1;
      const a = await this.storeState({ productId: 77 });
      console.log(a);
    });
  }

  async getOzonStoreState({
    statusList,
    productId,
  }: {
    statusList: StatusByStoreEntity[];
    productId?: number;
  }): Promise<Store[]> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (statusList.find(item => item.storeId === null))
      throw new Error('storeId is null');

    const storeId = statusList.length == 1 ? statusList[0].storeId : undefined;

    const res = await this.ozonStateMicroservice.currentFullState({
      baseProductId: productId,
      storeId,
    });

    const statusMap = new Map(statusList.map(item => [item.storeId, item]));

    const pbMap = await this.productBatchService.getProductBatchesMapByStatusId(
      res.flatMap(store =>
        store.items.map(item => {
          const statusId = statusMap.get(store.storeId)?.id;
          if (!statusId) throw new Error('statusId was not found');
          return {
            productId: item.baseProductId,
            statusId,
            productBatchId: item.lastProductBatchId,
          };
        }),
      ),
    );

    const products = await this.productService.findByIds(
      res.flatMap(store =>
        store.items.map(({ baseProductId }) => baseProductId),
      ),
    );
    const productMap = new Map(products.map(item => [item.id, item]));

    return res.map(store => ({
      id: store.storeId,
      items: store.items.map(item => {
        const product = productMap.get(item.baseProductId);
        if (!product) throw new Error('product not found');
        return {
          salesCount: item.salesCount,
          inStoreCount: item.inStoreCount,
          product,
          productBatches: pbMap.get(store.storeId)?.get(product.id) ?? [],
        };
      }),
    }));
  }

  async storeState({
    productId,
    statusId,
  }: {
    productId?: number;
    statusId?: number;
  }): Promise<Store[]> {
    let statusList: StatusByStoreEntity[] = [];
    if (statusId) {
      const status = await this.statusService.findById(statusId);
      statusList.push(status as StatusByStoreEntity);
    } else {
      statusList = (await this.statusService.find({
        id: statusId,
      })) as StatusByStoreEntity[];
    }
    if (statusList.length == 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (statusId && statusList[0].type == StatusType.ozon) {
      return this.getOzonStoreState({
        productId,
        statusList,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (statusId && statusList[0].type == StatusType.wb) {
      return this.getOzonStoreState({
        productId,
        statusList,
      });
    }
    return [];
  }
}
