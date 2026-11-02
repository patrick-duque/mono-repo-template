import { describe, expect, it, jest } from '@jest/globals';

import { SupabaseService } from 'modules/common';
import { hashPassword } from 'utils/password';

import UserService from './user.service';

jest.mock('utils/password', () => ({
  hashPassword: jest.fn(async () => 'hashed-password'),
}));

const userRow = {
  id: '613c32db-e808-4f0f-9c79-6ea9eae95001',
  email_address: 'admin@tristanahumada.com',
  first_name: 'Super',
  last_name: 'Admin',
  role_id: 'f80c589a-fca4-4489-afdd-4c16664a3001',
  password: 'hashed-password',
  status: 'PENDING',
};

const createService = () => {
  const supabaseService = {
    create: jest.fn(async (..._args: unknown[]) => {
      void _args;

      return userRow;
    }),
    deleteResource: jest.fn(async (..._args: unknown[]) => {
      void _args;

      return userRow;
    }),
    findBy: jest.fn(async (..._args: unknown[]) => {
      void _args;

      return { data: [userRow], meta: {} };
    }),
    findById: jest.fn(async (..._args: unknown[]) => {
      void _args;

      return userRow;
    }),
    update: jest.fn(async (..._args: unknown[]) => {
      void _args;

      return userRow;
    }),
    validateId: jest.fn((id: string) => id),
    validatePayload: jest.fn((_schema: unknown, payload: unknown) => payload),
  };

  return {
    service: new UserService(supabaseService as unknown as SupabaseService),
    supabaseService,
  };
};

describe('UserService', () => {
  it('selects public fields for list and findById', async () => {
    const { service, supabaseService } = createService();

    await service.list({ search: 'admin' });
    await service.findById(userRow.id);

    expect(supabaseService.findBy).toHaveBeenCalledWith(
      expect.objectContaining({ table: 'users' }),
      { search: 'admin' },
      expect.not.arrayContaining(['password']),
    );
    expect(supabaseService.findById).toHaveBeenCalledWith(
      expect.objectContaining({ table: 'users' }),
      userRow.id,
      expect.not.arrayContaining(['password']),
    );
  });

  it('selects password only through findUser', async () => {
    const { service, supabaseService } = createService();

    await expect(service.findUser(userRow.email_address)).resolves.toEqual(
      userRow,
    );
    await expect(service.findUserById(userRow.id)).resolves.toEqual(userRow);
    expect(supabaseService.findBy).toHaveBeenCalledWith(
      expect.objectContaining({ table: 'users' }),
      expect.objectContaining({
        email_address: userRow.email_address,
        includeCount: false,
        perPage: 1,
      }),
      expect.arrayContaining(['password']),
    );
    expect(supabaseService.findById).toHaveBeenCalledWith(
      expect.objectContaining({ table: 'users' }),
      userRow.id,
      expect.arrayContaining(['password']),
    );
  });

  it('hashes passwords and strips password from returned create/update/delete rows', async () => {
    const { service, supabaseService } = createService();

    await expect(
      service.create({
        email_address: userRow.email_address,
        first_name: userRow.first_name,
        last_name: userRow.last_name,
        role_id: userRow.role_id,
        password: 'plain-password',
      }),
    ).resolves.not.toHaveProperty('password');
    await expect(
      service.update(userRow.id, { password: 'new-password' }),
    ).resolves.not.toHaveProperty('password');
    await expect(service.delete(userRow.id)).resolves.not.toHaveProperty(
      'password',
    );
    expect(hashPassword).toHaveBeenCalledWith('plain-password');
    expect(hashPassword).toHaveBeenCalledWith('new-password');
    expect(supabaseService.create).toHaveBeenCalledWith(
      expect.objectContaining({ table: 'users' }),
      expect.objectContaining({ password: 'hashed-password' }),
    );
  });
});
