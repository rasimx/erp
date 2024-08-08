import { Controller, UseInterceptors } from '@nestjs/common';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import {
  type CreateStatusRequest,
  type CreateStatusResponse,
  type FindLatestRequest,
  type ProductBatchListResponse,
  ProductBatchServiceControllerMethods,
} from '@/microservices/proto/erp.pb.js';
import { ProductBatchRepository } from '@/product-batch/product-batch.repository.js';
import { StatusService } from '@/status/status.service.js';

@Controller()
@UseInterceptors(UserInterceptor)
@ProductBatchServiceControllerMethods()
// export class ProductBatchController implements ProductBatchServiceController {
export class ProductBatchController {
  constructor(
    private readonly productBatchRepository: ProductBatchRepository,
    private readonly statusService: StatusService,
  ) {}

  async findLatest(
    request: FindLatestRequest,
  ): Promise<ProductBatchListResponse> {
    const map = await this.productBatchRepository.findLatest(request);
    return {
      items: [...map.entries()].map(([productId, items]) => ({
        productId,
        items,
      })),
    };
  }

  async createStatus(
    request: CreateStatusRequest,
  ): Promise<CreateStatusResponse> {
    try {
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
