import type { SignIn } from '../models/sign-in';
import type { FormFieldConfig } from '@/lib/types';
import { m } from '@/paraglide/messages';

export const SIGN_IN_FIELDS: FormFieldConfig<SignIn>[] = [
  { name: 'email', type: 'email', label: m.field_email(), placeholder: m.field_email_placeholder(), autocomplete: 'email' },
  { name: 'password', type: 'password', label: m.field_password(), autocomplete: 'current-password' },
];
