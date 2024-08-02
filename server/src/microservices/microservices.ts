import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Joi from 'joi';

import { getPathRelativeToRoot } from '@/common/helpers/paths.js';
import { ContextService } from '@/context/context.service.js';
import { OzonPostingProductMicroservice } from '@/microservices/erp_ozon/ozon-posting-product-microservice.service.js';
import { getContextInterceptor } from '@/microservices/interceptors.js';
import { ERP_OZON_PACKAGE_NAME } from '@/microservices/proto/erp_ozon.pb.js';

const MICROSERVICES = [
  {
    packageName: ERP_OZON_PACKAGE_NAME,
    proto: 'erp_ozon.proto',
    env: 'GRPC_ERP_OZON_URL',
  },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        ...MICROSERVICES.reduce(
          (a, v) => ({ ...a, [v.env]: Joi.string().required() }),
          {},
        ),
      }),
    }),
    ClientsModule.registerAsync(
      MICROSERVICES.map(item => ({
        name: item.packageName,
        inject: [ConfigService, ContextService],
        useFactory: (
          configService: ConfigService,
          contextService: ContextService,
        ) => {
          return {
            transport: Transport.GRPC,
            options: {
              url: configService.get(item.env),
              package: item.packageName,
              protoPath: getPathRelativeToRoot(
                `metricsplace_common/proto/${item.proto}`,
              ),
              channelOptions: {
                interceptors: [getContextInterceptor(contextService)],
              },
            },
          };
        },
      })),
    ),
  ],
  providers: [OzonPostingProductMicroservice],
  exports: [OzonPostingProductMicroservice],
})
export class Microservices {}
