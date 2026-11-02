import { z } from 'zod';

import { MetaSchema } from './Meta.type';

export const ORDER_BY_TYPE = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const OrderByTypeSchema = z.enum(['asc', 'desc', 'ASC', 'DESC']);

export const FilterSchema = MetaSchema.partial()
  .extend({
    id: z.uuid().optional(),
    keyword: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    includeCount: z.union([z.boolean(), z.string()]).optional(),
    sortBy: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    perPage: z.coerce.number().int().positive().optional(),
    orderBy: OrderByTypeSchema.optional(),
  })
  .catchall(z.unknown());

type Filter = z.infer<typeof FilterSchema>;
export type ORDER_BY_TYPE = z.infer<typeof OrderByTypeSchema>;

export type { Filter as default };
