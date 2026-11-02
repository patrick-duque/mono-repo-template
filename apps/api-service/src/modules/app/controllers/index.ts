import { Controller, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExtendedController } from '@yuriyempty/nestjs-extended-controller';

import AppController from './app.controller';

export { AppController };

@UseGuards(ThrottlerGuard)
@Controller('api')
class _AppController {}

@ExtendedController({
  parent: _AppController,
  path: 'v1',
})
export class Version1Controller {}

@ExtendedController({
  parent: _AppController,
  path: 'v2',
})
export class Version2Controller {}

@ExtendedController({
  parent: _AppController,
  path: 'v3',
})
export class Version3Controller {}

@ExtendedController({
  parent: _AppController,
  path: 'public',
})
export class PublicController {}

export const VersionControllers = {
  public: PublicController,
  v1: Version1Controller,
  v2: Version2Controller,
  v3: Version3Controller,
} as const;

export default [AppController];
