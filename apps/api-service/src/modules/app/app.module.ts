import { Global, Module } from '@nestjs/common';

import controllers from './controllers';
import imports from './imports';

@Global()
@Module({
  imports,
  controllers,
})
class AppModule {}

export default AppModule;
