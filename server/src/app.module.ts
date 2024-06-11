import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ClsModule } from 'nestjs-cls';

import { ExcludeAssetsMiddleware } from '@/assets.middleware.js';
import { AuthModule } from '@/auth/auth.module.js';
import { getPathRelativeToRoot } from '@/common/helpers/paths.js';
import { AppConfigModule } from '@/config/app/config.module.js';
import { AuthConfigModule } from '@/config/auth/config.module.js';
import { GraphqlConfigModule } from '@/config/graphql/config.module.js';
import { DatabaseModule } from '@/database/database.module.js';
import { Microservices } from '@/microservices/microservices.js';
import { OperationModule } from '@/operation/operation.module.js';
import { ProductModule } from '@/product/product.module.js';
import { ProductBatchModule } from '@/product-batch/product-batch.module.js';
import { ProductBatchOperationModule } from '@/product-batch-operation/product-batch-operation.module.js';
import { StatusModule } from '@/status/status.module.js';
import { TransactionModule } from '@/transaction/transaction.module.js';

import { AppService } from './app.service.js';

@Module({
  imports: [
    AppConfigModule,
    GraphqlConfigModule,
    DatabaseModule,
    ProductModule,
    StatusModule,
    ProductBatchModule,
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
    ClsModule.forRoot({
      global: true,
      guard: { mount: true },
      interceptor: { mount: true },
      middleware: { mount: true },
    }),
  ],
  controllers: [],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .apply(ExcludeAssetsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
