import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard.js';
import { RolesGuard } from '@/auth/guard/roles.guard.js';
import { JwtStrategy } from '@/auth/strategy/jwt.strategy.js';
import { AuthConfigModule } from '@/config/auth/config.module.js';
import { AuthConfigService } from '@/config/auth/config.service.js';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    AuthConfigModule,
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      useClass: AuthConfigService,
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [],
})
export class AuthModule {}