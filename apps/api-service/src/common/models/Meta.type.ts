import { z } from 'zod';

export const MetaSchema = z
  .object({
    page: z.number(),
    total: z.number(),
    totalPages: z.number(),
    perPage: z.number(),
  })
  .catchall(z.unknown());

type Meta = z.infer<typeof MetaSchema>;

export type { Meta as default };
