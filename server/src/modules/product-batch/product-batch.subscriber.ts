import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  IsNull,
} from 'typeorm';

import { ProductBatchEntity } from '@/product-batch/domain/product-batch.entity.js';
import { ProductBatchGroupEntity } from '@/product-batch-group/domain/product-batch-group.entity.js';

@EventSubscriber()
export class ProductBatchEntitySubscriber
  implements EntitySubscriberInterface<ProductBatchEntity>
{
  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo() {
    return ProductBatchEntity;
  }

  /**
   * Called before post insertion.
   */
  async beforeInsert(event: InsertEvent<ProductBatchEntity>) {
    let order = 1;
    if (event.entity.groupId) {
      const lastBatch = await event.queryRunner.manager.findOne(
        ProductBatchEntity,
        {
          where: { groupId: event.entity.groupId },
          order: { order: 'DESC' },
        },
      );

      order = lastBatch ? lastBatch.order + 1 : 1;
    } else if (event.entity.statusId) {
      const lastItems: (ProductBatchEntity | ProductBatchGroupEntity)[] = [];
      const lastUngroupedBatch = await event.queryRunner.manager.findOne(
        ProductBatchEntity,
        {
          where: { statusId: event.entity.statusId, groupId: IsNull() },
          order: { order: 'DESC' },
        },
      );
      if (lastUngroupedBatch) lastItems.push(lastUngroupedBatch);

      const lastGroup = await event.queryRunner.manager.findOne(
        ProductBatchGroupEntity,
        {
          where: { statusId: event.entity.statusId },
          order: { order: 'DESC' },
        },
      );
      if (lastGroup) lastItems.push(lastGroup);

      order = lastItems.length
        ? Math.max(...lastItems.map(({ order }) => order)) + 1
        : 1;
    }
    event.entity.order = order;
  }
}
