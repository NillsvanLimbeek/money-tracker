import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import AuthFormField from './AuthFormField.vue';

const meta = {
  title: 'Auth/AuthFormField',
  component: AuthFormField,
  args: {
    field: { name: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', autocomplete: 'email' },
    modelValue: '',
  },
  // The field is v-model only, so keep the value in a ref to make it editable.
  render: args => ({
    components: { AuthFormField },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: '<div class="p-4"><AuthFormField v-model="value" :field="args.field" /></div>',
  }),
} satisfies Meta<typeof AuthFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Email: Story = {};

export const Text: Story = {
  args: { field: { name: 'name', type: 'text', label: 'Name', placeholder: 'Your name', autocomplete: 'name' } },
};

/** The trailing button toggles whether the password is visible. */
export const Password: Story = {
  args: { field: { name: 'password', type: 'password', label: 'Password', autocomplete: 'current-password' } },
};

/** Type to see the strength bar move between weak, okay and strong. */
export const PasswordWithStrength: Story = {
  args: {
    field: { name: 'password', type: 'password', label: 'Password', hint: 'Min. 8 characters', autocomplete: 'new-password', showStrength: true },
    modelValue: 'correct-horse-9',
  },
};

export const Checkbox: Story = {
  args: { field: { name: 'remember', type: 'checkbox', label: 'Keep me signed in' }, modelValue: false },
};
