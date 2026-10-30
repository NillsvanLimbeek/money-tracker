<script setup lang="ts">
import { computed } from 'vue';
import { useCategoryRules } from '@/lib/api/category-rules/category-rules.queries';
import { usePreferences } from '@/lib/composables/use-preferences';

const { autoCategorise, suggestRule } = usePreferences();

const rulesQuery = useCategoryRules();
const rules = computed(() => rulesQuery.data.value);
</script>

<template>
  <PageHeader title="Settings" />

  <div class="flex flex-col gap-6 px-4">
    <SettingsSection title="Accounts">
      <SettingsRow
        label="Add account"
        action
      />
    </SettingsSection>

    <SettingsSection title="Categorisation">
      <SettingsRow
        label="Category rules"
        to="/settings/rules"
      >
        <template
          v-if="rules"
          #trailing
        >
          <span class="text-muted flex items-center gap-3 font-mono">
            {{ rules.length }}
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4"
            />
          </span>
        </template>
      </SettingsRow>

      <SettingsRow label="Auto-categorise on import">
        <template #trailing>
          <USwitch v-model="autoCategorise" />
        </template>
      </SettingsRow>

      <SettingsRow label="Suggest a rule after manual changes">
        <template #trailing>
          <USwitch v-model="suggestRule" />
        </template>
      </SettingsRow>
    </SettingsSection>
  </div>

  <div class="h-28" />
</template>
