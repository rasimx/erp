import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { AddOperationCommand } from '@/product-batch/commands/add-operation/add-operation.command.js';
import { CommandResponse } from '@/product-batch-group/dtos/product-batch-group.dto.js';

import { CreateProductBatchCommand } from './commands/create-product-batch/create-product-batch.command.js';
import { CreateProductBatchesFromSourcesCommand } from './commands/create-product-batches-from-sources/create-product-batches-from-sources.command.js';
import { DeleteProductBatchCommand } from './commands/delete-product-batch/delete-product-batch.command.js';
import { EditProductBatchCommand } from './commands/edit-product-batch/edit-product-batch.command.js';
import { MoveProductBatchCommand } from './commands/move-product-batch/move-product-batch.command.js';
import { AddOperationDto } from './dtos/add-operation.dto.js';
import { CreateProductBatchListDto } from './dtos/create-product-batch-list.dto.js';
import { CreateProductBatchesFromSourcesListDto } from './dtos/create-product-batches-from-sources-list.dto.js';
import { EditProductBatchDto } from './dtos/edit-product-batch.dto.js';
import { GetProductBatchListDto } from './dtos/get-product-batch-list.dto.js';
import { MoveProductBatchDto } from './dtos/move-product-batch.dto.js';
import { ProductBatchDto } from './dtos/product-batch.dto.js';
import { ProductBatchDetailDto } from './dtos/product-batch-detail.dto.js';
import { ProductBatchService } from './product-batch.service.js';
import { GetProductBatchQuery } from './queries/impl/get-product-batch.query.js';
import { GetProductBatchListQuery } from './queries/impl/get-product-batch-list.query.js';

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

  @Query(() => ProductBatchDetailDto)
  async productBatchDetail(
    @Args('id', { type: () => Int })
    id: number,
  ): Promise<ProductBatchDetailDto[]> {
    return this.queryBus.execute(new GetProductBatchQuery(id));
  }
  //
  // @Mutation('updateProductBatch')
  // async updateProductBatch(
  //   @Args('input') input: UpdateProductBatchInput,
  // ): Promise<ProductBatchAggregate[]> {
  //   return this.service.updateProductBatch(input);
  // }

  @Mutation(() => CommandResponse)
  async createProductBatch(
    @Args('dto', { type: () => CreateProductBatchListDto })
    dto: CreateProductBatchListDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new CreateProductBatchCommand(dto));
    return { success: true };
  }
  @Mutation(() => CommandResponse)
  async editProductBatch(
    @Args('dto', { type: () => EditProductBatchDto })
    dto: EditProductBatchDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new EditProductBatchCommand(dto));
    return { success: true };
  }

  @Mutation(() => CommandResponse)
  async addOperation(
    @Args('dto', { type: () => AddOperationDto }) dto: AddOperationDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(new AddOperationCommand(dto));
    return { success: true };
  }

  @Mutation(() => CommandResponse)
  async createProductBatchesFromSources(
    @Args('dto', { type: () => CreateProductBatchesFromSourcesListDto })
    dto: CreateProductBatchesFromSourcesListDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(
      new CreateProductBatchesFromSourcesCommand(dto),
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
