import { z } from 'zod';

export const AuthLoginSchema = z.object({
  email_address: z.string().email(),
  password: z.string().min(1),
  remember_me: z.boolean().optional(),
});

export type AuthLogin = z.infer<typeof AuthLoginSchema>;
