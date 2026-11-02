import { type z } from 'zod';

export type CrudResourceConfig = {
  readonly key: string;
  readonly table: string;
  readonly createSchema: z.ZodType;
  readonly updateSchema?: z.ZodType;
  readonly softDelete: boolean;
  readonly appendOnly?: boolean;
  readonly searchable?: boolean;
};

export type CrudResourceMap = Record<string, CrudResourceConfig>;

export type CrudPayload = Record<string, unknown>;

export type SelectFields = string | string[];

export type CrudRow = Record<string, unknown> & {
  id: string;
};

export type SupabaseFindValue =
  string | number | boolean | null | Record<string, unknown>;

export type SupabaseFindFilters = Record<string, SupabaseFindValue>;

export type FindManyOptions = {
  filter?: SupabaseFindFilters;
  countSelectFields?: SelectFields;
};

export type FindManyMeta = {
  page: number;
  totalPages: number;
  perPage: number;
  total: number;
};

export type FindManyResult = {
  data: CrudRow[];
  meta: FindManyMeta;
};
