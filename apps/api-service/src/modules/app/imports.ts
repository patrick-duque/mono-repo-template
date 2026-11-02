import { join } from 'node:path';

import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from 'modules/auth';
import { CommonModule } from 'modules/common';
import { RoleModule } from 'modules/role';
import { UserModule } from 'modules/user';

export default [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [
      join(process.cwd(), '.env'),
      join(process.cwd(), 'apps/api-service/.env'),
    ],
  }),
  ThrottlerModule.forRoot([
    {
      ttl: 6000,
      limit: 10,
    },
  ]),
  CommonModule,
  AuthModule,
  RoleModule,
  UserModule,
];
