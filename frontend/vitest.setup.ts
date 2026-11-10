import { config } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createStorage } from './src/test/create-storage';

// Nuxt UI's Button renders a router-aware Link, which warns without a router installed.
config.global.plugins = [createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }] })];

// Node's own `--localstorage-file` flag leaves `localStorage` without `getItem`, which breaks `useLocalStorage`.
// Defined directly rather than with `vi.stubGlobal` so a spec's `vi.unstubAllGlobals()` falls back to this one.
for (const target of [globalThis, window])
  Object.defineProperty(target, 'localStorage', { value: createStorage(), configurable: true, writable: true });
