// Old URLs keep working: every path main served before the variant-E Goal is still a built page or
// redirects to one, and Astro emitted every redirect in src/config/redirects.ts. Reads dist/.
import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { redirects } from '../src/config/redirects.ts';
import { servedAt } from './dist.ts';

const legacyUrls = readFileSync(join(import.meta.dir, 'legacy-urls.txt'), 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

function resolvesToPage(path: string): boolean {
  const served = servedAt(path);
  if (served?.kind === 'redirect') return servedAt(served.to)?.kind === 'page';
  return served?.kind === 'page';
}

test('every legacy URL is a built page or redirects to one', () => {
  expect(legacyUrls.length).toBeGreaterThan(0);
  expect(legacyUrls.filter(path => !resolvesToPage(path))).toEqual([]);
});

test('every redirect in the map is built with its target', () => {
  const wrong = Object.entries(redirects).filter(([from, to]) => {
    const served = servedAt(from);
    return served?.kind !== 'redirect' || served.to !== to;
  });
  expect(wrong).toEqual([]);
});

test('every redirect target is a built page, never another redirect', () => {
  expect(Object.values(redirects).filter(to => servedAt(to)?.kind !== 'page')).toEqual([]);
});
