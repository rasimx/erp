import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateProductBatchCommand } from '@/product-batch/commands/impl/create-product-batch.command.js';
import { DeleteProductBatchCommand } from '@/product-batch/commands/impl/delete-product-batch.command.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/impl/move-product-batch.command.js';
import { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';
import { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchDto } from '@/product-batch/dtos/product-batch.dto.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { GetProductBatchListQuery } from '@/product-batch/queries/impl/get-product-batch-list.query.js';
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
    @Args('dto', { type: () => GetProductBatchListDto })
    dto: GetProductBatchListDto,
  ): Promise<ProductBatchDto[]> {
    return this.queryBus.execute(new GetProductBatchListQuery(dto));
  }
  //
  // @Mutation('updateProductBatch')
  // async updateProductBatch(
  //   @Args('input') input: UpdateProductBatchInput,
  // ): Promise<ProductBatch[]> {
  //   return this.service.updateProductBatch(input);
  // }

  @Mutation(() => CommandResponse)
  async createProductBatch(
    @Args('dto', { type: () => CreateProductBatchDto })
    dto: CreateProductBatchDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new CreateProductBatchCommand(dto));
    return { success: true };
  }

  @Mutation(() => CommandResponse)
  async moveProductBatch(
    @Args('dto', { type: () => MoveProductBatchDto })
    dto: MoveProductBatchDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new MoveProductBatchCommand(dto));
    return { success: true };
  }

  @Mutation(() => CommandResponse)
  async deleteProductBatch(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new DeleteProductBatchCommand(id));
    return { success: true };
  }
}
