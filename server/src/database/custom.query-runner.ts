import { TransactionNotStartedError } from 'typeorm';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner.js';
import { v4 as uuidv4 } from 'uuid';

export class CustomPostgresQueryRunner extends PostgresQueryRunner {
  async prepareTransaction(transactionId?: string): Promise<string> {
    if (!this.isTransactionActive) throw new TransactionNotStartedError();

    await this.broadcaster.broadcast('BeforeTransactionCommit');

    transactionId = transactionId ?? uuidv4();
    if (this.transactionDepth > 1) {
      this.transactionDepth -= 1;
      await this.query(
        `RELEASE SAVEPOINT typeorm_${this.transactionDepth.toString()}`,
      );
    } else {
      this.transactionDepth -= 1;
      await this.query(`PREPARE TRANSACTION '${transactionId.toString()}'`);
      this.isTransactionActive = false;
    }

    await this.broadcaster.broadcast('AfterTransactionCommit');
    return transactionId;
  }
  async commitPrepared(trId: string): Promise<void> {
    await this.query(`COMMIT PREPARED '${trId}'`);
  }
  async rollbackPrepared(trId: string): Promise<void> {
    await this.query(`ROLLBACK PREPARED '${trId}'`);
  }
}
