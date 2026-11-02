import { Module } from '@nestjs/common';

import controllers from './controllers';
import guards from './guards';
import imports from './imports';
import services from './services';
import { JwtStrategy } from './strategies';

@Module({
  imports,
  controllers,
  providers: [...services, ...guards, JwtStrategy],
})
export class AuthModule {}
