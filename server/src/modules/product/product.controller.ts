import { Controller, UseInterceptors } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { UserInterceptor } from '@/auth/user.interceptor.js';
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
@UseInterceptors(UserInterceptor)
@ProductServiceControllerMethods()
export class ProductController implements ProductServiceController {
  constructor(
    private readonly productService: ProductService,
    private readonly cls: ClsService,
  ) {}

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
  private generateId() {
    return Math.random();
  }
}
