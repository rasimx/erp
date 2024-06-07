import * as fs from 'fs';
import * as process from 'process';
import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('json', () =>
  JSON.parse(fs.readFileSync(join(process.cwd(), 'config.json')).toString()),
);

export interface JsonConfig {
  graphql: {
    subgraphs: { name: string; url: string }[];
  };
}
