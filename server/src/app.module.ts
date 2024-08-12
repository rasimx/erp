import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { type Provider } from '@nestjs/common/interfaces/modules/provider.interface.js';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ExcludeAssetsMiddleware } from '@/assets.middleware.js';
import { AuthModule } from '@/auth/auth.module.js';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard.js';
import { getPathRelativeToRoot } from '@/common/helpers/paths.js';
import { getEnv } from '@/common/helpers/utils.js';
import { AppConfigModule } from '@/config/app/config.module.js';
import { AuthConfigModule } from '@/config/auth/config.module.js';
import { ContextModule } from '@/context/context.module.js';
import { DatabaseModule } from '@/database/database.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { OperationModule } from '@/operation/operation.module.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { ProductBatchGroupModule } from '@/product-batch-group/product-batch-group.module.js';
import { ProductBatchOperationModule } from '@/product-batch-operation/product-batch-operation.module.js';
import { StatusModule } from '@/status/status.module.js';
import { TransactionModule } from '@/transaction/transaction.module.js';

import { AppService } from './app.service.js';

const providers: Provider[] = [AppService];
if (getEnv('APP_ENV') != 'development') {
  providers.push({
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  });
}

@Module({
  imports: [
    AppConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    DatabaseModule,
    ProductModule,
    StatusModule,
    ProductBatchModule,
    ProductBatchGroupModule,
    OperationModule,
    ProductBatchOperationModule,
    Microservices,
    TransactionModule,
    ServeStaticModule.forRoot({
      rootPath: getPathRelativeToRoot('client/dist'),
      serveStaticOptions: {
        index: false,
      },
    }),
    AuthModule,
    AuthConfigModule,
    ContextModule,
  ],
  controllers: [],
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .apply(ExcludeAssetsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
