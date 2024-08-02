import { Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import {
  ERP_OZON_PACKAGE_NAME,
  POSTING_PRODUCT_SERVICE_NAME,
  type PostingProductServiceClient,
  type RelinkPostingsRequest,
  type RelinkPostingsResponse,
} from '@/microservices/proto/erp_ozon.pb.js';

@Injectable()
export class OzonPostingProductMicroservice implements OnModuleInit {
  private postingProductService: PostingProductServiceClient;

  constructor(@Inject(ERP_OZON_PACKAGE_NAME) private client: ClientGrpcProxy) {}

  onModuleInit() {
    this.postingProductService =
      this.client.getService<PostingProductServiceClient>(
        POSTING_PRODUCT_SERVICE_NAME,
      );
  }

  async relinkPostings(
    request: RelinkPostingsRequest,
    metadata?: Metadata,
  ): Promise<RelinkPostingsResponse> {
    return lastValueFrom(this.postingProductService.relinkPostings(request));
  }
}
