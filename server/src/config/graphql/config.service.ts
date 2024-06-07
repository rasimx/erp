import type { ApolloFederationDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import type { GqlOptionsFactory } from '@nestjs/graphql';
import { join } from 'path';

import { getPathRelativeToRoot } from '@/common/helpers/paths.js';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): ApolloFederationDriverConfig {
    return {
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // autoSchemaFile: {
      //   path: join(process.cwd(), 'src/schema.gql'),
      //   federation: 2,
      // },
      introspection: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
      typePaths: [getPathRelativeToRoot('metricsplace_common/graphql/erp.gql')],
      definitions: {
        path: join(process.cwd(), 'src/graphql.schema.ts'),
        // outputAs: 'class',
      },
    };
  }
}
