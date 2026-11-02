import { Body, Post } from '@nestjs/common';
import { ExtendedController } from '@yuriyempty/nestjs-extended-controller';

import { type Response } from 'common/models';
import { zodValidationPipe } from 'common/pipes';
import { VersionControllers } from 'modules/app/controllers';

import { AuthLoginSchema, type AuthLogin } from '../../dtos';
import { AuthService } from '../../services';

@ExtendedController({
  parent: VersionControllers.public,
  path: 'auth',
})
export class PublicAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body(zodValidationPipe(AuthLoginSchema)) payload: AuthLogin,
  ): Promise<Response> {
    return {
      data: await this.authService.authUserLogin(payload),
    };
  }
}
