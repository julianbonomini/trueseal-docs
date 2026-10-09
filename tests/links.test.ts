// No built page links to a missing page, a missing #fragment or a redirect. Reads dist/.
import { expect, test } from 'bun:test';
import { pagePaths, servedAt } from './dist.ts';

// Written by the preview-trust Goal; remove each entry when its page lands.
const pending = new Set(['/docs/trust/threat-model']);

test('every internal link points at a built page or file, and its fragment exists', () => {
  const broken: string[] = [];
  const pages = pagePaths();
  for (const pagePath of pages) {
    const served = servedAt(pagePath);
    if (served?.kind !== 'page') continue;
    // A page is served from its directory, so relative links resolve against `pagePath/`.
    const base = `https://x${pagePath.replace(/\/?$/, '/')}`;
    for (const [, href] of served.html.matchAll(/<a\b[^>]*?\bhref="([^"]*)"/g)) {
      if (/^[a-z][a-z+.-]*:|^\/\//i.test(href) || href === '#') continue;
      const url = new URL(href, base);
      const path = url.pathname.replace(/\/$/, '') || '/';
      if (pending.has(path)) continue;
      const target = servedAt(path);
      const fragment = decodeURIComponent(url.hash.slice(1));
      const ok =
        target?.kind === 'file' ||
        (target?.kind === 'page' && (!fragment || target.html.includes(`id="${fragment}"`)));
      if (!ok) broken.push(`${pagePath} → ${href}`);
    }
  }
  expect(pages.length).toBeGreaterThan(0);
  expect(broken).toEqual([]);
});

test('no pending page has been built yet', () => {
  expect([...pending].filter(path => servedAt(path) !== undefined)).toEqual([]);
});
