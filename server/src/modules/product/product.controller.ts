import { Controller, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { ContextService } from '@/context/context.service.js';
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
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
  ) {}

  async insert({
    items: newItems,
    inTransaction,
  }: InsertProductListRequest): Promise<InsertProductListResponse> {
    if (inTransaction) {
      return this.productService.createInsertTransaction(newItems);
    }
    // const items = await this.productService.insert(newItems);
    // @ts-ignore
    return { items };
  }

  async findManyBySku(
    request: FindManyBySkuRequest,
  ): Promise<FindManyBySkuResponse> {
    const { userId } = this.contextService;
    const items = await this.productService.findManyBySku(request.skuList);
    return { items };
  }
}
