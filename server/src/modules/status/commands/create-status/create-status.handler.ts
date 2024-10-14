import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { RequestRepository } from '@/request/request.repository.js';
import { CreateStatusCommand } from '@/status/commands/create-status/create-status.command.js';
import { StatusService } from '@/status/status.service.js';

@CommandHandler(CreateStatusCommand)
export class CreateStatusHandler
  implements ICommandHandler<CreateStatusCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly requestRepo: RequestRepository,
    private readonly statusService: StatusService,
  ) {}

  async execute(command: CreateStatusCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const { dto } = command;
      await this.statusService.create({
        requestId,
        queryRunner,
        dto,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
