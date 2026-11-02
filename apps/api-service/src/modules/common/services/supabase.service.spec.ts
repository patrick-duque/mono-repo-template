import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { z } from 'zod';

import { BadRequestException, NotFoundException } from 'common/exceptions';

import { type CrudResourceConfig } from '../types';
import { SupabaseService } from './supabase.service';

const createClientMock = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

type QueryResult = {
  count?: number | null;
  data?: unknown;
  error: { message: string } | null;
};

type QueryBuilder = {
  eq: jest.MockedFunction<(key: string, value: unknown) => QueryBuilder>;
  filter: jest.MockedFunction<
    (key: string, operator: string, value: unknown) => QueryBuilder
  >;
  gte: jest.MockedFunction<(key: string, value: unknown) => QueryBuilder>;
  ilike: jest.MockedFunction<(key: string, value: unknown) => QueryBuilder>;
  in: jest.MockedFunction<(key: string, value: unknown[]) => QueryBuilder>;
  insert: jest.MockedFunction<(payload: unknown) => QueryBuilder>;
  is: jest.MockedFunction<(key: string, value: null) => QueryBuilder>;
  like: jest.MockedFunction<(key: string, value: unknown) => QueryBuilder>;
  lte: jest.MockedFunction<(key: string, value: unknown) => QueryBuilder>;
  maybeSingle: jest.MockedFunction<() => Promise<QueryResult>>;
  neq: jest.MockedFunction<(key: string, value: unknown) => QueryBuilder>;
  not: jest.MockedFunction<
    (key: string, operator: string, value: unknown) => QueryBuilder
  >;
  order: jest.MockedFunction<
    (key: string, options: { ascending: boolean }) => QueryBuilder
  >;
  range: jest.MockedFunction<
    (from: number, to: number) => Promise<QueryResult>
  >;
  select: jest.MockedFunction<
    (fields: string, options?: unknown) => QueryBuilder
  >;
  single: jest.MockedFunction<() => Promise<QueryResult>>;
  textSearch: jest.MockedFunction<
    (key: string, value: unknown) => QueryBuilder
  >;
  then: (
    resolve: (value: QueryResult) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise<unknown>;
  update: jest.MockedFunction<(payload: unknown) => QueryBuilder>;
};

const createQueryBuilder = (
  result: QueryResult = { data: [], count: 0, error: null },
): QueryBuilder => {
  const builder = {} as QueryBuilder;

  builder.eq = jest.fn(() => builder);
  builder.filter = jest.fn(() => builder);
  builder.gte = jest.fn(() => builder);
  builder.ilike = jest.fn(() => builder);
  builder.in = jest.fn(() => builder);
  builder.insert = jest.fn(() => builder);
  builder.is = jest.fn(() => builder);
  builder.like = jest.fn(() => builder);
  builder.lte = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(async () => result);
  builder.neq = jest.fn(() => builder);
  builder.not = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.range = jest.fn(async () => result);
  builder.select = jest.fn(() => builder);
  builder.single = jest.fn(async () => result);
  builder.textSearch = jest.fn(() => builder);
  builder.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);
  builder.update = jest.fn(() => builder);

  return builder;
};

const resource: CrudResourceConfig = {
  key: 'widgets',
  table: 'widgets',
  createSchema: z.object({ name: z.string() }),
  updateSchema: z.object({ name: z.string() }).partial(),
  softDelete: true,
  searchable: true,
};

const createService = (builders: QueryBuilder[]) => {
  const from = jest.fn(() => builders.shift());
  const client = { from };

  createClientMock.mockReturnValue(client);

  return {
    builders,
    client,
    from,
    service: new SupabaseService(),
  };
};

describe('SupabaseService', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.SUPABASE_KEY = 'test-key';
    createClientMock.mockReset();
  });

  it('validates UUID ids and payloads', () => {
    const { service } = createService([]);
    const id = '613c32db-e808-4f0f-9c79-6ea9eae95001';

    expect(service.validateId(id)).toBe(id);
    expect(
      service.validatePayload(resource.createSchema, { name: 'Starter' }),
    ).toEqual({ name: 'Starter' });
    expect(() => service.validateId('not-a-uuid')).toThrow(BadRequestException);
    expect(() => service.validatePayload(resource.createSchema, {})).toThrow(
      BadRequestException,
    );
  });

  it('applies filters, pagination, search, sort, count, and soft-delete clauses', async () => {
    const listBuilder = createQueryBuilder({
      data: [{ id: 'row-1' }],
      error: null,
    });
    const countBuilder = createQueryBuilder({ count: 25, error: null });
    const { service, from } = createService([listBuilder, countBuilder]);

    await expect(
      service.findBy(resource, {
        page: 2,
        perPage: 5,
        search: 'alpha+beta!',
        sortBy: 'name',
        orderBy: 'asc',
        tags: { $contains: 'design' },
        id: { $in: ['1', '2'] } as never,
        archived_at: { $isnull: true },
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      }),
    ).resolves.toEqual({
      data: [{ id: 'row-1' }],
      meta: {
        page: 2,
        perPage: 5,
        total: 25,
        totalPages: 5,
      },
    });

    expect(from).toHaveBeenCalledTimes(2);
    expect(listBuilder.gte).toHaveBeenCalledWith('name', '2026-01-01');
    expect(listBuilder.lte).toHaveBeenCalledWith('name', '2026-01-31');
    expect(listBuilder.filter).toHaveBeenCalledWith(
      'tags',
      'cs',
      JSON.stringify(['design']),
    );
    expect(listBuilder.in).toHaveBeenCalledWith('id', ['1', '2']);
    expect(listBuilder.is).toHaveBeenCalledWith('archived_at', null);
    expect(listBuilder.is).toHaveBeenCalledWith('deleted_at', null);
    expect(listBuilder.textSearch).toHaveBeenCalledWith(
      'search_vector',
      'alpha:* | beta:*',
    );
    expect(listBuilder.order).toHaveBeenCalledWith('name', { ascending: true });
    expect(listBuilder.range).toHaveBeenCalledWith(5, 9);
  });

  it('rejects unsupported search and malformed operator filters', async () => {
    const { service } = createService([]);
    const plainResource = { ...resource, searchable: false };

    await expect(
      service.findBy(plainResource, { search: 'client' }),
    ).rejects.toThrow(BadRequestException);

    const invalidFilterBuilder = createQueryBuilder();
    const invalidCountBuilder = createQueryBuilder();
    const invalidFilterService = createService([
      invalidFilterBuilder,
      invalidCountBuilder,
    ]).service;

    await expect(
      invalidFilterService.findBy(resource, { id: { $in: 'nope' } as never }),
    ).rejects.toThrow(BadRequestException);
  });

  it('surfaces missing rows and append-only update/delete blocks', async () => {
    const missingBuilder = createQueryBuilder({ data: null, error: null });
    const { service } = createService([missingBuilder]);

    await expect(service.findById(resource, { id: 'missing' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(
      service.update({ ...resource, appendOnly: true }, 'id', {}),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.delete({ ...resource, appendOnly: true }, 'id'),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.delete({ ...resource, softDelete: false }, 'id'),
    ).rejects.toThrow(BadRequestException);
  });
});
