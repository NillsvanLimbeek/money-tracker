import * as z from 'zod';

export const SignInSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export type SignIn = z.output<typeof SignInSchema>;
