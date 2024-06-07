import { TransactionNotStartedError } from 'typeorm';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner.js';

import type { ReplicationMode } from 'typeorm/driver/types/ReplicationMode.js';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver.js';

export class CustomPostgresQueryRunner extends PostgresQueryRunner {
  constructor(driver: PostgresDriver, mode: ReplicationMode) {
    super(driver, mode);
  }
  async prepareTransaction(trId: string): Promise<void> {
    if (!this.isTransactionActive) throw new TransactionNotStartedError();

    await this.broadcaster.broadcast('BeforeTransactionCommit');

    if (this.transactionDepth > 1) {
      this.transactionDepth -= 1;
      await this.query(`RELEASE SAVEPOINT typeorm_${this.transactionDepth}`);
    } else {
      this.transactionDepth -= 1;
      const a = await this.query(`PREPARE TRANSACTION '${trId}'`);
      this.isTransactionActive = false;
    }

    await this.broadcaster.broadcast('AfterTransactionCommit');
  }
  async commitPrepared(trId: string): Promise<void> {
    await this.query(`COMMIT PREPARED '${trId}'`);
  }
  async rollbackPrepared(trId: string): Promise<void> {
    await this.query(`ROLLBACK PREPARED '${trId}'`);
  }
}
