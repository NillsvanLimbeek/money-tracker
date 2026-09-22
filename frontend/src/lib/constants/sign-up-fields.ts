import type { SignUp } from '../models/sign-up';
import type { FormFieldConfig } from '@/lib/types';

export const SIGN_UP_FIELDS: FormFieldConfig<SignUp>[] = [
  { name: 'name', type: 'text', label: 'Your name', placeholder: 'Sanne de Vries', autocomplete: 'name' },
  { name: 'email', type: 'email', label: 'Email', placeholder: 'sanne@post.nl', autocomplete: 'email' },
  { name: 'password', type: 'password', label: 'Password', hint: '8+ characters', autocomplete: 'new-password', showStrength: true },
  { name: 'agreedToTerms', type: 'checkbox', label: 'I agree to the terms and privacy notice' },
];
