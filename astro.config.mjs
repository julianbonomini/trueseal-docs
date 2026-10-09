import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { redirects } from './src/config/redirects.ts';
import { codeTheme } from './src/config/shiki.ts';

export default defineConfig({
  site: 'https://trueseal.dev',
  redirects,
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: codeTheme },
  },
});
