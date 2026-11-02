import { z } from 'zod';

export const AuthRefreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export type AuthRefreshToken = z.infer<typeof AuthRefreshTokenSchema>;
