<script setup lang="ts">
import { computed, ref } from 'vue';
import { m } from '@/paraglide/messages';

interface Field {
  name: string;
  type: 'text' | 'email' | 'password' | 'checkbox';
  label?: string;
  placeholder?: string;
  autocomplete?: string;
  hint?: string;
  showStrength?: boolean;
}

interface Props {
  field: Field;
}

const { field } = defineProps<Props>();

const modelValue = defineModel<string | boolean>({ required: true });

const showPassword = ref(false);

const stringValue = computed({
  get: () => (typeof modelValue.value === 'string' ? modelValue.value : ''),
  set: (value: string) => { modelValue.value = value; },
});

const boolValue = computed({
  get: () => (typeof modelValue.value === 'boolean' ? modelValue.value : false),
  set: (value: boolean) => { modelValue.value = value; },
});

const passwordStrength = computed(() => {
  if (field.type !== 'password' || !field.showStrength || !stringValue.value)
    return null;

  const value = stringValue.value;
  let score = 0;
  if (value.length >= 8)
    score += 1;
  if (value.length >= 12)
    score += 1;
  if (/[a-z]/.test(value) && /\d/.test(value))
    score += 1;
  if (/[^a-z0-9]/i.test(value))
    score += 1;

  if (score <= 1)
    return { label: m.password_weak(), percent: 33, color: 'error' as const };
  if (score <= 2)
    return { label: m.password_okay(), percent: 66, color: 'warning' as const };
  return { label: m.password_strong(), percent: 100, color: 'primary' as const };
});
</script>

<template>
  <UFormField
    v-if="field.type === 'checkbox'"
    :name="field.name"
  >
    <UCheckbox
      v-model="boolValue"
      :label="field.label"
    />
  </UFormField>

  <UFormField
    v-else
    :label="field.label"
    :name="field.name"
    :hint="field.hint"
    :ui="field.hint ? { hint: 'font-mono text-xs tracking-wide uppercase' } : undefined"
  >
    <UInput
      v-model="stringValue"
      class="w-full"
      :type="field.type === 'password' && showPassword ? 'text' : field.type"
      size="xl"
      :placeholder="field.placeholder"
      :autocomplete="field.autocomplete"
    >
      <template
        v-if="field.type === 'password'"
        #trailing
      >
        <button
          type="button"
          class="text-muted font-mono text-xs tracking-wide uppercase"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? m.password_hide() : m.password_show() }}
        </button>
      </template>
    </UInput>

    <div
      v-if="passwordStrength"
      class="mt-2 flex items-center gap-2"
    >
      <UProgress
        :model-value="passwordStrength.percent"
        :color="passwordStrength.color"
        size="xs"
        class="flex-1"
      />
      <span class="text-muted font-mono text-xs tracking-wide uppercase">{{ passwordStrength.label }}</span>
    </div>
  </UFormField>
</template>
