import { z } from 'zod';

export const LoginFormSchema = z.object({
  email_address: z.string().min(1, 'Email address is required.').email({
    message: 'Enter a valid email address.',
  }),
  password: z.string().min(1, 'Password is required.'),
  remember_me: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;
