import type { Metadata } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as express from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload, User } from '@/auth/interfaces.js';
import { AuthConfigService } from '@/config/auth/config.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authConfigService: AuthConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfigService.secret,
    });
  }

  validate(payload: JwtPayload): User {
    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
