import { Injectable } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';
import { TransactionNotStartedError } from 'typeorm';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner.js';
import type { IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js';
import { v7 as uuidV7 } from 'uuid';

import { USER_ID } from '@/context/context.constants.js';

@Injectable()
export class CustomPostgresQueryRunner extends PostgresQueryRunner {
  isTransactionCommand = false;

  async query(
    queryString: string,
    params?: any[],
    useStructuredResult?: boolean,
  ): Promise<any> {
    let userId: string | undefined;
    if (!this.isTransactionCommand) {
      const cls = ClsServiceManager.getClsService();
      const userId = cls.get<string | undefined>(USER_ID);

      const vars: string[] = [];
      if (userId) vars.push(`set "rls.user_id" = '${userId}';`);
      if (vars.length) await super.query(vars.join(''));
    }

    let error: Error | undefined;
    try {
      return super.query(queryString, params, useStructuredResult);
    } catch (e) {
      error = e;
      throw e;
    } finally {
      if (!this.isTransactionCommand && !(this.isTransactionActive && error)) {
        const vars2: string[] = [];
        if (userId) vars2.push(`reset rls.user_id;`);
        if (vars2.length) await super.query(vars2.join(''));
      }
    }
  }

  async prepareTransaction(transactionId?: string): Promise<string> {
    this.isTransactionCommand = true;
    if (!this.isTransactionActive) throw new TransactionNotStartedError();

    await this.broadcaster.broadcast('BeforeTransactionCommit');

    transactionId = transactionId ?? uuidV7();
    if (!transactionId) throw new Error('transactionId was not specified');
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
    this.isTransactionCommand = false;
    return transactionId;
  }

  async commitPrepared(trId: string): Promise<void> {
    this.isTransactionCommand = true;
    await this.query(`COMMIT PREPARED '${trId}'`);
    this.isTransactionCommand = false;
  }
  async rollbackPrepared(trId: string): Promise<void> {
    this.isTransactionCommand = true;
    await this.query(`ROLLBACK PREPARED '${trId}'`);
    this.isTransactionCommand = false;
  }

  async startTransaction(isolationLevel?: IsolationLevel): Promise<void> {
    this.isTransactionCommand = true;
    await super.startTransaction(isolationLevel);
    this.isTransactionCommand = false;
  }

  async commitTransaction(): Promise<void> {
    this.isTransactionCommand = true;
    await super.commitTransaction();
    this.isTransactionCommand = false;
  }

  async rollbackTransaction(): Promise<void> {
    this.isTransactionCommand = true;
    await super.rollbackTransaction();
    this.isTransactionCommand = false;
  }

  // async release() {
  //   console.log('release');
  //   return super.release();
  // }
}
