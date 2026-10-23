import { config } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';

// Nuxt UI's Button renders a router-aware Link, which warns without a router installed.
config.global.plugins = [createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }] })];
