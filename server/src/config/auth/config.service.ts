import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  JwtModuleOptions,
  JwtOptionsFactory,
} from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface.js';

@Injectable()
export class AuthConfigService implements JwtOptionsFactory {
  constructor(private configService: ConfigService) {}

  createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions {
    return this.configService.get<string>('auth') as JwtModuleOptions;
  }

  get httpBasicUsername(): string {
    return this.configService.get<string>('auth.httpBasicUsername') as string;
  }
  get httpBasicPassword(): string {
    return this.configService.get('auth.httpBasicPassword') as string;
  }
  get secret(): string {
    return this.configService.get('auth.secret') as string;
  }
  get googleClientId(): string {
    return this.configService.get('auth.googleClientId') as string;
  }
  get googleClientSecret(): string {
    return this.configService.get('auth.googleClientSecret') as string;
  }
  get jwtAccessExp(): string {
    return this.configService.get('auth.jwtAccessExp') as string;
  }
  get jwtRefreshExp(): string {
    return this.configService.get('auth.jwtRefreshExp') as string;
  }
}
