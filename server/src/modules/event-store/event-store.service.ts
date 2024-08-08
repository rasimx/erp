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

import { getEnv, type JSONCompatible } from '@/common/helpers/utils.js';
import type { ContextService } from '@/context/context.service.js';
import type { CreateProductBatchDto } from '@/product-batch/dtos/create-product-batch.dto.js';
import type { CreateProductBatchEvent } from '@/product-batch/product-batch.eventstore.js';

export type UserEvent = JSONEventType<
  'CreateProductBatch',
  JSONCompatible<CreateProductBatchDto>
>;

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
}
