import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/impl/move-product-batch.command.js';
import { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchDto } from '@/product-batch/dtos/product-batch.dto.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { CommandResponse } from '@/product-batch-group/dtos/product-batch-group.dto.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class ProductBatchResolver {
  constructor(
    private readonly service: ProductBatchService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Query(() => [ProductBatchDto])
  async productBatchList(
    @Args('productId', { type: () => Int, nullable: true })
    productId: number | null,
  ): Promise<ProductBatchDto[]> {
    return this.service.productBatchList(productId);
  }
  //
  // @Mutation('updateProductBatch')
  // async updateProductBatch(
  //   @Args('input') input: UpdateProductBatchInput,
  // ): Promise<ProductBatch[]> {
  //   return this.service.updateProductBatch(input);
  // }

  @Mutation(() => [ProductBatchDto])
  async createProductBatch(
    @Args('dto', { type: () => CreateProductBatchDto })
    dto: CreateProductBatchDto,
  ): Promise<ProductBatchDto[]> {
    return this.service.createProductBatchGroup(dto);
  }

  @Mutation(() => CommandResponse)
  async moveProductBatch(
    @Args('dto', { type: () => MoveProductBatchDto })
    dto: MoveProductBatchDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new MoveProductBatchCommand(dto));
    return { success: true };
  }

  @Mutation(() => Int)
  async deleteProductBatch(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<void> {
    return this.service.deleteProductBatchGroup(id);
  }
}
