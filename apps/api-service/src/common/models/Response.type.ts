import { z } from 'zod';

import { DataSchema } from './Data.type';
import { MetaSchema } from './Meta.type';

export const ResponseSchema = z.object({
  statusCode: z.number().optional(),
  data: z.union([z.array(DataSchema), DataSchema, z.unknown()]).optional(),
  meta: MetaSchema.optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
});

export const createResponseSchema = <TDataSchema extends z.ZodType>(
  dataSchema: TDataSchema,
) =>
  ResponseSchema.extend({
    data: z.union([z.array(dataSchema), dataSchema]).optional(),
  });

type Response = z.infer<typeof ResponseSchema>;

export type { Response as default };
