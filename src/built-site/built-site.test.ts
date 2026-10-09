import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { builtSite, servedAt } from './built-site.ts';

const redirectTo = (url: string) => `<!doctype html><meta http-equiv="refresh" content="0;url=${url}">`;
const page = '<!doctype html><article><h1>A</h1></article>';
const landing = '<!doctype html><main>Landing</main>';

let dist: string;

function write(path: string, text: string): void {
  mkdirSync(dirname(join(dist, path)), { recursive: true });
  writeFileSync(join(dist, path), text);
}

beforeEach(() => {
  dist = mkdtempSync(join(tmpdir(), 'built-site-'));
});

afterEach(() => {
  rmSync(dist, { recursive: true, force: true });
});

describe('builtSite', () => {
  beforeEach(() => {
    write('index.html', landing);
    write('docs/index.html', redirectTo('/docs/overview/introduction/'));
    write('docs/a/index.html', page);
    write('agents/index.html', page);
    write('old/index.html', redirectTo('/'));
    write('404.html', '<!doctype html><p>Not found</p>');
    write('llms.txt', 'llms');
    write('agents.md', '# Agents');
    write('_astro/x.css', 'body{}');
  });

  test('lists every index.html by its site path, with no trailing slash', () => {
    expect([...builtSite(dist).pages.keys()].sort()).toEqual(['/', '/agents', '/docs', '/docs/a', '/old']);
  });

  test('a page keeps its HTML, and one with no article and no meta refresh is still a page', () => {
    const { pages } = builtSite(dist);
    expect(pages.get('/docs/a')).toEqual({ kind: 'page', html: page });
    expect(pages.get('/')).toEqual({ kind: 'page', html: landing });
  });

  test('a redirect points at its target with no trailing slash, and a redirect to the root stays /', () => {
    const { pages } = builtSite(dist);
    expect(pages.get('/docs')).toEqual({ kind: 'redirect', to: '/docs/overview/introduction' });
    expect(pages.get('/old')).toEqual({ kind: 'redirect', to: '/' });
  });

  test('lists every other file by its site path, and none of them as a page', () => {
    const site = builtSite(dist);
    expect([...site.files].sort()).toEqual(['/404.html', '/_astro/x.css', '/agents.md', '/llms.txt']);
    for (const file of site.files) expect(site.pages.has(file)).toBe(false);
  });

  test('servedAt ignores a query, a fragment and a trailing slash', () => {
    const site = builtSite(dist);
    for (const path of ['/docs/a/', '/docs/a?x=1', '/docs/a#h']) expect(servedAt(site, path)).toEqual({ kind: 'page', html: page });
    expect(servedAt(site, '/')).toEqual({ kind: 'page', html: landing });
    expect(servedAt(site, '/docs')).toEqual({ kind: 'redirect', to: '/docs/overview/introduction' });
  });

  test('servedAt reads a path with a dot as a file, and gives undefined when nothing is served', () => {
    const site = builtSite(dist);
    expect(servedAt(site, '/llms.txt')).toEqual({ kind: 'file' });
    expect(servedAt(site, '/nope.md')).toBeUndefined();
    expect(servedAt(site, '/nope')).toBeUndefined();
  });
});

test('builtSite throws on a folder with no build', () => {
  expect(() => builtSite(dist)).toThrow(`No build in ${dist}`);
});

test('builtSite throws on a meta refresh with no url', () => {
  write('index.html', '<!doctype html><meta http-equiv="refresh" content="0">');
  expect(() => builtSite(dist)).toThrow('No url in meta refresh');
});
