import type { SignIn } from '../models/sign-in';
import type { FormFieldConfig } from '@/lib/types';

export const SIGN_IN_FIELDS: FormFieldConfig<SignIn>[] = [
  { name: 'email', type: 'email', label: 'Email', placeholder: 'user@example.com', autocomplete: 'email' },
  { name: 'password', type: 'password', label: 'Password', autocomplete: 'current-password' },
];
