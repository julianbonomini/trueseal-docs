// The Threat Model on both surfaces renders every row of src/config/threatModel.ts, and it is the only
// threat model on the site: other pages link to its relay list instead of repeating it. Reads dist/.
import { describe, expect, test } from 'bun:test';
import { sidebarPages } from '../src/config/nav.ts';
import { claims, ipWording, limitations, standardWording, testRefs } from '../src/config/threatModel.ts';
import { decodeEntities, pagePaths, servedAt } from './dist.ts';

const surfaces = ['/docs/trust/threat-model', '/agents/threat-model'];

function text(path: string): string {
  const served = servedAt(path);
  if (served?.kind !== 'page') throw new Error(`${path} is not a built page`);
  // Test names carry <wbr> after each underscore so they wrap between words.
  return decodeEntities(served.html.replace(/<wbr>/g, ''));
}

describe.each(surfaces)('%s', path => {
  test('renders every claim and every test it names', () => {
    const page = text(path);
    expect(claims.map(claim => claim.claim).filter(claim => !page.includes(claim))).toEqual([]);
    expect(testRefs().map(ref => ref.name).filter(name => !page.includes(name))).toEqual([]);
  });

  test('renders every limitation and the standard and IP wording', () => {
    const page = text(path);
    expect(limitations.map(limitation => limitation.title).filter(title => !page.includes(title))).toEqual([]);
    expect(page).toContain(ipWording);
    expect(page).toContain(standardWording);
  });
});

test('the two Threat Model pages are the only threat model on the site', () => {
  const titled = pagePaths().filter(path => /<h1[^>]*>[^<]*threat model/i.test(text(path)));
  expect(titled.sort()).toEqual([...surfaces].sort());
});

test('the Threat Model is the first page under Trust', () => {
  expect(sidebarPages('docs').find(page => page.section === 'Trust')?.link.href).toBe('/docs/trust/threat-model');
});

test('Architecture and The Dumb Relay link to the relay list instead of repeating it', () => {
  for (const path of ['/docs/overview/architecture', '/docs/trust/the-dumb-relay']) {
    const page = text(path);
    expect({ path, links: page.includes('href="/docs/trust/threat-model#what-the-relay-sees"') }).toEqual({ path, links: true });
    expect({ path, repeats: page.includes('fans out to every group member') }).toEqual({ path, repeats: false });
  }
});
