import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UuidSchema } from '@white-label/shared';
import { type z } from 'zod';

import { BadRequestException } from 'common/exceptions';
import NotFoundException from 'common/exceptions/NotFound.exception';
import { type Filter } from 'common/models';

import {
  type CrudPayload,
  type CrudResourceConfig,
  type CrudResourceMap,
  type CrudRow,
  type FindManyOptions,
  type FindManyResult,
  type SelectFields,
  type SupabaseFindFilters,
} from '../types';

const PAGE = 1;
const PER_PAGE = 10;
const ORDER_BY = 'desc';
const SORT_BY = 'created_at';
const FALSE_VALUES = new Set(['false', '0', 'no']);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const getSelectQuery = (selectFields?: SelectFields): string => {
  if (!selectFields) return '*';

  return Array.isArray(selectFields) ? selectFields.join(',') : selectFields;
};

const formatSearchQuery = (search: string): string => {
  return search
    .replace(/\+/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((keyword: string) => `${keyword}:*`)
    .join(' | ');
};

const shouldIncludeCount = (value: unknown): boolean => {
  if (value === undefined) return true;
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return true;

  return !FALSE_VALUES.has(value.toLowerCase());
};

const parseOperatorString = (value: string): Record<string, unknown> | null => {
  if (!value.startsWith('{') || !value.endsWith('}')) return null;

  try {
    const json = value.replace(/'/g, '"').replace(/\$([a-zA-Z]+)/g, '"$$$1"');
    const parsed: unknown = JSON.parse(json);

    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeFilters = (
  filters: SupabaseFindFilters,
): SupabaseFindFilters => {
  return Object.fromEntries(
    Object.entries(filters).map(([key, rawValue]) => {
      if (typeof rawValue === 'string') {
        const parsed = parseOperatorString(rawValue);
        if (parsed) return [key, parsed];
      }

      return [key, rawValue];
    }),
  );
};

type QueryBuilder = {
  eq: (key: string, value: unknown) => QueryBuilder;
  filter: (key: string, operator: string, value: unknown) => QueryBuilder;
  gte: (key: string, value: unknown) => QueryBuilder;
  ilike: (key: string, value: unknown) => QueryBuilder;
  in: (key: string, value: unknown[]) => QueryBuilder;
  is: (key: string, value: null) => QueryBuilder;
  like: (key: string, value: unknown) => QueryBuilder;
  lte: (key: string, value: unknown) => QueryBuilder;
  neq: (key: string, value: unknown) => QueryBuilder;
  not: (key: string, operator: string, value: unknown) => QueryBuilder;
};

@Injectable()
export class SupabaseService {
  private supabaseClient: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor() {
    const url = process.env.SUPABASE_URL as string;
    const key = process.env.SUPABASE_KEY as string;

    if (!url || !key) {
      this.logger.error('Supabase URL or Key missing from environment.');
    }

    this.supabaseClient = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  getResource(
    resources: CrudResourceMap,
    resourceKey: string,
  ): CrudResourceConfig {
    const resource = resources[resourceKey];

    if (!resource) {
      throw new BadRequestException(`Unknown resource: ${resourceKey}.`);
    }

    return resource;
  }

  validateId(id: string): string {
    const result = UuidSchema.safeParse(id);

    if (!result.success) {
      throw new BadRequestException('Invalid UUID parameter.');
    }

    return result.data;
  }

  validatePayload(schema: z.ZodType, payload: CrudPayload): CrudPayload {
    const result = schema.safeParse(payload);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      });
    }

    return result.data as CrudPayload;
  }

  async listResource(
    resources: CrudResourceMap,
    resourceKey: string,
    filter?: Filter,
    selectFields?: SelectFields,
  ): Promise<FindManyResult> {
    return this.findBy(
      this.getResource(resources, resourceKey),
      filter,
      selectFields,
    );
  }

  async findResourceById(
    resources: CrudResourceMap,
    resourceKey: string,
    id: string,
    selectFields?: SelectFields,
  ): Promise<CrudRow> {
    return this.findById(
      this.getResource(resources, resourceKey),
      this.validateId(id),
      selectFields,
    );
  }

  async createResource(
    resources: CrudResourceMap,
    resourceKey: string,
    payload: CrudPayload,
  ): Promise<CrudRow> {
    const resource = this.getResource(resources, resourceKey);
    const parsed = this.validatePayload(resource.createSchema, payload);

    return this.create(resource, parsed);
  }

  async updateResource(
    resources: CrudResourceMap,
    resourceKey: string,
    id: string,
    payload: CrudPayload,
  ): Promise<CrudRow> {
    const resource = this.getResource(resources, resourceKey);

    if (!resource.updateSchema) {
      throw new BadRequestException(`${resource.key} cannot be updated.`);
    }

    const parsed = this.validatePayload(resource.updateSchema, payload);

    return this.update(resource, this.validateId(id), parsed);
  }

  async deleteResource(
    resources: CrudResourceMap,
    resourceKey: string,
    id: string,
  ): Promise<CrudRow> {
    return this.delete(
      this.getResource(resources, resourceKey),
      this.validateId(id),
    );
  }

  async findBy(
    resource: CrudResourceConfig,
    filters?: Filter,
    selectFields?: SelectFields,
    options: FindManyOptions = {},
  ): Promise<FindManyResult> {
    const selectQuery = getSelectQuery(selectFields);
    const {
      page = PAGE,
      perPage = PER_PAGE,
      orderBy = ORDER_BY,
      sortBy = SORT_BY,
      search,
      startDate,
      endDate,
      includeCount,
      ...restFilters
    } = filters ?? {};

    const pageNum = Math.max(1, Number(page) || PAGE);
    const perPageNum = Math.max(1, Number(perPage) || PER_PAGE);
    const from = (pageNum - 1) * perPageNum;
    const to = from + perPageNum - 1;
    const queryFilters = {
      ...(restFilters as SupabaseFindFilters),
      ...(options.filter ?? {}),
    };
    const formattedSearch = search ? formatSearchQuery(search) : null;
    const includeExactCount = shouldIncludeCount(includeCount);
    const isDesc = String(orderBy || ORDER_BY).toLowerCase() === 'desc';
    const sortField = String(sortBy || SORT_BY);

    if (formattedSearch && !resource.searchable) {
      throw new BadRequestException(
        `Search is not supported for ${resource.key}.`,
      );
    }

    let query = this.supabaseClient.from(resource.table).select(selectQuery);

    query = this.applyQueryFilters(query, queryFilters, {
      startDate,
      endDate,
      sortBy: sortField,
    });

    if (resource.softDelete) {
      query = query.is('deleted_at', null);
    }

    if (formattedSearch) {
      query = query.textSearch('search_vector', formattedSearch);
    }

    query = query.order(sortField, { ascending: !isDesc }).order('id', {
      ascending: true,
    });

    let countQuery;

    if (includeExactCount) {
      const countSelectQuery = getSelectQuery(options.countSelectFields);

      countQuery = this.supabaseClient
        .from(resource.table)
        .select(countSelectQuery, {
          count: 'exact',
          head: true,
        });

      countQuery = this.applyQueryFilters(countQuery, queryFilters, {
        startDate,
        endDate,
        sortBy: sortField,
      });

      if (resource.softDelete) {
        countQuery = countQuery.is('deleted_at', null);
      }

      if (formattedSearch) {
        countQuery = countQuery.textSearch('search_vector', formattedSearch);
      }
    }

    const [{ data, error }, countResult] = await Promise.all([
      query.range(from, to),
      includeExactCount
        ? countQuery
        : Promise.resolve({ count: null, error: null }),
    ]);

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (countResult?.error) {
      throw new BadRequestException(countResult.error.message);
    }

    const total = countResult?.count ?? 0;

    return {
      data: (data ?? []) as unknown as CrudRow[],
      meta: {
        page: pageNum,
        totalPages: includeExactCount ? Math.ceil(total / perPageNum) : 0,
        perPage: perPageNum,
        total: includeExactCount ? total : 0,
      },
    };
  }

  async findById(
    resource: CrudResourceConfig,
    idOrFilter: string | SupabaseFindFilters,
    selectFields?: SelectFields,
    modelName = resource.key,
  ): Promise<CrudRow> {
    const selectQuery = getSelectQuery(selectFields);
    const filters =
      typeof idOrFilter === 'string' ? { id: idOrFilter } : idOrFilter;
    let query = this.supabaseClient.from(resource.table).select(selectQuery);

    query = this.applyQueryFilters(query, filters);

    if (resource.softDelete) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException({
        collection: modelName,
        id: typeof idOrFilter === 'string' ? idOrFilter : undefined,
      });
    }

    return data as unknown as CrudRow;
  }

  async create(
    resource: CrudResourceConfig,
    payload: CrudPayload,
  ): Promise<CrudRow> {
    const { data, error } = await this.supabaseClient
      .from(resource.table)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async update(
    resource: CrudResourceConfig,
    id: string,
    payload: CrudPayload,
  ): Promise<CrudRow> {
    if (resource.appendOnly) {
      throw new BadRequestException(`${resource.key} is append-only.`);
    }

    let query = this.supabaseClient
      .from(resource.table)
      .update(payload)
      .eq('id', id);

    if (resource.softDelete) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.select('*').maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException({ collection: resource.table, id });
    }

    return data;
  }

  async delete(resource: CrudResourceConfig, id: string): Promise<CrudRow> {
    if (resource.appendOnly) {
      throw new BadRequestException(`${resource.key} is append-only.`);
    }

    if (!resource.softDelete) {
      throw new BadRequestException(`${resource.key} cannot be deleted.`);
    }

    return this.update(resource, id, {
      deleted_at: new Date().toISOString(),
    });
  }

  private applyQueryFilters<TQuery>(
    queryBuilder: TQuery,
    filters: SupabaseFindFilters = {},
    optionalFilters?: Pick<Filter, 'startDate' | 'endDate' | 'sortBy'>,
  ): TQuery {
    let result = queryBuilder as QueryBuilder;

    if (optionalFilters) {
      const { startDate, endDate, sortBy } = optionalFilters;

      if (startDate && endDate && sortBy) {
        result = result.gte(sortBy, startDate).lte(sortBy, endDate);
      }
    }

    const normalizedFilters = normalizeFilters(filters);

    Object.entries(normalizedFilters).forEach(([key, value]) => {
      if (isPlainObject(value)) {
        if ('$cs' in value) {
          const arrayValue = value.$cs;
          if (!Array.isArray(arrayValue)) {
            throw new BadRequestException('$cs must be an array');
          }

          result = result.filter(key, 'cs', JSON.stringify(arrayValue));
        } else if ('$contains' in value) {
          const containsValue = value.$contains;
          result = result.filter(
            key,
            'cs',
            JSON.stringify(
              Array.isArray(containsValue) ? containsValue : [containsValue],
            ),
          );
        } else if ('$in' in value) {
          const inValue = value.$in;
          if (!Array.isArray(inValue)) {
            throw new BadRequestException('$in must be an array');
          }

          result = result.in(key, inValue);
        } else if ('$isnull' in value) {
          result = value.$isnull
            ? result.is(key, null)
            : result.not(key, 'is', null);
        } else if ('$isnotnull' in value || '$notnull' in value) {
          const isNot = value.$isnotnull ?? value.$notnull;
          result = isNot ? result.not(key, 'is', null) : result.is(key, null);
        } else if ('$like' in value) {
          result = result.like(key, value.$like);
        } else if ('$ilike' in value) {
          result = result.ilike(key, value.$ilike);
        } else if ('$ne' in value) {
          result = result.neq(key, value.$ne);
        } else if ('$gte' in value && '$lte' in value) {
          result = result.gte(key, value.$gte).lte(key, value.$lte);
        } else if ('$gte' in value) {
          result = result.gte(key, value.$gte);
        } else if ('$lte' in value) {
          result = result.lte(key, value.$lte);
        } else {
          result = result.eq(key, value);
        }
      } else {
        result = result.eq(key, value);
      }
    });

    return result as TQuery;
  }
}
