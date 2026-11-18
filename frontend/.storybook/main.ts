import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: '@storybook/vue3-vite',
  viteFinal(config) {
    // The Vue devtools overlay is noise inside Storybook's iframe.
    config.plugins = (config.plugins ?? []).flat(Infinity).filter(
      plugin => !(plugin && 'name' in plugin && /vue-devtools|vite-plugin-vue-devtools/.test(plugin.name)),
    );
    return config;
  },
};

export default config;
