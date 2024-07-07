import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { MoveProductBatchGroupCommand } from '@/product-batch-group/commands/impl/move-product-batch-group.command.js';

import { CreateProductBatchGroupDto } from './dtos/create-product-batch-group.dto.js';
import { MoveProductBatchGroupDto } from './dtos/move-product-batch-group.dto.js';
import {
  CommandResponse,
  ProductBatchGroupDto,
} from './dtos/product-batch-group.dto.js';
import { ProductBatchGroupService } from './product-batch-group.service.js';

@Resolver()
@UseInterceptors(UserInterceptor)
export class ProductBatchGroupResolver {
  constructor(
    private readonly service: ProductBatchGroupService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Query(() => [ProductBatchGroupDto])
  async productBatchGroupList(
    @Args('productId', { type: () => Int, nullable: true })
    productId: number | null,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.productBatchGroupList(productId);
  }
  //
  // @Mutation('updateProductBatch')
  // async updateProductBatch(
  //   @Args('input') input: UpdateProductBatchInput,
  // ): Promise<ProductBatch[]> {
  //   return this.service.updateProductBatch(input);
  // }

  @Mutation(() => [ProductBatchGroupDto])
  async createProductBatchGroup(
    @Args('dto', { type: () => CreateProductBatchGroupDto })
    dto: CreateProductBatchGroupDto,
  ): Promise<ProductBatchGroupDto[]> {
    return this.service.createProductBatchGroup(dto);
  }

  @Mutation(() => CommandResponse)
  async moveProductBatchGroup(
    @Args('dto', { type: () => MoveProductBatchGroupDto })
    dto: MoveProductBatchGroupDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new MoveProductBatchGroupCommand(dto));
    return { success: true };
  }

  @Mutation(() => Int)
  async deleteProductBatchGroup(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<void> {
    return this.service.deleteProductBatchGroup(id);
  }
}
