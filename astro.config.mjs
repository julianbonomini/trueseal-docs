import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { redirects } from './src/config/redirects.ts';
import { codeTheme } from './src/config/shiki.ts';
import { siteUrl } from './src/config/site.ts';
import { writeMarkdownFiles } from './src/markdown/markdown.ts';

export default defineConfig({
  site: siteUrl,
  redirects,
  integrations: [
    react(),
    mdx(),
    sitemap(),
    { name: 'markdown-files', hooks: { 'astro:build:done': ({ dir }) => writeMarkdownFiles(fileURLToPath(dir)) } },
  ],
  markdown: {
    shikiConfig: { theme: codeTheme },
  },
});
