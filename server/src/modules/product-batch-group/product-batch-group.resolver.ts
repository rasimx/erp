import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';
import { CreateProductBatchGroupCommand } from '@/product-batch-group/commands/impl/create-product-batch-group.command.js';
import { DeleteProductBatchGroupCommand } from '@/product-batch-group/commands/impl/delete-product-batch-group.command.js';
import { MoveProductBatchGroupCommand } from '@/product-batch-group/commands/move-product-batch-group/move-product-batch-group.command.js';
import { ProductBatchGroupDetailDto } from '@/product-batch-group/dtos/product-batch-group-detail.dto.js';
import { GetProductBatchGroupQuery } from '@/product-batch-group/queries/impl/get-product-batch-group.query.js';
import { GetProductBatchGroupListQuery } from '@/product-batch-group/queries/impl/get-product-batch-group-list.query.js';

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
    @Args('dto', { type: () => GetProductBatchListDto })
    dto: GetProductBatchListDto,
  ): Promise<ProductBatchGroupDto[]> {
    return this.queryBus.execute(new GetProductBatchGroupListQuery(dto));
  }

  @Query(() => ProductBatchGroupDetailDto)
  async productBatchGroupDetail(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<ProductBatchGroupDetailDto[]> {
    return this.queryBus.execute(new GetProductBatchGroupQuery(id));
  }

  @Mutation(() => CommandResponse)
  async createProductBatchGroup(
    @Args('dto', { type: () => CreateProductBatchGroupDto })
    dto: CreateProductBatchGroupDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new CreateProductBatchGroupCommand(dto));
    return { success: true };
  }

  @Mutation(() => CommandResponse)
  async moveProductBatchGroup(
    @Args('dto', { type: () => MoveProductBatchGroupDto })
    dto: MoveProductBatchGroupDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new MoveProductBatchGroupCommand(dto));
    return { success: true };
  }

  @Mutation(() => CommandResponse)
  async deleteProductBatchGroup(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new DeleteProductBatchGroupCommand(id));
    return { success: true };
  }
}
