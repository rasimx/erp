import type { Metadata } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as express from 'express';
import { ClsService } from 'nestjs-cls';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { USER_ID } from '@/auth/auth.constants.js';
import type { JwtPayload, User } from '@/auth/interfaces.js';
import { AuthConfigService } from '@/config/auth/config.service.js';

@Injectable()
export class JwtGrpcStrategy extends PassportStrategy(Strategy, 'jwt-grpc') {
  constructor(
    private readonly authConfigService: AuthConfigService,
    private readonly cls: ClsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // @ts-ignore
        (metadata: Metadata) => {
          return metadata.get('accessToken')[0];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfigService.secret,
    });
  }

  validate(payload: { userId }) {
    return payload;
  }
}
