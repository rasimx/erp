import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { CreateStatusCommand } from '@/status/commands/impl/create-status.command.js';
import { StatusEventStore } from '@/status/status.eventstore.js';
import { StatusRepository } from '@/status/status.repository.js';

@CommandHandler(CreateStatusCommand)
export class CreateStatusHandler
  implements ICommandHandler<CreateStatusCommand>
{
  constructor(
    private readonly statusEventStore: StatusEventStore,
    private readonly statusRepository: StatusRepository,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: CreateStatusCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;
      const statusRepository = queryRunner.manager.withRepository(
        this.statusRepository,
      );

      const entity = await statusRepository.createFromDto(dto);

      await this.statusEventStore.createStatus(entity.id, dto);

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
