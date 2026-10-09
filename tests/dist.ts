// The built site the dist/ checks read, through src/built-site. Run `bun run build` first.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type BuiltPage, builtSite, servedAt as servedIn } from '../src/built-site/built-site.ts';

export const dist = join(import.meta.dir, '..', 'dist');

// Read once at import: Bun runs every test file in one process, and every importer needs the build.
const site = builtSite(dist);

/** What dist/ serves at a site path such as `/docs/integrate/pairing`. A query, a fragment and a
 *  trailing slash are ignored. */
export function servedAt(path: string): BuiltPage | { kind: 'file' } | undefined {
  return servedIn(site, path);
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
  return [...site.pages].filter(([, page]) => page.kind === 'page').map(([path]) => path);
}

/** Every HTML document a reader can land on, by site path: each built page, then each other .html file
 *  such as `/404.html`. Redirects are left out. */
export function htmlDocuments(): { path: string; html: string }[] {
  const pages = [...site.pages].flatMap(([path, page]) => (page.kind === 'page' ? [{ path, html: page.html }] : []));
  // A file's site path is its path under dist/.
  const files = [...site.files]
    .filter(path => path.endsWith('.html'))
    .map(path => ({ path, html: readFileSync(join(dist, path), 'utf8') }));
  return [...pages, ...files];
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

/** `html` with the entities Astro escapes in text decoded, so it can be matched against source strings. */
export function decodeEntities(html: string): string {
  return html
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/** The visible text of `html`: each <script> and <style> block and each tag replaced by a space, entities
 *  decoded. Whitespace is kept as it is; callers collapse it when they need to. */
export function visibleText(html: string): string {
  return decodeEntities(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' '));
}
