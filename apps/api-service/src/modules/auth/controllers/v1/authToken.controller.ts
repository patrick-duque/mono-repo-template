import { Body, Post } from '@nestjs/common';
import { ExtendedController } from '@yuriyempty/nestjs-extended-controller';

import { type Response } from 'common/models';
import { zodValidationPipe } from 'common/pipes';
import { VersionControllers } from 'modules/app/controllers';

import { AuthRefreshTokenSchema, type AuthRefreshToken } from '../../dtos';
import { AuthService } from '../../services';

@ExtendedController({
  parent: VersionControllers.v1,
  path: 'auth',
})
export class AuthTokenController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  async refreshToken(
    @Body(zodValidationPipe(AuthRefreshTokenSchema)) payload: AuthRefreshToken,
  ): Promise<Response> {
    return {
      data: await this.authService.refreshAccessToken(payload),
    };
  }
}
