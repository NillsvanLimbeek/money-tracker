import { fileURLToPath, URL } from 'node:url';

import { paraglideVitePlugin } from '@inlang/paraglide-js';
import ui from '@nuxt/ui/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import VueRouter from 'vue-router/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      // SPA without locale-prefixed URLs: remember the choice, then fall
      // back to the browser language and finally the base locale.
      strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
    }),
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
        // Per the design, outlined inputs/buttons get the exact #ededef
        // hairline border (--ui-border-accented) rather than Nuxt UI's
        // default neutral ring.
        input: {
          compoundVariants: [
            { variant: 'outline', class: 'ring-(--ui-border-accented)' },
          ],
        },
        button: {
          compoundVariants: [
            { color: 'neutral', variant: 'outline', class: 'ring-(--ui-border-accented)' },
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
