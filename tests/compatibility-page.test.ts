// Both Compatibility Table pages print exactly what compatibilityTable() returns for compatibility.json,
// and neither MDX source types a version, so a data edit alone changes the pages. Reads dist/.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compatibilityColumns, compatibilityTable } from '../src/config/compatibility.ts';
import { decodeEntities, servedAt } from './dist.ts';

const surfaces = [
  { path: '/docs/reference/compatibility-table', source: 'src/content/docs/reference/compatibility-table.mdx' },
  { path: '/agents/compatibility-table', source: 'src/content/agents/compatibility-table.mdx' },
];

const cells = (html: string, tag: 'th' | 'td') =>
  [...html.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g'))].map(match => decodeEntities(match[1]).trim());

describe.each(surfaces)('$path', ({ path, source }) => {
  test('prints the columns and rows of compatibility.json', () => {
    const served = servedAt(path);
    if (served?.kind !== 'page') throw new Error(`${path} is not a built page`);
    const table = served.html.match(/<table class="compat[^"]*"[\s\S]*?<\/table>/)?.[0] ?? '';
    expect(cells(table, 'th')).toEqual([...compatibilityColumns]);
    const rows = [...table.matchAll(/<tr(?:\s[^>]*)?>([\s\S]*?)<\/tr>/g)].map(row => cells(row[1], 'td')).filter(row => row.length > 0);
    expect(rows).toEqual(compatibilityTable().rows);
  });

  test('the MDX source types no version', () => {
    const body = readFileSync(join(import.meta.dir, '..', source), 'utf8')
      .replace(/^---[\s\S]*?---/, '')
      .replace(/^import .*$/gm, '');
    expect(body.match(/\b\d+\.\d+\.\d+\b/g)).toBeNull();
  });
});
