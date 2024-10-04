import { Module } from '@nestjs/common';

import { EventStoreService } from '@/event-store/event-store.service.js';

@Module({
  imports: [],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventStoreModule {}
