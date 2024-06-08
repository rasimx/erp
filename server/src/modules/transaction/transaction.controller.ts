import { Controller } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import type { CustomDataSource } from '@/database/custom.data-source.js';
import {
  type PreparedTransaction,
  type TransactionResponse,
  type TransactionServiceController,
  TransactionServiceControllerMethods,
} from '@/microservices/proto/erp.pb.js';

@Controller()
@TransactionServiceControllerMethods()
export class TransactionController implements TransactionServiceController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: CustomDataSource,
  ) {}

  async commitPreparedTransaction({
    transactionId,
  }: PreparedTransaction): Promise<TransactionResponse> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.commitPrepared(transactionId);
      console.log('commitPrepared', transactionId);
      return { success: true };
    } catch (error: unknown) {
      console.log('error commitPrepared', transactionId);
      return { success: false, error: (error as Error).message };
    }
  }

  async rollbackPreparedTransaction({
    transactionId,
  }: PreparedTransaction): Promise<TransactionResponse> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.rollbackPrepared(transactionId);
      console.log('rollbackPrepared', transactionId);
      return { success: true };
    } catch (error) {
      console.log('error rollbackPrepared', transactionId);
      return { success: false, error: error };
    }
  }
}
