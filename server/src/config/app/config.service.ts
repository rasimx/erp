import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { JsonConfig } from '@/config/app/json-configuration.js';

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class AppConfigService {
  constructor(
    private configService: ConfigService<Record<string, any>, true>,
  ) {}

  get name(): string {
    return this.configService.get('app.name');
  }
  get env(): string {
    return this.configService.get('app.env');
  }
  get url(): string {
    return this.configService.get('app.url');
  }
  get port(): number {
    return Number(this.configService.get('app.port'));
  }
  get jsonConfig(): JsonConfig {
    return this.configService.get('json');
  }
  get isDev(): boolean {
    return ['development', 'dev'].includes(this.configService.get('app.env'));
  }
}
