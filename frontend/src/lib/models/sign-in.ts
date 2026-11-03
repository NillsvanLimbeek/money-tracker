import * as z from 'zod';
import { m } from '@/paraglide/messages';

export const SignInSchema = z.object({
  email: z.email(m.validation_email()),
  password: z.string().min(1, m.validation_password_required()),
});

export type SignIn = z.output<typeof SignInSchema>;
