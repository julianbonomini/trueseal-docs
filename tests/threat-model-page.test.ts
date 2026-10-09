// The Threat Model on both surfaces renders every row of src/config/threatModel.ts, and it is the only
// threat model on the site. Reads dist/.
import { describe, expect, test } from 'bun:test';
import { docsNav } from '../src/config/nav.ts';
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
  expect(docsNav.find(section => section.title === 'Trust')!.items[0].slug).toBe('trust/threat-model');
});
