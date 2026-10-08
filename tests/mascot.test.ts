// Mascot checks: the artwork in brand/mascot/ and where the built site shows it. Reads dist/, so run
// `bun run build` first. How the seal looks can only be checked by screenshot.
import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { builtPages, dist } from './dist.ts';

const root = join(import.meta.dir, '..');
const mascotDir = join(root, 'brand', 'mascot');
const notFoundPath = join(dist, '404.html');
if (!existsSync(notFoundPath)) throw new Error('dist/404.html is missing. Run bun run build first.');

const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;

/** Width and height from a PNG's IHDR chunk. */
function pngSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('Mascot artwork', () => {
  test('the SVG uses only ink and one seal detail, in both colour schemes', () => {
    const svg = readFileSync(join(mascotDir, 'mascot.svg'), 'utf8');
    const hexes = new Set([...svg.matchAll(hexPattern)].map(m => m[0].slice(1).toUpperCase()));
    const allowed = new Set(['1A1814', 'EDE7DA', 'A3301E', 'E4644B']);
    expect([...hexes].filter(hex => !allowed.has(hex))).toEqual([]);
    expect(svg.match(/class="mascot__seal"/g)?.length).toBe(1);
    expect(svg).not.toMatch(/(fill|stroke)="#/);
    expect(svg).toContain('prefers-color-scheme: dark');
  });

  test('the PNG exports have their sizes', () => {
    expect(pngSize(join(mascotDir, 'mascot-avatar.png'))).toEqual({ width: 1024, height: 1024 });
    expect(pngSize(join(mascotDir, 'mascot-readme-header.png'))).toEqual({ width: 1280, height: 400 });
  });
});

describe('404 page', () => {
  const html = readFileSync(notFoundPath, 'utf8');

  test('shows the mascot in Theme colours and a way back', () => {
    const svgs = [...html.matchAll(/<svg[^>]*>[\s\S]*?<\/svg>/g)].map(m => m[0]);
    const mascots = svgs.filter(svg => /^<svg[^>]*class="mascot"/.test(svg));
    expect(mascots.length).toBe(1);
    expect(mascots[0]).not.toContain('<style');
    expect(mascots[0]).not.toMatch(hexPattern);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/docs/introduction"');
  });

  test('is left out of the search index', () => {
    // Each Pagefind fragment is one indexed page, gzipped, holding its URL.
    const fragmentDir = join(dist, 'pagefind', 'fragment');
    const urls = readdirSync(fragmentDir).map(name => {
      const fragment = new TextDecoder().decode(Bun.gunzipSync(readFileSync(join(fragmentDir, name))));
      return fragment.match(/"url":"([^"]*)"/)?.[1];
    });
    expect(urls).toContain('/docs/introduction/');
    expect(urls).not.toContain('/404.html');
  });
});

describe('Mascot placement', () => {
  test('the mascot appears only on pages the brandbook allows', () => {
    // The preview-pages Goal adds the Why TrueSeal exists page here when it writes it.
    const allowed = ['404.html'];
    const withMascot = builtPages()
      .filter(path => readFileSync(path, 'utf8').includes('class="mascot"'))
      .map(path => relative(dist, path));
    expect(withMascot).toEqual(allowed);
  });
});
