import {
  type AppendToStreamOptions,
  EventStoreDBClient,
  jsonEvent,
  type JSONEventType,
} from '@eventstore/db-client';
import type {
  AppendResult,
  EventData,
  EventType,
} from '@eventstore/db-client/dist/types/index.js';
import { v4 as uuidv4 } from 'uuid';

import { getEnv, type JSONCompatible } from '@/common/helpers/utils.js';
import type { ContextService } from '@/context/context.service.js';
import type { CreateProductBatchListDto } from '@/product-batch/dtos/create-product-batch-list.dto.js';

export type UserEvent = JSONEventType<
  'CreateProductBatch',
  JSONCompatible<CreateProductBatchListDto>
>;

const client = new EventStoreDBClient(
  { endpoint: 'localhost:2113' },
  { insecure: true },
);

export class EventStoreService extends EventStoreDBClient {
  // private readonly eventStore: EventStoreDBClient;

  constructor(private readonly contextService: ContextService) {
    const connectionString =
      'esdb://127.0.0.1:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000';
    // const client = EventStoreDBClient.connectionString`${connectionString}`;
    // this.eventStore = new EventStoreDBClient({ endpoint: 'localhost:2113' });
    // this = client;
    super(
      {
        endpoint: getEnv('EVENTSTORE_ENDPOINT'),
      },
      { insecure: true },
    );
  }

  async appendToStream<KnownEventType extends EventType = EventType>(
    streamName: string,
    events: EventData<KnownEventType> | EventData<KnownEventType>[],
    options?: AppendToStreamOptions,
  ): Promise<AppendResult> {
    // const userId = this.contextService.userId;
    //
    // const event = jsonEvent<CreateProductBatchEvent>({
    //   type: 'CreateProductBatch',
    //   data: dto,
    // });
    //
    // const STREAM_NAME = `USER-${userId.toString()}`;
    //
    // await super.appendToStream(STREAM_NAME, event);

    return super.appendToStream(streamName, events, options);
  }

  // Функция для создания компенсирующего события
  async appendTransactionCompensatingEvent(
    streamName: string,
    originalEvent: EventData<JSONEventType>,
  ) {
    const compensatingEvent = jsonEvent({
      type: `${originalEvent.type}Rollback`,
      data: {
        ...(originalEvent.data as Record<string | number, unknown>),
        originalEventId: originalEvent.id,
        reason: 'Compensating for failed transaction',
      },
      id: uuidv4(),
    });

    await this.appendToStream(streamName, compensatingEvent);
  }
}