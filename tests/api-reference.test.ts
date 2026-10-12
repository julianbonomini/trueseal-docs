// The SDK API reference on the built site and in source: every entry and case has its anchor, cases show
// their spelling and what to do, and no page lists an API name by hand. Reads dist/, so run `bun run build` first.
import { describe, expect, test } from 'bun:test';
import { apiNames, apiSection, caseRows, type ApiSection } from '../src/api/api.ts';
import { transitionRows } from '../src/facts/facts.ts';
import { contentLines } from './content.ts';
import { pageHtml } from './dist.ts';
import { prose, text } from './html.ts';

const apiSections: ApiSection[] = ['open', 'state', 'receive', 'send', 'pairing', 'membership', 'subscribe', 'info'];
const caseSections: ApiSection[] = ['errors', 'events', 'deliveryIssues'];
// Tags read as spaces in text(), so compare without whitespace.
const squash = (s: string) => s.replace(/\s+/g, '');
const partsText = (parts: { text: string }[]) => parts.map(part => part.text).join('');

// Pages whose tables still name API entries by hand: state tables, per-case tables and per-topic API tables that
// the preview-pages Goal wrote before this rule existed. The api-tables Goal reworks them to render from the API
// reference and Shared Facts; remove each page then.
const pagesWithHandListedTables = new Set([
  'src/content/agents/relay-limits-and-quotas.mdx',
  'src/content/agents/sending-and-receiving.mdx',
  'src/content/agents/upgrade-notes.mdx',
  'src/content/docs/operate/limits-and-quotas.mdx',
  'src/content/docs/reference/envelopes-and-blobs.mdx',
  'src/content/docs/reference/group-manifest.mdx',
  'src/content/docs/reference/session-state.mdx',
  'src/content/docs/reference/wire-format.mdx',
]);

// What each page lacks, as `path: text`: a stacked table with class `tableClass`, or any expected text.
function missingOnPages(tableClass: string, expected: Record<string, string[]>): string[] {
  return Object.entries(expected).flatMap(([path, texts]) => {
    const html = pageHtml(path);
    const page = squash(text(html));
    const tableMissing = html.includes(`class="${tableClass} stacked-table"`) ? [] : [`${tableClass} table`];
    return [...tableMissing, ...texts.filter(expected => !page.includes(squash(expected)))].map(missing => `${path}: ${missing}`);
  });
}

function handListedNames(): string[] {
  const names = new Set(apiNames());
  return (['agents', 'docs'] as const).flatMap(collection =>
    contentLines(collection).flatMap(({ file, where, line }) => {
      if (pagesWithHandListedTables.has(file) || !/^(\||#{1,6} )/.test(line)) return [];
      // A span names an API entry when it is the name itself or the name called: `members()`, `groupFull{max}`.
      const hits = [...line.matchAll(/`([^`]+)`/g)].map(m => m[1].replace(/[({].*$/, '')).filter(span => names.has(span));
      return hits.map(name => `${where}: ${name}`);
    }),
  );
}

describe('SDK API reference', () => {
  test('every API entry has its anchor on /agents/api, and every case on /agents/errors-and-events', () => {
    const missing = (path: string, sections: ApiSection[]) => {
      const html = pageHtml(path);
      return sections.flatMap(section => apiSection(section)).flatMap(entry => [entry, ...entry.reasons])
        .filter(entry => !html.includes(`id="${entry.anchor}"`)).map(entry => `${path}#${entry.anchor}`);
    };
    expect([...missing('/agents/api', apiSections), ...missing('/agents/errors-and-events', caseSections)]).toEqual([]);
  });

  test('every case shows its platform spelling and what to do', () => {
    const page = squash(text(pageHtml('/agents/errors-and-events')));
    const missing = caseSections.flatMap(section => apiSection(section)).flatMap(entry => {
      const expected = [...entry.spellings.map(s => s.code), partsText(entry.action), ...entry.reasons.map(reason => partsText(reason.action))];
      return expected.filter(text => !page.includes(squash(text))).map(text => `${entry.anchor}: ${text}`);
    });
    expect(missing).toEqual([]);
  });

  test('the delivery issues pages and Integrating trueseal-sync render their cases from Shared Facts', () => {
    const sendErrors = caseRows('errors', ['payloadTooLarge', 'notMember', 'closed']);
    const deliveryPage = [...caseRows('deliveryIssues'), ...sendErrors];
    const pages = {
      '/agents/delivery-issues': deliveryPage,
      '/docs/integrate/delivery-issues': deliveryPage,
      '/docs/integrate/integrating-trueseal-sync': caseRows('errors', ['invalidRelayAddress', 'invalidNamespace', 'storage', 'storeTooNew']),
    };
    const expected = Object.fromEntries(Object.entries(pages).map(([path, rows]) => [path, rows.flatMap(row => [row.label, partsText(row.action)])]));
    expect(missingOnPages('case-table', expected)).toEqual([]);
  });

  test('the pairing, membership and Destroy Group pages render their state tables from Shared Facts', () => {
    const pages = {
      '/agents/pairing': 'join',
      '/docs/integrate/pairing': 'join',
      '/agents/membership': 'membership',
      '/agents/destroy-group': 'destroyGroup',
      '/docs/integrate/destroy-group': 'destroyGroup',
    };
    const expected = Object.fromEntries(Object.entries(pages).map(([path, machine]) => [path, transitionRows(machine).flatMap(row => [row.from, row.trigger, row.to].map(partsText))]));
    expect(missingOnPages('state-table', expected)).toEqual([]);
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
