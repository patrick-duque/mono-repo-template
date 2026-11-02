import { z } from 'zod';

export const DataSchema = z.record(z.string(), z.unknown());

type Data = z.infer<typeof DataSchema>;

export type { Data as default };
