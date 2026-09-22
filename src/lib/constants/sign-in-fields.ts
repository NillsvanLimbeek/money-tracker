import type { SignIn } from '../models/sign-in';
import type { FormFieldConfig } from '@/lib/types';

export const SignInFields: FormFieldConfig<SignIn>[] = [
  { name: 'email', type: 'email', label: 'Email', placeholder: 'sanne@post.nl', autocomplete: 'email' },
  { name: 'password', type: 'password', label: 'Password', autocomplete: 'current-password' },
];
