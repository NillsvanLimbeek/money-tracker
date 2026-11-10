<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCategoryRules } from '@/lib/api/category-rules/category-rules.queries';
import { usePreferences } from '@/lib/composables';
import { DATE_FORMAT_OPTIONS, LANGUAGE_OPTIONS, NUMBER_FORMAT_OPTIONS } from '@/lib/constants';
import { m } from '@/paraglide/messages';
import { getLocale, setLocale } from '@/paraglide/runtime';

const { autoCategorise, suggestRule, numberFormat, dateFormat } = usePreferences();

// Changing the language reloads the page, since messages are read once at startup.
const language = computed({
  get: () => getLocale(),
  set: (locale) => { void setLocale(locale); },
});

const numberFormatOpen = ref(false);
const dateFormatOpen = ref(false);
const numberFormatLabel = computed(() => NUMBER_FORMAT_OPTIONS.find(option => option.value === numberFormat.value)?.label);
const dateFormatLabel = computed(() => DATE_FORMAT_OPTIONS.find(option => option.value === dateFormat.value)?.label);

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

    <SettingsSection :title="m.settings_language_region()">
      <SettingsRow :label="m.settings_language()">
        <template #trailing>
          <SegmentedControl
            v-model="language"
            :options="LANGUAGE_OPTIONS.slice()"
            :aria-label="m.settings_language()"
          />
        </template>
      </SettingsRow>

      <SettingsRow
        :label="m.settings_number_format()"
        pressable
        @click="numberFormatOpen = true"
      >
        <template #trailing>
          <span class="text-muted flex items-center gap-3 font-mono">
            {{ numberFormatLabel }}
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4"
            />
          </span>
        </template>
      </SettingsRow>

      <SettingsRow
        :label="m.settings_date_format()"
        pressable
        @click="dateFormatOpen = true"
      >
        <template #trailing>
          <span class="text-muted flex items-center gap-3 font-mono">
            {{ dateFormatLabel }}
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4"
            />
          </span>
        </template>
      </SettingsRow>
    </SettingsSection>
  </div>

  <OptionDrawer
    v-model="numberFormat"
    v-model:open="numberFormatOpen"
    :title="m.settings_number_format()"
    :options="NUMBER_FORMAT_OPTIONS"
  />

  <OptionDrawer
    v-model="dateFormat"
    v-model:open="dateFormatOpen"
    :title="m.settings_date_format()"
    :options="DATE_FORMAT_OPTIONS"
  />

  <div class="h-28" />
</template>
