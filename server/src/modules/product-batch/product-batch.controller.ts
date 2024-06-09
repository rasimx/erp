import { Controller } from '@nestjs/common';

import type {
  FindLatestRequest,
  ProductBatchListResponse,
  ProductBatchServiceController,
} from '@/microservices/proto/erp.pb.js';
import { ProductBatchServiceControllerMethods } from '@/microservices/proto/erp.pb.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';

@Controller()
@ProductBatchServiceControllerMethods()
export class ProductBatchController implements ProductBatchServiceController {
  constructor(private readonly productBatchService: ProductBatchService) {}

  async findLatest(
    request: FindLatestRequest,
  ): Promise<ProductBatchListResponse> {
    const items = await this.productBatchService.findLatest(request);
    return { items };
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
