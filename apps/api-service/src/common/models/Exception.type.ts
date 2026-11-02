import { z } from 'zod';

export const ExceptionSchema = z
  .object({
    collection: z.string().optional(),
    id: z.union([z.uuid(), z.array(z.uuid())]).optional(),
    message: z.string().optional(),
    data: z.unknown().optional(),
  })
  .catchall(z.unknown());

type ExceptionParams = z.infer<typeof ExceptionSchema>;

export type { ExceptionParams as default };
