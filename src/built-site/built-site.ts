// The site `astro build` wrote to dist/, as the site paths it serves. This module owns how dist/ maps to site
// paths and how a redirect page is told from a page; everything that reads the build asks it.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** What an index.html under dist/ is: a page with its HTML, or a redirect to a root-relative path with no trailing slash ('/' for the root). */
export type BuiltPage = { kind: 'page'; html: string } | { kind: 'redirect'; to: string };

export interface BuiltSite {
  /** Every index.html under dist/, by site path: '/' for the Landing, '/docs/integrate/pairing'; no trailing slash. */
  pages: Map<string, BuiltPage>;
  /** Site path of every other built file: '/404.html', '/llms.txt', '/agents/api.md', '/_astro/….css'. */
  files: Set<string>;
}

/** The site built in `dist`, read now. Throws `No build in <dist>: run bun run build first` when dist/index.html is missing,
 *  and `No url in meta refresh` when a redirect page names no target. */
export function builtSite(dist: string): BuiltSite {
  if (!existsSync(join(dist, 'index.html'))) throw new Error(`No build in ${dist}: run bun run build first`);
  const site: BuiltSite = { pages: new Map(), files: new Set() };
  const walk = (dir: string, path: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name), `${path}/${entry.name}`);
      else if (entry.name !== 'index.html') site.files.add(`${path}/${entry.name}`);
      else site.pages.set(path || '/', builtPage(readFileSync(join(dir, entry.name), 'utf8')));
    }
  };
  walk(dist, '');
  return site;
}

// Astro writes a redirect as a page holding only a meta refresh to its target.
function builtPage(html: string): BuiltPage {
  const refresh = html.match(/<meta http-equiv="refresh"[^>]*>/)?.[0];
  if (!refresh) return { kind: 'page', html };
  const to = refresh.match(/content="[^"]*url=([^"]*)"/)?.[1];
  if (to === undefined) throw new Error(`No url in meta refresh: ${refresh}`);
  return { kind: 'redirect', to: to.replace(/\/$/, '') || '/' };
}

/** What `site` serves at a site path such as '/docs/integrate/pairing/?x=1#y'. A query, a fragment and a trailing slash are
 *  ignored; a path whose last segment has a dot is a file. Undefined when nothing is served there. */
export function servedAt(site: BuiltSite, path: string): BuiltPage | { kind: 'file' } | undefined {
  const clean = path.replace(/[?#].*$/, '').replace(/\/$/, '') || '/';
  if (clean.split('/').pop()!.includes('.')) return site.files.has(clean) ? { kind: 'file' } : undefined;
  return site.pages.get(clean);
}
