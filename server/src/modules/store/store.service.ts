import { Injectable } from '@nestjs/common';

import { ContextService } from '@/context/context.service.js';
import { type Store, type StoreInput, StoreType } from '@/graphql.schema.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import type { FullStateItem } from '@/microservices/proto/erp_ozon.pb.js';
import { ProductService } from '@/product/product.service.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@Injectable()
export class StoreService {
  constructor(
    private readonly ozonStateMicroservice: OzonStateMicroservice,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
    private readonly productService: ProductService,
  ) {
    setTimeout(() => this.a(), 3000);
  }

  async a() {
    await this.contextService.run(async () => {
      this.contextService.userId = 1;
      const a = await this.storeState({ productId: 77 });
      console.log(a);
    });
  }

  async getOzonStoreState({
    productId,
    storeId,
  }: {
    productId?: number;
    storeId?: number;
  }): Promise<Store[]> {
    const res = await this.ozonStateMicroservice.currentFullState({
      baseProductId: productId,
      storeId,
    });

    const pbMap = await this.productBatchService.getProductBatchesMapByStoreId(
      res.flatMap(store =>
        store.items.map(item => ({
          productId: item.baseProductId,
          storeId: store.storeId,
          storeType: StoreType.ozon,
          productBatchId: item.lastProductBatchId,
        })),
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
          productBatches: pbMap.get(store.storeId) ?? [],
        };
      }),
    }));
  }

  async storeState({
    productId,
    storeInput,
  }: {
    productId?: number;
    storeInput?: StoreInput;
  }): Promise<Store[]> {
    if (storeInput?.storeType == StoreType.ozon) {
      return this.getOzonStoreState({ productId, storeId: storeInput.storeId });
    } else if (storeInput?.storeType == StoreType.wb) {
      return this.getOzonStoreState({
        productId,
        storeId: storeInput.storeId,
      });
    }
    return this.getOzonStoreState({ productId });
  }
}
