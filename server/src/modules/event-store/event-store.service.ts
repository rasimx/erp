import { EventStoreDBClient } from '@eventstore/db-client';

export class EventStoreService extends EventStoreDBClient {
  // private readonly eventStore: EventStoreDBClient;

  constructor() {
    const connectionString =
      'esdb://127.0.0.1:2113?tls=false&keepAliveTimeout=10000&keepAliveInterval=10000';
    // const client = EventStoreDBClient.connectionString`${connectionString}`;
    // this.eventStore = new EventStoreDBClient({ endpoint: 'localhost:2113' });
    // this = client;
    super(
      {
        endpoint: 'localhost:2113',
      },
      { insecure: true },
    );
  }
}
