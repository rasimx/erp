import { registerAs } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface.js';

export default registerAs<JwtModuleOptions>('auth', () => ({
  httpBasicUsername: process.env.HTTP_BASIC_USERNAME,
  httpBasicPassword: process.env.HTTP_BASIC_PASSWORD,
  secret: process.env.JWT_SECRET,
  googleClientId: process.env.JWT_GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.JWT_GOOGLE_CLIENT_SECRET,
  jwtAccessExp: process.env.JWT_ACCESS_EXP,
  jwtRefreshExp: process.env.JWT_REFRESH_EXP,
}));
