import type { Preview } from '@storybook/vue3-vite';
import ui from '@nuxt/ui/vue-plugin';
import { setup } from '@storybook/vue3-vite';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import StoryWrapper from './StoryWrapper.vue';

import '../src/assets/main.css';

setup((app) => {
  app.use(createPinia());
  app.use(createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
  }));
  app.use(ui);
  app.use(VueQueryPlugin);
});

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    story => ({
      render: () => h(StoryWrapper, null, { default: () => h(story()) }),
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      // 'error' fails the story in the Vitest run (`pnpm test:a11y`) on any axe
      // violation; use 'todo' (report only) or 'off' per story to opt out.
      test: 'error',
      options: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      },
    },
  },
};

export default preview;
