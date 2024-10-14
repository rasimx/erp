import { registerAs } from '@nestjs/config';
import path from 'path';
import type { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions.js';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATABASE_CONFIG_TOKEN = 'database';

export default registerAs<DataSourceOptions>(DATABASE_CONFIG_TOKEN, () => ({
  type: 'postgres',
  url: process.env.TYPEORM_URL,
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  entities: [
    path.join(__dirname, '../**/*.{entity,read-entity,event-entity}{.ts,.js}'),
  ],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING == 'true',
  ssl: false,
  migrationsTransactionMode: 'each',
  migrationsTableName: 'migration',
  poolSize: 30,
  subscribers: [],
}));
