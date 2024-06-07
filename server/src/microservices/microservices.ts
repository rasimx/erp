import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Joi from 'joi';

import { ERP_PACKAGE_NAME } from '@/microservices/proto/erp.pb.js';

const MICROSERVICES = [
  {
    packageName: ERP_OZON_PACKAGE_NAME,
    proto: 'erp_ozon.proto',
    env: 'GRPC_ERP_OZON_URL',
  },
];

import path from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';

import { getPathRelativeToRoot } from '@/common/helpers/paths.js';
import { OzonStateMicroservice } from '@/microservices/erp_ozon/ozon-state-microservice.service.js';
import { ERP_OZON_PACKAGE_NAME } from '@/microservices/proto/erp_ozon.pb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        inject: [ConfigService],
        useFactory: configService => {
          return {
            transport: Transport.GRPC,
            options: {
              url: configService.get(item.env),
              package: item.packageName,
              protoPath: getPathRelativeToRoot(
                `metricsplace_common/proto/${item.proto}`,
              ),
            },
          };
        },
      })),
    ),
  ],
  providers: [OzonStateMicroservice],
  exports: [OzonStateMicroservice],
})
export class Microservices {}
