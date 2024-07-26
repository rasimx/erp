import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ContextService } from '@/context/context.service.js';

import { CreateProductBatchGroupCommand } from './commands/impl/create-product-batch-group.command.js';
import { MoveProductBatchGroupCommand } from './commands/impl/move-product-batch-group.command.js';
import { CreateProductBatchGroupDto } from './dtos/create-product-batch-group.dto.js';
import { MoveProductBatchGroupDto } from './dtos/move-product-batch-group.dto.js';
import { ProductBatchGroupDto } from './dtos/product-batch-group.dto.js';
import { GetProductBatchGroupListQuery } from './queries/impl/get-product-batch-group-list.query.js';

@Injectable()
export class ProductBatchGroupService {
  constructor(
    private readonly contextService: ContextService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  async createProductBatchGroup(dto: CreateProductBatchGroupDto) {
    await this.commandBus.execute(new CreateProductBatchGroupCommand(dto));
    return this.queryBus.execute(new GetProductBatchGroupListQuery());
  }
  async moveProductBatchGroup(dto: MoveProductBatchGroupDto) {
    await this.commandBus.execute(new MoveProductBatchGroupCommand(dto));
    return this.queryBus.execute(new GetProductBatchGroupListQuery());
  }

  async deleteProductBatchGroup(id: number) {
    // await this.commandBus.execute(new MoveProductBatchCommand(dto));
    // return this.queryBus.execute(new GetProductBatchListQuery());
  }
}
