import { UseGuards } from '@nestjs/common';
import { ExtendedController } from '@yuriyempty/nestjs-extended-controller';

import { VersionControllers } from 'modules/app/controllers';
import { JwtAuthGuard } from 'modules/auth/guards';

@UseGuards(JwtAuthGuard)
@ExtendedController({
  parent: VersionControllers.v1,
  path: 'auth',
})
export class AuthController {}
