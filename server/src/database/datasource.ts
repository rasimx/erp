import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// @ts-expect-error тут приходится указывать расширение в .ts
import ormConfig from './configuration.ts';

dotenv.config({
  path: '../../.env',
});
export default new DataSource(await ormConfig());
