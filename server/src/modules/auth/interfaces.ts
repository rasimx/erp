export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export class JwtPayload {
  sub: number;
  username: string;
  roles: UserRole[];
}

export class User {
  id: number;
  username: string;
  roles: UserRole[];
}
