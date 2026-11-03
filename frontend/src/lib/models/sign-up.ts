import * as z from 'zod';
import { m } from '@/paraglide/messages';

export const SignUpSchema = z.object({
  name: z.string().min(1, m.validation_name_required()),
  email: z.email(m.validation_email()),
  password: z.string().min(8, m.validation_password_min()),
  agreedToTerms: z.boolean().refine(value => value, m.validation_terms()),
});

export type SignUp = z.output<typeof SignUpSchema>;
