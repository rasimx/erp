import { registerAs } from '@nestjs/config';
import * as fs from 'fs';

import { getPathRelativeToRoot } from '@/common/helpers/paths.js';

export default registerAs('json', () =>
  JSON.parse(fs.readFileSync(getPathRelativeToRoot('config.json')).toString()),
);

export interface JsonConfig {
  graphql: {
    subgraphs: { name: string; url: string }[];
  };
}
