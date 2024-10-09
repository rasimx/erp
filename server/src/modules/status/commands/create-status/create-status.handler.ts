import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { RequestRepository } from '@/request/request.repository.js';
import { CreateStatusCommand } from '@/status/commands/create-status/create-status.command.js';
import { Status } from '@/status/domain/status.js';
import { StatusRepository } from '@/status/domain/status.repository.js';
import { StatusEventRepository } from '@/status/domain/status-event.repository.js';

@CommandHandler(CreateStatusCommand)
export class CreateStatusHandler
  implements ICommandHandler<CreateStatusCommand>
{
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly contextService: ContextService,
    private readonly requestRepo: RequestRepository,
    private readonly statusRepo: StatusRepository,
    private readonly statusEventRepo: StatusEventRepository,
  ) {}

  async execute(command: CreateStatusCommand) {
    const requestId = this.contextService.requestId;
    if (!requestId) throw new Error('requestId was not defined');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const statusRepo = queryRunner.manager.withRepository(this.statusRepo);
    const statusEventRepo = queryRunner.manager.withRepository(
      this.statusEventRepo,
    );

    try {
      const requestRepo = queryRunner.manager.withRepository(this.requestRepo);
      await requestRepo.insert({ id: requestId });

      const { dto } = command;

      const aggregatesIds = statusRepo.nextIds(1);

      const lastOrder = await statusRepo.getLastOrder();

      const status = Status.create({
        ...dto,
        id: aggregatesIds[0],
        order: lastOrder ? lastOrder + 1 : 1,
      });

      await statusEventRepo.saveAggregateEvents({
        aggregates: [status],
        requestId,
      });

      await statusRepo.save(status.toObject());

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
