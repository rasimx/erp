import { Controller, UseInterceptors } from '@nestjs/common';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import {
  type CreateStatusRequest,
  type CreateStatusResponse,
  type FindLatestRequest,
  type ProductBatchListResponse,
  type ProductBatchServiceController,
  ProductBatchServiceControllerMethods,
} from '@/microservices/proto/erp.pb.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { StatusService } from '@/status/status.service.js';

@Controller()
@UseInterceptors(UserInterceptor)
@ProductBatchServiceControllerMethods()
export class ProductBatchController implements ProductBatchServiceController {
  constructor(
    private readonly productBatchService: ProductBatchService,
    private readonly statusService: StatusService,
  ) {}

  async findLatest(
    request: FindLatestRequest,
  ): Promise<ProductBatchListResponse> {
    const items = await this.productBatchService.findLatest(request);
    return { items };
  }

  async createStatus(
    request: CreateStatusRequest,
  ): Promise<CreateStatusResponse> {
    try {
      // @ts-expect-error StatusType -> string
      await this.statusService.createStatus(request);
    } catch (e: unknown) {
      return { error: (e as Error).message };
    }
    return {};
  }

  // async productBatchListByProductId({
  //   productIdList,
  // }: ProductBatchListByProductIdRequest): Promise<ProductBatchListResponse> {
  //   const items =
  //     await this.productBatchService.findManyByProductId(productIdList);
  //
  //   return {
  //     items: items.map(item => {
  //       return {
  //         ...item,
  //         sku: item.product.sku,
  //       };
  //     }),
  //   };
  // }
  // async productBatchListById({
  //   idList,
  // }: ProductBatchListByIdRequest): Promise<ProductBatchListResponse> {
  //   const items = await this.productBatchService.findByIds(idList);
  //
  //   return {
  //     items: items.map(item => {
  //       return {
  //         ...item,
  //         sku: item.product.sku,
  //       };
  //     }),
  //   };
  // }
  // async productBatchListFromId({
  //   id,
  // }: ProductBatchListFromIdRequest): Promise<ProductBatchListResponse> {
  //   const items = await this.productBatchService.findFromId(id);
  //
  //   return {
  //     items: items.map(item => {
  //       return {
  //         ...item,
  //         sku: item.product.sku,
  //       };
  //     }),
  //   };
  // }
  //
  // async updatedProductBatchList({}: UpdatedProductBatchListRequest): Promise<ProductBatchListResponse> {
  //   const items = await this.productBatchService.getCountUpdatedList();
  //
  //   return {
  //     items: items.map(item => {
  //       return {
  //         ...item,
  //         sku: item.product.sku,
  //       };
  //     }),
  //   };
  // }
}
