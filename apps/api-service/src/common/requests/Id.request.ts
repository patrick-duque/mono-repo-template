import { z } from 'zod';

export const IdRequestSchema = z.object({
  id: z.uuid(),
});

type IdRequest = z.infer<typeof IdRequestSchema>;

export type { IdRequest as default };
