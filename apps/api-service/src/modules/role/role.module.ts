import { Module } from '@nestjs/common';

import controllers from './controllers';
import moduleExports from './exports';
import guards from './guards';
import imports from './imports';
import services from './services';

@Module({
  imports,
  controllers,
  providers: [...services, ...guards],
  exports: [...moduleExports],
})
export class RoleModule {}
