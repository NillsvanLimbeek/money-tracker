<script setup lang="ts">
import { computed } from 'vue';
import { useCategoryRules } from '@/lib/api/category-rules/category-rules.queries';
import { usePreferences } from '@/lib/composables/use-preferences';
import { m } from '@/paraglide/messages';

const { autoCategorise, suggestRule } = usePreferences();

const rulesQuery = useCategoryRules();
const rules = computed(() => rulesQuery.data.value);
</script>

<template>
  <PageHeader :title="m.settings_title()" />

  <div class="flex flex-col gap-6 px-4">
    <SettingsSection :title="m.settings_accounts()">
      <SettingsRow
        :label="m.settings_add_account()"
        action
      />
    </SettingsSection>

    <SettingsSection :title="m.settings_categorisation()">
      <SettingsRow
        :label="m.settings_category_rules()"
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

      <SettingsRow :label="m.settings_auto_categorise()">
        <template #trailing>
          <USwitch v-model="autoCategorise" />
        </template>
      </SettingsRow>

      <SettingsRow :label="m.settings_suggest_rule()">
        <template #trailing>
          <USwitch v-model="suggestRule" />
        </template>
      </SettingsRow>
    </SettingsSection>
  </div>

  <div class="h-28" />
</template>
