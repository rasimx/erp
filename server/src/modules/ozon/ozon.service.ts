import { Injectable } from '@nestjs/common';

import { ContextService } from '@/context/context.service.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import type { ProductBatchEntity } from '@/product-batch/product-batch.entity.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { StatusType } from '@/status/status.entity.js';
import { StatusService } from '@/status/status.service.js';

@Injectable()
export class OzonService {
  constructor(
    private readonly ozonStateMicroservice: OzonStateMicroservice,
    private readonly contextService: ContextService,
    private readonly productBatchService: ProductBatchService,
    private readonly statusService: StatusService,
  ) {
    setTimeout(() => this.a(), 3000);
  }

  async a() {
    await this.contextService.run(async () => {
      this.contextService.userId = 1;
      await this.getInvalidProducts();
    });
  }

  async getInvalidProducts(): Promise<void> {
    const storeId = 1114008;
    const status = await this.statusService.findByStoreId(
      storeId,
      StatusType.ozon,
    );
    const res = await this.ozonStateMicroservice.currentFullState({
      storeId,
    });

    console.log(res);

    console.log(this.contextService.userId);
    const pbMap = await this.productBatchService.getProductBatchesMap(
      status.id,
      res.map(item => ({
        productId: item.baseProductId,
        productBatchId: item.lastProductBatchId,
      })),
    );
    const result = res.map(item => {
      const pbs = pbMap.get(item.baseProductId);
      const maxCount = pbs?.reduce((prev, cur) => prev + cur.count, 0) ?? 0;
      return { productId: item.baseProductId, count: item.count - maxCount };
    });
    console.log(result);
  }
}
