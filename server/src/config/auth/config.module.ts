import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { AppConfigModule } from '@/config/app/config.module.js';

import { AuthConfigService } from './config.service.js';
import configuration from './configuration.js';

/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        JWT_ACCESS_EXP: Joi.string().required(),
        JWT_REFRESH_EXP: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_GOOGLE_CLIENT_ID: Joi.string().required(),
        JWT_GOOGLE_CLIENT_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class AuthConfigModule {}
