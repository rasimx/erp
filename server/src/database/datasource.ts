import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { getPathRelativeToRoot } from '@/common/helpers/paths.js';

// @ts-expect-error тут приходится указывать расширение в .ts
import ormConfig from './configuration.ts';

dotenv.config({
  path: getPathRelativeToRoot('.env'),
});
export default new DataSource(await ormConfig());
