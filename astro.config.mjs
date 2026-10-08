import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { createCssVariablesTheme } from 'shiki';

export default defineConfig({
  site: 'https://trueseal.dev',
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      // Colours come from the --shiki-* variables in src/styles/tokens.css, so code follows the Theme.
      theme: createCssVariablesTheme({ name: 'trueseal', variablePrefix: '--shiki-', variableDefaults: {}, fontStyle: true }),
    },
  },
});
