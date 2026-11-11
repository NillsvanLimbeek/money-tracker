import type { SignUp } from '@/features/auth/models/sign-up';
import type { FormFieldConfig } from '@/features/auth/types';
import { m } from '@/paraglide/messages';

export const SIGN_UP_FIELDS: FormFieldConfig<SignUp>[] = [
  { name: 'name', type: 'text', label: m.field_name(), placeholder: m.field_name_placeholder(), autocomplete: 'name' },
  { name: 'email', type: 'email', label: m.field_email(), placeholder: m.field_email_placeholder(), autocomplete: 'email' },
  { name: 'password', type: 'password', label: m.field_password(), hint: m.field_password_hint(), autocomplete: 'new-password', showStrength: true },
  { name: 'agreedToTerms', type: 'checkbox', label: m.field_terms() },
];
