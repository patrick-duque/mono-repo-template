import { describe, expect, it, jest } from '@jest/globals';

import { UnprocessableEntryException } from 'common/exceptions';
import { SupabaseService } from 'modules/common';
import { UserService } from 'modules/user';
import { validatePassword } from 'utils/password';

import { AuthProfileChangePasswordSchema } from '../dtos';
import { InvalidCredentialsException } from '../exceptions';
import AuthService from './auth.service';

jest.mock('utils/password', () => ({
  validatePassword: jest.fn(),
}));

const activeUser = {
  id: '613c32db-e808-4f0f-9c79-6ea9eae95001',
  email_address: 'admin@tristanahumada.com',
  first_name: 'Super',
  last_name: 'Admin',
  role_id: 'f80c589a-fca4-4489-afdd-4c16664a3001',
  password: 'hashed-password',
  status: 'ACTIVE',
};

type QueryResult<TData> = {
  data?: TData | null;
  error: { message: string } | null;
};

type MockQueryBuilder = {
  eq: jest.MockedFunction<(field: string, value: unknown) => MockQueryBuilder>;
  insert: jest.MockedFunction<(payload: unknown) => Promise<QueryResult<null>>>;
  is: jest.MockedFunction<
    (
      field: string,
      value: null,
    ) => MockQueryBuilder | Promise<QueryResult<null>>
  >;
  maybeSingle: jest.MockedFunction<() => Promise<QueryResult<unknown>>>;
  select: jest.MockedFunction<(fields: string) => MockQueryBuilder>;
  update: jest.MockedFunction<(payload: unknown) => MockQueryBuilder>;
};

const createQueryBuilder = (
  result: QueryResult<unknown> = { data: null, error: null },
): MockQueryBuilder => {
  const builder = {} as MockQueryBuilder;

  builder.eq = jest.fn(() => builder);
  builder.insert = jest.fn(async () => ({ data: null, error: null }));
  builder.is = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(async () => result);
  builder.select = jest.fn(() => builder);
  builder.update = jest.fn(() => builder);

  return builder;
};

const createUpdateBuilder = (): MockQueryBuilder => {
  const builder = createQueryBuilder();

  builder.is = jest.fn(async () => ({ data: null, error: null }));

  return builder;
};

const createService = (builders: MockQueryBuilder[] = []) => {
  const jwtService = {
    decode: jest.fn((payload: string) => payload),
    sign: jest.fn(() => 'access-token'),
  };
  const userService = {
    findById: jest.fn(async (_id: string) => activeUser),
    findUserById: jest.fn(async (_id: string) => activeUser),
    findUser: jest.fn(async (_emailAddress: string) => activeUser),
    update: jest.fn(async (_id: string, _payload: unknown) => activeUser),
  };
  const client = {
    from: jest.fn((table: string) => {
      void table;

      return builders.shift();
    }),
  };
  const supabaseService = {
    getClient: jest.fn(() => client),
  };

  return {
    client,
    jwtService,
    service: new AuthService(
      jwtService as never,
      userService as unknown as UserService,
      supabaseService as unknown as SupabaseService,
    ),
    userService,
  };
};

describe('AuthService.authUserLogin', () => {
  it('returns only an access token when remember_me is false', async () => {
    jest.mocked(validatePassword).mockResolvedValue(true);
    const { client, service } = createService();

    await expect(
      service.authUserLogin({
        email_address: activeUser.email_address,
        password: 'password',
        remember_me: false,
      }),
    ).resolves.toEqual({
      access_token: 'access-token',
      user: activeUser,
    });
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns a refresh token when remember_me is true', async () => {
    jest.mocked(validatePassword).mockResolvedValue(true);
    const insertBuilder = createQueryBuilder();
    const { client, service } = createService([insertBuilder]);

    const result = await service.authUserLogin({
      email_address: activeUser.email_address,
      password: 'password',
      remember_me: true,
    });

    expect(result.access_token).toBe('access-token');
    expect(result.refresh_token).toEqual(expect.any(String));
    expect(client.from).toHaveBeenCalledWith('user_tokens');
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        token_type: 'REFRESH_TOKEN',
        user_id: activeUser.id,
      }),
    );
    expect(insertBuilder.insert.mock.calls[0]?.[0]).not.toEqual(
      expect.objectContaining({ token_hash: result.refresh_token }),
    );
  });

  it('rejects invalid passwords without stamping login time', async () => {
    jest.mocked(validatePassword).mockResolvedValue(false);
    const { service, userService } = createService();

    await expect(
      service.authUserLogin({
        email_address: activeUser.email_address,
        password: 'wrong-password',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(userService.update).not.toHaveBeenCalled();
  });

  it('rejects pending or inactive users without issuing tokens', async () => {
    jest.mocked(validatePassword).mockResolvedValue(true);
    const { jwtService, service, userService } = createService();
    userService.findUser.mockResolvedValue({
      ...activeUser,
      status: 'PENDING',
    });

    await expect(
      service.authUserLogin({
        email_address: activeUser.email_address,
        password: 'password',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(userService.update).not.toHaveBeenCalled();
  });
});

describe('AuthService.changeProfilePassword', () => {
  it('updates the authenticated user password when the old password is valid', async () => {
    jest.mocked(validatePassword).mockResolvedValue(true);
    const { service, userService } = createService();

    await expect(
      service.changeProfilePassword(activeUser.id, {
        old_password: 'old-password',
        new_password: 'new-password1',
        new_password_confirmation: 'new-password1',
      }),
    ).resolves.toEqual(activeUser);
    expect(userService.findUserById).toHaveBeenCalledWith(activeUser.id);
    expect(userService.update).toHaveBeenCalledWith(activeUser.id, {
      password: 'new-password1',
    });
  });

  it('rejects invalid old passwords as unprocessable without updating the user', async () => {
    jest.mocked(validatePassword).mockResolvedValue(false);
    const { service, userService } = createService();

    await expect(
      service.changeProfilePassword(activeUser.id, {
        old_password: 'wrong-password',
        new_password: 'new-password1',
        new_password_confirmation: 'new-password1',
      }),
    ).rejects.toThrow(UnprocessableEntryException);
    expect(userService.update).not.toHaveBeenCalled();
  });
});

describe('AuthProfileChangePasswordSchema', () => {
  it('rejects matching old and new passwords', () => {
    expect(() =>
      AuthProfileChangePasswordSchema.parse({
        old_password: 'password1',
        new_password: 'password1',
        new_password_confirmation: 'password1',
      }),
    ).toThrow('New password should not be the same as the old password.');
  });

  it('rejects mismatched new password confirmation', () => {
    expect(() =>
      AuthProfileChangePasswordSchema.parse({
        old_password: 'password1',
        new_password: 'password2',
        new_password_confirmation: 'password3',
      }),
    ).toThrow('New password confirmation does not match.');
  });
});

describe('AuthService.refreshAccessToken', () => {
  it('rotates the refresh token and returns a fresh access token', async () => {
    const refreshTokenRow = {
      id: 'token-1',
      user_id: activeUser.id,
      token_type: 'REFRESH_TOKEN',
      token_hash: 'hashed-token',
      expires_at: new Date(Date.now() + 60_000).toISOString(),
      revoked_at: null,
      deleted_at: null,
    };
    const findBuilder = createQueryBuilder({
      data: refreshTokenRow,
      error: null,
    });
    const revokeBuilder = createUpdateBuilder();
    const insertBuilder = createQueryBuilder();
    const { service } = createService([
      findBuilder,
      revokeBuilder,
      insertBuilder,
    ]);

    const result = await service.refreshAccessToken({
      refresh_token: 'refresh-token',
    });

    expect(result.access_token).toBe('access-token');
    expect(result.refresh_token).toEqual(expect.any(String));
    expect(findBuilder.eq).toHaveBeenCalledWith('token_type', 'REFRESH_TOKEN');
    expect(revokeBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ revoked_at: expect.any(String) }),
    );
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        token_type: 'REFRESH_TOKEN',
        user_id: activeUser.id,
      }),
    );
  });

  it('rejects unknown refresh tokens', async () => {
    const { service } = createService([
      createQueryBuilder({ data: null, error: null }),
    ]);

    await expect(
      service.refreshAccessToken({ refresh_token: 'missing-token' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('revokes and rejects expired refresh tokens', async () => {
    const findBuilder = createQueryBuilder({
      data: {
        id: 'token-1',
        user_id: activeUser.id,
        token_type: 'REFRESH_TOKEN',
        token_hash: 'hashed-token',
        expires_at: new Date(Date.now() - 60_000).toISOString(),
        revoked_at: null,
        deleted_at: null,
      },
      error: null,
    });
    const revokeBuilder = createUpdateBuilder();
    const { service } = createService([findBuilder, revokeBuilder]);

    await expect(
      service.refreshAccessToken({ refresh_token: 'expired-token' }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(revokeBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ revoked_at: expect.any(String) }),
    );
  });

  it('revokes and rejects tokens for inactive users', async () => {
    const findBuilder = createQueryBuilder({
      data: {
        id: 'token-1',
        user_id: activeUser.id,
        token_type: 'REFRESH_TOKEN',
        token_hash: 'hashed-token',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        revoked_at: null,
        deleted_at: null,
      },
      error: null,
    });
    const revokeBuilder = createUpdateBuilder();
    const { service, userService } = createService([
      findBuilder,
      revokeBuilder,
    ]);

    userService.findById.mockResolvedValue({
      ...activeUser,
      status: 'INACTIVE',
    });

    await expect(
      service.refreshAccessToken({ refresh_token: 'inactive-token' }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(revokeBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ revoked_at: expect.any(String) }),
    );
  });
});
