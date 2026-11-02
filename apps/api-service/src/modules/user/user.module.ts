import { Module } from '@nestjs/common';

import controllers from './controllers';
import moduleExports from './exports';
import imports from './imports';
import services from './services';

@Module({
  imports,
  controllers,
  providers: [...services],
  exports: [...moduleExports],
})
export class UserModule {}
