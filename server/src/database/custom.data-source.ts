import { DataSource } from 'typeorm';
import type { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver.js';

import { CustomPostgresQueryRunner } from './custom.query-runner.js';

export class CustomDataSource extends DataSource {
  createQueryRunner(): CustomPostgresQueryRunner {
    const queryRunner = new CustomPostgresQueryRunner(
      this.driver as PostgresDriver,
      'master',
    );
    const manager = this.createEntityManager(queryRunner);
    Object.assign(queryRunner, { manager: manager });

    return queryRunner;
  }
}
