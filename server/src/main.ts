import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { urlencoded } from 'express';
import fs from 'fs';
import process from 'process';

import { getPathRelativeToRoot } from '@/common/helpers/paths.js';

import { AppModule } from './app.module.js';
import { registerHbsPartials } from './common/helpers/hbs.helper.js';
import { AppConfigService } from './config/app/config.service.js';

async function bootstrap() {
  const ssl = process.env.SSL === 'true';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: ssl
      ? {
          key: fs.readFileSync('/etc/ssl/certs/tls.key'),
          cert: fs.readFileSync('/etc/ssl/certs/tls.crt'),
        }
      : undefined,
  });

  const configService = app.get(ConfigService);

  app.setBaseViewsDir(getPathRelativeToRoot('server/views'));
  app.setViewEngine('hbs');
  await registerHbsPartials(configService);

  app.use(urlencoded({ extended: true }));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(compression());

  app.use(cookieParser());
  // app.enableCors({ origin: ['http://localhost:63342/'], credentials: true });
  app.enableCors({ credentials: true, origin: true });

  app.useGlobalPipes(new ValidationPipe());

  const microserviceGRPC = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:3001',
      package: 'erp',
      protoPath: getPathRelativeToRoot('metricsplace_common/proto/erp.proto'),
      channelOptions: {},
    },
  });

  await app.startAllMicroservices();

  const appConfig: AppConfigService = app.get(AppConfigService);
  await app.listen(appConfig.port);
}

void bootstrap();
