import * as z from 'zod';

export const SignUpSchema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  agreedToTerms: z.boolean().refine(value => value, 'You must agree to the terms and privacy notice'),
});

export type SignUp = z.output<typeof SignUpSchema>;
