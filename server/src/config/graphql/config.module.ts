import {
  type ApolloDriverConfig,
  ApolloFederationDriver,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { GqlConfigService } from './config.service.js';

/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloFederationDriver,
      useClass: GqlConfigService,
    }),
  ],
  providers: [GqlConfigService],
  exports: [GqlConfigService],
})
export class GraphqlConfigModule {}
