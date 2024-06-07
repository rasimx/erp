import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

import {
  ERP_OZON_PACKAGE_NAME,
  STATE_SERVICE_NAME,
} from '@/microservices/proto/erp_ozon.pb.js';
import type {
  StateServiceClient,
  FullStateItem,
  FullStateItemRequest,
  OzonProduct,
  ProductListRequest,
} from '@/microservices/proto/erp_ozon.pb.js';

@Injectable()
export class OzonStateMicroservice implements OnModuleInit {
  private stateService: StateServiceClient;

  constructor(@Inject(ERP_OZON_PACKAGE_NAME) private client: ClientGrpcProxy) {}

  onModuleInit() {
    this.stateService =
      this.client.getService<StateServiceClient>(STATE_SERVICE_NAME);
    // this.a();
  }

  async a() {
    const a = await this.currentFullState({});
    console.log(a);
  }

  async currentFullState(
    request: FullStateItemRequest = {},
  ): Promise<FullStateItem[]> {
    const { items } = await lastValueFrom(
      this.stateService.currentFullState(request),
    );
    return items;
  }

  async productList(skuList: string[]): Promise<OzonProduct[]> {
    const { items } = await lastValueFrom(
      this.stateService.productList({ skuList }),
    );
    return items;
  }
}
