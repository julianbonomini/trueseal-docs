import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://trueseal.dev',
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      // Placeholder — swap for custom theme once Figma tokens land
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
