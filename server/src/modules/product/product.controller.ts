import { Controller } from '@nestjs/common';

import type {
  FindManyBySkuRequest,
  FindManyBySkuResponse,
  InsertProductListRequest,
  InsertProductListResponse,
  ProductServiceController,
} from '@/microservices/proto/erp.pb.js';
import { ProductServiceControllerMethods } from '@/microservices/proto/erp.pb.js';
import { ProductService } from '@/product/product.service.js';

@Controller()
@ProductServiceControllerMethods()
export class ProductController implements ProductServiceController {
  constructor(private readonly productService: ProductService) {}

  async insert({
    items: newItems,
    inTransaction,
  }: InsertProductListRequest): Promise<InsertProductListResponse> {
    if (inTransaction) {
      return this.productService.createInsertTransaction(newItems);
    }
    const items = await this.productService.insert(newItems);
    return { items };
  }

  async findManyBySku(
    request: FindManyBySkuRequest,
  ): Promise<FindManyBySkuResponse> {
    const items = await this.productService.findManyBySku(request.skuList);
    return { items };
  }
}
