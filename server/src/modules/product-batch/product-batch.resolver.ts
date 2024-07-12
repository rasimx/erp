import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateProductBatchCommand } from '@/product-batch/commands/impl/create-product-batch.command.js';
import { DeleteProductBatchCommand } from '@/product-batch/commands/impl/delete-product-batch.command.js';
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

  @Mutation(() => CommandResponse)
  async createProductBatch(
    @Args('dto', { type: () => CreateProductBatchDto })
    dto: CreateProductBatchDto,
    @Args('statusId', { type: () => Int, nullable: true })
    statusId: number | null,
    @Args('groupId', { type: () => Int, nullable: true })
    groupId: number | null,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(
      new CreateProductBatchCommand(dto, statusId, groupId),
    );
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
