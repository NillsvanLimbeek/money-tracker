import { fileURLToPath, URL } from 'node:url';

import ui from '@nuxt/ui/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import VueRouter from 'vue-router/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    vue(),
    vueDevTools(),
    ui({
      ui: {
        // 'brand' is our custom indigo-violet scale, defined in
        // src/assets/main.css and anchored at shade 500 = #4f45c4.
        colors: {
          primary: 'brand',
          neutral: 'zinc',
        },
        // Per the design, outlined inputs/buttons get a dark border
        // (--ui-bg-inverted) instead of Nuxt UI's default hairline ring.
        input: {
          compoundVariants: [
            { variant: 'outline', class: 'ring-(--ui-text-dimmed)' },
          ],
        },
        button: {
          compoundVariants: [
            { color: 'neutral', variant: 'outline', class: 'ring-(--ui-text-dimmed)' },
          ],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
