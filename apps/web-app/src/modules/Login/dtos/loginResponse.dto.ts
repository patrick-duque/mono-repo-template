import { z } from 'zod';

export const LoginResponseSchema = z.object({
  data: z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1).optional(),
    user: z.unknown().optional(),
  }),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  statusCode: z.number().optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
