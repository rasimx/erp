import { UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserInterceptor } from '@/auth/user.interceptor.js';
import { CreateProductBatchCommand } from '@/product-batch/commands/create-product-batch/create-product-batch.command.js';
import { CreateProductBatchesByAssemblingCommand } from '@/product-batch/commands/create-product-batches-by-assembling/create-product-batches-by-assembling.command.js';
import { CreateProductBatchesFromSourcesCommand } from '@/product-batch/commands/create-product-batches-from-sources/create-product-batches-from-sources.command.js';
import { DeleteProductBatchCommand } from '@/product-batch/commands/delete-product-batch/delete-product-batch.command.js';
import { EditProductBatchCommand } from '@/product-batch/commands/edit-product-batch/edit-product-batch.command.js';
import { MoveProductBatchCommand } from '@/product-batch/commands/move-product-batch/move-product-batch.command.js';
import { CreateProductBatchListDto } from '@/product-batch/dtos/create-product-batch-list.dto.js';
import { CreateProductBatchesByAssemblingDto } from '@/product-batch/dtos/create-product-batches-by-assembling.dto.js';
import { CreateProductBatchesFromSourcesDto } from '@/product-batch/dtos/create-product-batches-from-sources.dto.js';
import { GetProductBatchListDto } from '@/product-batch/dtos/get-product-batch-list.dto.js';
import { MoveProductBatchDto } from '@/product-batch/dtos/move-product-batch.dto.js';
import { ProductBatchDto } from '@/product-batch/dtos/product-batch.dto.js';
import { ProductBatchDetailDto } from '@/product-batch/dtos/product-batch-detail.dto.js';
import { ProductBatchService } from '@/product-batch/product-batch.service.js';
import { GetProductBatchQuery } from '@/product-batch/queries/impl/get-product-batch.query.js';
import { GetProductBatchListQuery } from '@/product-batch/queries/impl/get-product-batch-list.query.js';
import { CommandResponse } from '@/product-batch-group/dtos/product-batch-group.dto.js';

import { EditProductBatchDto } from './dtos/edit-product-batch.dto.js';

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
  async createProductBatchesByAssembling(
    @Args('dto', { type: () => CreateProductBatchesByAssemblingDto })
    dto: CreateProductBatchesByAssemblingDto,
  ): Promise<CommandResponse> {
    await this.commandBus.execute(
      new CreateProductBatchesByAssemblingCommand(dto),
    );
    return { success: true };
  }

  @Mutation(() => CommandResponse)
  async createProductBatchesFromSources(
    @Args('dto', { type: () => CreateProductBatchesFromSourcesDto })
    dto: CreateProductBatchesFromSourcesDto,
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
