// The built site the dist/ checks read, and how a site path maps onto it. Run `bun run build` first.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const dist = join(import.meta.dir, '..', 'dist');

/** Every built HTML page under dist/, as absolute paths. */
export function builtPages(dir = dist): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

/** What dist/ serves at a site path such as `/docs/integrate/pairing`. A query, a fragment and a
 *  trailing slash are ignored. A redirect is any page with a meta refresh; `to` is its target path. */
export function servedAt(path: string):
  | { kind: 'page'; html: string }
  | { kind: 'redirect'; to: string }
  | { kind: 'file' }
  | undefined {
  const clean = path.replace(/[?#].*$/, '').replace(/\/$/, '');
  if (clean.split('/').pop()!.includes('.')) {
    const file = join(dist, clean);
    return existsSync(file) && statSync(file).isFile() ? { kind: 'file' } : undefined;
  }
  const index = join(dist, clean, 'index.html');
  if (!existsSync(index)) return undefined;
  const html = readFileSync(index, 'utf8');
  if (!html.includes('http-equiv="refresh"')) return { kind: 'page', html };
  const to = html.match(/http-equiv="refresh"[^>]*content="[^"]*url=([^"]+)"/)?.[1] ?? '';
  return { kind: 'redirect', to: to.replace(/\/$/, '') || '/' };
}

/** The HTML of the page dist/ serves at a site path. Throws when the path is not a built page. */
export function pageHtml(path: string): string {
  const served = servedAt(path);
  if (served?.kind !== 'page') throw new Error(`${path} is not a built page`);
  return served.html;
}

/** Every site path dist/ serves as a page, such as `/docs/integrate/pairing`, with `/` for the
 *  Landing. Redirects and 404.html are left out. */
export function pagePaths(): string[] {
  return builtPages()
    .map(file => relative(dist, file))
    .filter(file => file.endsWith('index.html'))
    .map(file => `/${file.replace(/\/?index\.html$/, '')}`)
    .filter(path => servedAt(path)?.kind === 'page');
}

/** The URL of every page Pagefind indexed, as Pagefind records it (`/docs/integrate/pairing/`). */
export function indexedUrls(): string[] {
  // Each fragment is one indexed page: gzipped JSON behind a `pagefind_dcd` signature.
  const fragments = join(dist, 'pagefind', 'fragment');
  return readdirSync(fragments).map(name => {
    const text = new TextDecoder().decode(Bun.gunzipSync(readFileSync(join(fragments, name))));
    return JSON.parse(text.replace(/^pagefind_dcd/, '')).url as string;
  });
}
