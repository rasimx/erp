import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { urlencoded } from 'express';
import fs from 'fs';
import { dirname, join, resolve } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

import { getPathRelativeToRoot } from '@/common/helpers/paths.js';

import { AppModule } from './app.module.js';
import { registerHbsPartials } from './common/helpers/hbs.helper.js';
import { AppConfigService } from './config/app/config.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, join(__dirname, '..'));

async function bootstrap() {
  const ssl = process.env.SSL === 'true';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: ssl
      ? {
          key: fs.readFileSync(
            getPathRelativeToRoot('server/local-certs/local-key.pem'),
          ),
          cert: fs.readFileSync(
            getPathRelativeToRoot('server/local-certs/local-cert.pem'),
          ),
        }
      : undefined,
  });

  const configService = app.get(ConfigService);

  app.useStaticAssets(join(__dirname, 'public'));

  app.setBaseViewsDir(join(ROOT_DIR, 'app/server/views'));
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
      url: '127.0.0.1:3018',
      package: 'erp',
      protoPath: getPathRelativeToRoot('metricsplace_common/proto/erp.proto'),
    },
  });

  await app.startAllMicroservices();

  const appConfig: AppConfigService = app.get(AppConfigService);
  await app.listen(appConfig.port);
}

void bootstrap();
