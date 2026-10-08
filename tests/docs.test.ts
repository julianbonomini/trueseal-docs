// The Human Docs on the built site: every page sits in the sidebar, previous/next follow it, the
// contents list and Pagefind work at the new URLs. Reads dist/.
import { describe, expect, test } from 'bun:test';
import { placeOf, sidebarSlugs } from '../src/config/nav.ts';
import { redirects } from '../src/config/redirects.ts';
import { indexedUrls, pagePaths, servedAt } from './dist.ts';

function pageHtml(path: string): string {
  const served = servedAt(path);
  if (served?.kind !== 'page') throw new Error(`${path} is not a built page`);
  return served.html;
}

describe('Human Docs', () => {
  test('every built docs page is in the sidebar, apart from the kitchen sink', () => {
    const docsPages = pagePaths().filter(path => path.startsWith('/docs/'));
    const placed = new Set([...sidebarSlugs.map(slug => `/docs/${slug}`), '/docs/kitchen-sink']);
    expect(docsPages.filter(path => !placed.has(path))).toEqual([]);
  });

  test('every sidebar page is built', () => {
    expect(sidebarSlugs.filter(slug => servedAt(`/docs/${slug}`)?.kind !== 'page')).toEqual([]);
  });

  test('previous and next links follow the sidebar order', () => {
    for (const slug of sidebarSlugs) {
      const nav = pageHtml(`/docs/${slug}`).match(/<nav class="next-page[^"]*"[\s\S]*?<\/nav>/)?.[0] ?? '';
      const hrefs = [...nav.matchAll(/href="([^"]*)"/g)].map(m => m[1]);
      const place = placeOf(slug)!;
      expect({ slug, hrefs }).toEqual({ slug, hrefs: [place.prev, place.next].flatMap(link => (link ? [link.href] : [])) });
    }
  });

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
    expect(sidebarSlugs.filter(slug => !urls.has(`/docs/${slug}/`))).toEqual([]);
    const unwanted = [...Object.keys(redirects).map(from => `${from}/`), '/404/', '/404.html'];
    expect(unwanted.filter(url => urls.has(url))).toEqual([]);
  });
});
