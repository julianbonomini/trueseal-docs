// Holds every file under src/ to the banned terms in banned-terms.ts, and proves each term fires.
import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { bannedTerms, findBannedTerms } from './banned-terms.ts';

const root = join(import.meta.dir, '..');

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const fixtures: Record<string, string> = {
  'zero-trust': 'A zero-trust relay.',
  'zero trust': 'Zero trust as a structural fact.',
  'zero-knowledge': 'The relay stays zero-knowledge.',
  'no communication graph': 'No accounts, no communication graph the server can piece together.',
  'structurally unknowable': 'Who sent it is structurally unknowable.',
  'cryptographic guarantee': 'That is the price of a cryptographic guarantee.',
  "can't see your IP": "The relay can't see your IP address.",
  'Production-ready': '| **Swift** | Production-ready |',
  'trueseal-clip': 'It is what trueseal-clip ships on.',
  '1 MiB': 'The protocol caps envelope size at 1 MiB.',
  '1048576': '`1048576` bytes',
  'trueseal-relay:latest': '    image: trueseal-relay:latest',
};

describe('banned terms', () => {
  test('every term fires on its own fixture, and only that term', () => {
    expect(Object.keys(fixtures).sort()).toEqual(bannedTerms.map(t => t.term).sort());
    for (const { term } of bannedTerms) {
      expect(findBannedTerms(fixtures[term])).toEqual([{ term, line: 1 }]);
    }
  });

  test('near misses do not fire', () => {
    for (const text of [
      'Bytes per Inbox: 256 MiB',
      '21 MiB',
      'zero trusted parties',
      'ghcr.io/julianbonomini/trueseal-relay:0.2.0',
      "the relay can't read or forge messages",
    ]) {
      expect(findBannedTerms(text)).toEqual([]);
    }
  });

  test('reports the line a term starts on, and matches across a line break', () => {
    expect(findBannedTerms('ok\nzero-knowledge')).toEqual([{ term: 'zero-knowledge', line: 2 }]);
    expect(findBannedTerms('is zero\ntrust')).toEqual([{ term: 'zero trust', line: 1 }]);
  });

  test('no file under src/ uses a banned term, in its path or its text', () => {
    const instead = new Map(bannedTerms.map(t => [t.term, t.instead]));
    const found = walk(join(root, 'src')).flatMap(file => {
      const path = relative(root, file);
      // redirects.ts keys are old URLs that must keep redirecting; redirects.test.ts holds its targets to built pages.
      const texts = path === 'src/config/redirects.ts' ? [path] : [path, readFileSync(file, 'utf8')];
      return texts.flatMap(text =>
        findBannedTerms(text).map(({ term, line }) => `${path}:${line}: ${term} → ${instead.get(term)}`),
      );
    });
    expect(found).toEqual([]);
  });
});
