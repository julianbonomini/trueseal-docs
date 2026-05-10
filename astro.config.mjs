import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    react(),
    mdx(),
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
