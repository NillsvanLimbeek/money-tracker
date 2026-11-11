<script setup lang="ts">
import type { FormError } from '@nuxt/ui';
import type { RuleDraft } from '@/features/rules/types';
import type { Category, CategoryRule, RuleOperator, RulePreview } from '@/lib/types';
import { computed, reactive, useTemplateRef } from 'vue';
import { RULE_FIELDS } from '@/features/rules/constants';
import { validateRule } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  categories: Category[];
  rules: CategoryRule[];
  // What the draft matches; undefined until the first lookup returns.
  preview?: RulePreview;
  pending?: boolean;
  // Id of the rule being edited; undefined when creating.
  editingId?: string;
}

const { categories, rules, preview, pending = false, editingId } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'save'): void;
  (e: 'saveAndApply'): void;
  (e: 'editExisting', id: string): void;
}>();

const isOpen = defineModel<boolean>('open', { required: true });
const operator = defineModel<RuleOperator>('operator', { required: true });
const pattern = defineModel<string>('pattern', { required: true });
const categoryKey = defineModel<string | null>('categoryKey', { required: true });

const FORM_ID = 'rule-form';

const form = useTemplateRef('form');

// Writes go through to the models above.
const state: RuleDraft = reactive({ operator, pattern, categoryKey });

const validation = computed(() => validateRule(
  { pattern: pattern.value, operator: operator.value },
  rules,
  categories,
  preview?.descriptions.length,
  editingId,
));

const warning = computed(() => validation.value.level === 'warning' ? validation.value.message : null);

function validate(): FormError[] {
  const errors: FormError[] = [];

  if (validation.value.level === 'error')
    errors.push({ name: 'pattern', message: validation.value.message ?? '' });

  if (categoryKey.value === null)
    errors.push({ name: 'categoryKey', message: m.rule_form_choose_category() });

  return errors;
}

async function save(): Promise<void> {
  if (await form.value?.validate({ silent: true }))
    emit('save');
}
</script>

<template>
  <AppDrawer
    v-model:open="isOpen"
    :title="editingId ? m.rule_form_edit_title() : m.rule_form_new_title()"
  >
    <UForm
      :id="FORM_ID"
      ref="form"
      :state
      :validate
      class="flex flex-col gap-5"
      @submit="emit('saveAndApply')"
    >
      <UFormField
        v-for="field in RULE_FIELDS"
        :key="field.name"
        :name="field.name"
        :label="field.type === 'text' ? undefined : field.label"
      >
        <USelect
          v-if="field.type === 'select'"
          v-model="state.operator"
          :items="field.items"
          size="xl"
          class="w-full font-mono"
        />

        <div
          v-else-if="field.type === 'text'"
          class="flex flex-col gap-2"
        >
          <UInput
            v-model="state.pattern"
            size="xl"
            :placeholder="field.placeholder"
            class="w-full font-mono"
          />

          <p
            v-if="warning"
            role="alert"
            class="bg-warning/10 border-warning/20 text-warning flex gap-2 rounded-xl border p-3 text-sm"
          >
            <UIcon
              name="i-lucide-triangle-alert"
              class="mt-0.5 size-4 shrink-0"
            />
            {{ warning }}
          </p>

          <UButton
            v-if="validation.duplicateId"
            variant="link"
            size="sm"
            class="self-start p-0"
            @click="emit('editExisting', validation.duplicateId)"
          >
            {{ m.rule_form_edit_existing() }}
          </UButton>
        </div>

        <CategorySelect
          v-else
          v-model="state.categoryKey"
          :categories
        />
      </UFormField>

      <RulePreview
        v-if="preview && pattern.trim() !== ''"
        :preview
      />
    </UForm>

    <template #footer>
      <div class="flex w-full flex-col gap-3">
        <UButton
          type="submit"
          :form="FORM_ID"
          block
          size="xl"
          class="justify-center"
          :loading="pending"
        >
          {{ m.rule_form_save_apply() }}
        </UButton>

        <div class="grid grid-cols-2 gap-3">
          <UButton
            block
            size="xl"
            color="neutral"
            variant="outline"
            class="justify-center"
            @click="isOpen = false"
          >
            {{ m.common_cancel() }}
          </UButton>

          <UButton
            block
            size="xl"
            color="neutral"
            variant="outline"
            class="justify-center"
            :disabled="pending"
            @click="save"
          >
            {{ m.common_save() }}
          </UButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>
