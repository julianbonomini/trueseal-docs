// Both documentation surfaces on the built site: every page sits in its sidebar, previous/next follow it, the
// contents list and Pagefind work at the new URLs. Reads dist/.
import { describe, expect, test } from 'bun:test';
import { placeOf, sidebarPaths, surfaceOf, type Surface } from '../src/config/nav.ts';
import { redirects } from '../src/config/redirects.ts';
import { indexedUrls, pageHtml, pagePaths, servedAt } from './dist.ts';

// Pages a surface builds outside its sidebar on purpose.
const unlisted: Record<Surface, string[]> = { docs: ['/docs/kitchen-sink'], agents: [] };

for (const surface of ['docs', 'agents'] as const) {
  describe(`${surface} sidebar`, () => {
    test('every built page is in the sidebar', () => {
      const built = pagePaths().filter(path => surfaceOf(path) === surface);
      const placed = new Set([...sidebarPaths(surface), ...unlisted[surface]].map(path => path.replace(/\/$/, '')));
      expect(built.filter(path => !placed.has(path))).toEqual([]);
    });

    test('every sidebar page is built', () => {
      expect(sidebarPaths(surface).filter(path => servedAt(path)?.kind !== 'page')).toEqual([]);
    });

    test('previous and next links follow the sidebar order', () => {
      for (const path of sidebarPaths(surface)) {
        const nav = pageHtml(path).match(/<nav class="next-page[^"]*"[\s\S]*?<\/nav>/)?.[0] ?? '';
        const hrefs = [...nav.matchAll(/href="([^"]*)"/g)].map(m => m[1]);
        const place = placeOf(path)!;
        expect({ path, hrefs }).toEqual({ path, hrefs: [place.prev, place.next].flatMap(link => (link ? [link.href] : [])) });
      }
    });
  });
}

describe('Human Docs', () => {
  test('the contents list works on a moved page', () => {
    const html = pageHtml('/docs/integrate/pairing');
    const toc = html.match(/<nav[^>]*aria-label="On this page"[^>]*>[\s\S]*?<\/nav>/)?.[0];
    expect(toc).toBeDefined();
    const ids = [...toc!.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.filter(id => !html.includes(`id="${id}"`))).toEqual([]);
  });

  test('Pagefind indexes every sidebar page at its new URL and no redirect or 404', () => {
    const urls = new Set(indexedUrls());
    expect(sidebarPaths('docs').filter(path => !urls.has(path.replace(/\/?$/, '/')))).toEqual([]);
    const unwanted = [...Object.keys(redirects).map(from => `${from}/`), '/404/', '/404.html'];
    expect(unwanted.filter(url => urls.has(url))).toEqual([]);
  });
});
