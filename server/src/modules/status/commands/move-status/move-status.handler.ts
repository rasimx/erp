import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';

import { ContextService } from '@/context/context.service.js';
import type { CustomDataSource } from '@/database/custom.data-source.js';
import { RequestRepository } from '@/request/request.repository.js';
import { MoveStatusCommand } from '@/status/commands/move-status/move-status.command.js';
import { StatusRepository } from '@/status/domain/status.repository.js';
import { StatusEventRepository } from '@/status/domain/status-event.repository.js';
import { StatusService } from '@/status/status.service.js';

@CommandHandler(MoveStatusCommand)
export class MoveStatusHandler implements ICommandHandler<MoveStatusCommand> {
  constructor(
    @InjectDataSource()
    private dataSource: CustomDataSource,
    private readonly requestRepo: RequestRepository,
    private readonly statusRepo: StatusRepository,
    private readonly statusEventRepo: StatusEventRepository,
    private readonly contextService: ContextService,
    private readonly statusService: StatusService,
  ) {}

  async execute(command: MoveStatusCommand) {
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

      const status = await this.statusService.buildFromEvents({
        id: dto.id,
        queryRunner,
      });

      const otherItems: { id: number; order: number }[] = [];

      const oldOrder = status.getOrder();

      status.move({ order: dto.order });

      const minOrder = Math.min(dto.order, oldOrder);

      let offset = 0;
      (await statusRepo.getIdsMoreThanOrEqualOrder(minOrder))
        .filter(id => id != dto.id)
        .forEach((id, index) => {
          if (dto.order == minOrder + index) {
            offset++;
          }
          otherItems.push({ id, order: minOrder + index + offset });
        });

      const otherStatusMap = await this.statusService.buildFromEvents({
        queryRunner,
        id: otherItems.map(item => item.id),
      });
      otherItems.forEach(({ id, order }) => {
        const status = otherStatusMap.get(id);
        if (!status) throw new Error('status was not found');
        status.move({ order });
      });

      await this.statusService.saveAggregates({
        aggregates: [status, ...otherStatusMap.values()],
        requestId,
        queryRunner,
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

  // async moveStatus(dto: MoveStatusDto): Promise<StatusEntity> {
  //   const { id, order: newOrder } = dto;
  //   const status = await this.findOneByOrFail({
  //     id,
  //   });
  //   const oldOrder = status.order;
  //
  //   if (newOrder === status.order)
  //     throw new BadRequestException('order не поменялся');
  //
  //   if (newOrder < oldOrder) {
  //     await this.manager
  //       .createQueryBuilder()
  //       .update(StatusEntity)
  //       .set({ order: () => '"order" + 1' })
  //       .where('"order" >= :newOrder AND "order" <= :oldOrder AND id != :id', {
  //         newOrder,
  //         oldOrder,
  //         id,
  //       })
  //       .execute();
  //   } else {
  //     await this.manager
  //       .createQueryBuilder()
  //       .update(StatusEntity)
  //       .set({ order: () => '"order" - 1' })
  //       .where('"order" >= :oldOrder AND "order" <= :newOrder AND id != :id', {
  //         oldOrder,
  //         newOrder,
  //         id,
  //       })
  //       .execute();
  //   }
  //
  //   status.order = newOrder;
  //   return this.save(status);
  // }
}
