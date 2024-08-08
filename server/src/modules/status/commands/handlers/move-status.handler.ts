import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import { MoveStatusCommand } from '@/status/commands/impl/move-status.command.js';
import { StatusEntity } from '@/status/status.entity.js';
import { StatusEventStore } from '@/status/status.eventstore.js';
import { StatusRepository } from '@/status/status.repository.js';

@CommandHandler(MoveStatusCommand)
export class MoveStatusHandler implements ICommandHandler<MoveStatusCommand> {
  constructor(
    private readonly statusEventStore: StatusEventStore,
    private readonly statusRepository: StatusRepository,
    @InjectDataSource()
    private dataSource: CustomDataSource,
  ) {}

  async execute(command: MoveStatusCommand) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { dto } = command;

      await this.statusEventStore.moveStatus(dto);
      const statusRepository = queryRunner.manager.withRepository(
        this.statusRepository,
      );

      await statusRepository.moveStatus(dto);

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
