import { DataSource } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver.js';
import type { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions.js';

import { CustomPostgresQueryRunner } from './custom.query-runner.js';

export class CustomDataSource extends DataSource {
  constructor(options: DataSourceOptions) {
    super(options);
  }
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
