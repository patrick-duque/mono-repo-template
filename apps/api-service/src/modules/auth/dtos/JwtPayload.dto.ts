import { z } from 'zod';

export const JwtPayloadSchema = z.object({
  user_id: z.string().uuid(),
  email_address: z.string().email().optional(),
  role_id: z.string().uuid().optional(),
  iat: z.number().int().optional(),
  exp: z.number().int().optional(),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
