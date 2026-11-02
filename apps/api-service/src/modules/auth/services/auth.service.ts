import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatusSchema } from '@white-label/shared';

import {
  HttpErrorException,
  UnprocessableEntryException,
} from 'common/exceptions';
import { SupabaseService, type CrudRow } from 'modules/common';
import { UserService } from 'modules/user';
import { validatePassword } from 'utils/password';

import {
  type AuthLogin,
  type AuthProfileChangePassword,
  type AuthRefreshToken,
  type JwtPayload,
} from '../dtos';
import { InvalidCredentialsException } from '../exceptions';

const USER_TOKEN_TABLE = 'user_tokens';
const REFRESH_TOKEN_TYPE = 'REFRESH_TOKEN';
const REFRESH_TOKEN_BYTES = 64;
const REFRESH_TOKEN_TTL_DAYS = 30;

export type AuthUserLoginResult = {
  access_token: string;
  refresh_token?: string;
  user: CrudRow;
};

type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_type: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  deleted_at: string | null;
};

@Injectable()
export default class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async authUserLogin(payload: AuthLogin): Promise<AuthUserLoginResult> {
    const user = await this.userService.findUser(payload.email_address);

    if (
      !user ||
      typeof user.password !== 'string' ||
      !(await validatePassword(payload.password, user.password)) ||
      user.status !== UserStatusSchema.enum.ACTIVE
    ) {
      throw new InvalidCredentialsException();
    }

    const updatedUser = await this.userService.update(user.id, {
      last_login_at: new Date().toISOString(),
    });

    const result: AuthUserLoginResult = {
      access_token: await this.createClaims({
        user_id: String(updatedUser.id),
        email_address: String(updatedUser.email_address),
        role_id: String(updatedUser.role_id),
      }),
      user: updatedUser,
    };

    if (payload.remember_me) {
      result.refresh_token = await this.createRefreshToken(
        String(updatedUser.id),
      );
    }

    return result;
  }

  async refreshAccessToken(
    payload: AuthRefreshToken,
  ): Promise<AuthUserLoginResult> {
    const existingRefreshToken = await this.findRefreshToken(
      payload.refresh_token,
    );

    if (
      !existingRefreshToken ||
      new Date(existingRefreshToken.expires_at).getTime() <= Date.now()
    ) {
      if (existingRefreshToken) {
        await this.revokeRefreshToken(existingRefreshToken.id);
      }

      throw new InvalidCredentialsException();
    }

    let user: CrudRow;

    try {
      user = await this.userService.findById(existingRefreshToken.user_id);
    } catch {
      await this.revokeRefreshToken(existingRefreshToken.id);

      throw new InvalidCredentialsException();
    }

    if (user.status !== UserStatusSchema.enum.ACTIVE) {
      await this.revokeRefreshToken(existingRefreshToken.id);

      throw new InvalidCredentialsException();
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.createClaims({
        user_id: String(user.id),
        email_address: String(user.email_address),
        role_id: String(user.role_id),
      }),
      this.rotateRefreshToken(existingRefreshToken),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  async changeProfilePassword(
    userId: string,
    payload: AuthProfileChangePassword,
  ): Promise<CrudRow> {
    const user = await this.userService.findUserById(userId);

    if (
      typeof user.password !== 'string' ||
      !(await validatePassword(payload.old_password, user.password))
    ) {
      throw new UnprocessableEntryException('Current password is incorrect.');
    }

    return this.userService.update(userId, {
      password: payload.new_password,
    });
  }

  async createClaims(payload: JwtPayload): Promise<string> {
    try {
      return this.jwtService.sign(payload);
    } catch (err) {
      throw new HttpErrorException(
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  async decodeClaims(payload: string): Promise<unknown> {
    try {
      return this.jwtService.decode(payload);
    } catch (err) {
      throw new HttpErrorException(
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    const { error } = await this.supabaseService
      .getClient()
      .from(USER_TOKEN_TABLE)
      .insert({
        user_id: userId,
        token_type: REFRESH_TOKEN_TYPE,
        token_hash: this.hashRefreshToken(refreshToken),
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      throw new HttpErrorException(error.message);
    }

    return refreshToken;
  }

  private async findRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenRow | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(USER_TOKEN_TABLE)
      .select(
        'id,user_id,token_type,token_hash,expires_at,revoked_at,deleted_at',
      )
      .eq('token_hash', this.hashRefreshToken(refreshToken))
      .eq('token_type', REFRESH_TOKEN_TYPE)
      .is('revoked_at', null)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw new HttpErrorException(error.message);
    }

    return (data as RefreshTokenRow | null) ?? null;
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private async revokeRefreshToken(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from(USER_TOKEN_TABLE)
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw new HttpErrorException(error.message);
    }
  }

  private async rotateRefreshToken(
    refreshToken: RefreshTokenRow,
  ): Promise<string> {
    await this.revokeRefreshToken(refreshToken.id);

    return this.createRefreshToken(refreshToken.user_id);
  }
}
