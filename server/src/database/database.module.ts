import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions.js';
import Joi from 'joi';

import { TypeOrmModule } from '@nestjs/typeorm';

import configuration, { DATABASE_CONFIG_TOKEN } from './configuration.js';
import { CustomDataSource } from './custom.data-source.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        TYPEORM_URL: Joi.string().required(),
        TYPEORM_LOGGING: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<
          { [DATABASE_CONFIG_TOKEN]: DataSourceOptions },
          true
        >,
      ): DataSourceOptions =>
        configService.get(DATABASE_CONFIG_TOKEN, { infer: true }),
      dataSourceFactory: async options => {
        if (!options) throw new Error('dataSource options is not defined');
        return new CustomDataSource(options);
      },
    }),
  ],
})
export class DatabaseModule {}
