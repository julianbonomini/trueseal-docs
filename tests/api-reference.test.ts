// The SDK API reference on the built site and in source: every entry and case has its anchor, cases show
// their spelling and what to do, and no page lists an API name by hand. Reads dist/, so run `bun run build` first.
import { describe, expect, test } from 'bun:test';
import { apiNames, apiSection, type ApiSection } from '../src/api/api.ts';
import { contentLines } from './content.ts';
import { pageHtml } from './dist.ts';
import { prose, text } from './html.ts';

const apiSections: ApiSection[] = ['open', 'state', 'receive', 'send', 'pairing', 'membership', 'subscribe', 'info'];
const caseSections: ApiSection[] = ['errors', 'events', 'deliveryIssues'];

// Pages written before the API reference that name a today's-API or protocol field in a table. The preview-pages
// Goal rewrites them; remove each entry then.
const knownHits = new Set([
  'src/content/docs/integrate/integrating-trueseal-sync.mdx: members',
  'src/content/docs/reference/group-manifest.mdx: members',
]);

function handListedNames(): string[] {
  const names = new Set(apiNames());
  return (['agents', 'docs'] as const).flatMap(collection =>
    contentLines(collection).flatMap(({ file, where, line }) => {
      if (!/^(\||#{1,6} )/.test(line)) return [];
      // A span names an API entry when it is the name itself or the name called: `members()`, `groupFull{max}`.
      const hits = [...line.matchAll(/`([^`]+)`/g)].map(m => m[1].replace(/[({].*$/, '')).filter(span => names.has(span));
      return hits.filter(name => !knownHits.has(`${file}: ${name}`)).map(name => `${where}: ${name}`);
    }),
  );
}

describe('SDK API reference', () => {
  test('every API entry has its anchor on /agents/api, and every case on /agents/errors-and-events', () => {
    const missing = (path: string, sections: ApiSection[]) => {
      const html = pageHtml(path);
      return sections.flatMap(section => apiSection(section)).filter(entry => !html.includes(`id="${entry.anchor}"`)).map(entry => `${path}#${entry.anchor}`);
    };
    expect([...missing('/agents/api', apiSections), ...missing('/agents/errors-and-events', caseSections)]).toEqual([]);
  });

  test('every case shows its platform spelling and what to do', () => {
    // Tags read as spaces in text(), so compare without whitespace.
    const squash = (s: string) => s.replace(/\s+/g, '');
    const page = squash(text(pageHtml('/agents/errors-and-events')));
    const missing = caseSections.flatMap(section => apiSection(section)).flatMap(entry => {
      const action = entry.action.map(part => part.text).join('');
      return [...entry.spellings.map(s => s.code), action].filter(expected => !page.includes(squash(expected))).map(expected => `${entry.anchor}: ${expected}`);
    });
    expect(missing).toEqual([]);
  });

  test('/agents/api says what the API does not do', () => {
    const html = pageHtml('/agents/api');
    expect(html).toContain('id="what-the-api-does-not-do"');
    const section = prose(html.slice(html.indexOf('id="what-the-api-does-not-do"'))).toLowerCase();
    expect([section.includes('conflict'), section.includes('versioning')]).toEqual([true, true]);
  });

  test('no page lists an API name by hand in a table row or heading', () => {
    expect(handListedNames()).toEqual([]);
  });
});
