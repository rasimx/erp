import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';
import { AddGroupOperationCommand } from '@/product-batch-group/commands/add-group-operation/add-group-operation.command.js';

import { CreateProductBatchGroupCommand } from './commands/create-product-batch-group/create-product-batch-group.command.js';
import { DeleteProductBatchGroupCommand } from './commands/delete-product-batch-group/delete-product-batch-group.command.js';
import { MoveProductBatchGroupCommand } from './commands/move-product-batch-group/move-product-batch-group.command.js';
import { AddGroupOperationDto } from './dtos/add-group-operation.dto.js';
import { CreateProductBatchGroupDto } from './dtos/create-product-batch-group.dto.js';
import { MoveProductBatchGroupDto } from './dtos/move-product-batch-group.dto.js';
import {
  CommandResponse,
  ProductBatchGroupDto,
} from './dtos/product-batch-group.dto.js';
import { ProductBatchGroupDetailDto } from './dtos/product-batch-group-detail.dto.js';
import { ProductBatchGroupService } from './product-batch-group.service.js';
import { GetProductBatchGroupQuery } from './queries/get-product-batch-group/get-product-batch-group.query.js';
import { GetProductBatchGroupListQuery } from './queries/get-product-batch-group-list/get-product-batch-group-list.query.js';

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
  async addGroupOperation(
    @Args('dto', { type: () => AddGroupOperationDto })
    dto: AddGroupOperationDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new AddGroupOperationCommand(dto));
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
