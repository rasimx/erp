import { Module } from '@nestjs/common';

import { TransactionController } from '@/transaction/transaction.controller.js';

@Module({
  controllers: [TransactionController],
})
export class TransactionModule {}
