import { describe, expect, test } from 'bun:test';
import { findMissingReferences, formatMissing, type KnownReferences } from './references.ts';

const known: KnownReferences = {
  pages: new Map([
    ['/agents/api', new Set(['api-send'])],
    ['/agents/limits', new Set(['fact-maxgroupsize'])],
    ['/', new Set<string>()],
  ]),
  files: new Set(['/llms.txt', '/agents/api.md']),
  names: new Set(['send', 'TrueSeal', 'TrueSeal.open', 'open', 'groupFull', 'onMessage', 'messageId', 'sendFailed']),
};

// The misses in a one-file document, as [reference, kind].
function misses(text: string): [string, string][] {
  return findMissingReferences([{ path: 'a.md', text }], known).map(miss => [miss.reference, miss.kind]);
}

describe('code spans', () => {
  test.each([
    ['`groupFull{max}`', '`groupFul{max}`', 'groupFul{max}', 'error'],
    ['`send()` and `sendFailed(messageId, reason)`', '`sendd()`', 'sendd()', 'api'],
    ['`TrueSeal.open`', '`TrueSeal.opne`', 'TrueSeal.opne', 'api'],
    ['`onMessage`', '`onMesage`', 'onMesage', 'api'],
  ])('%s passes and %s is a miss', (good, bad, reference, kind) => {
    expect(misses(good)).toEqual([]);
    expect(misses(bad)).toEqual([[reference, kind]]);
  });

  test('a call on an instance resolves by the name after the first dot', () => {
    expect(misses('`trueSeal.send()` and `session.open()`')).toEqual([]);
    expect(misses('`session.publish()`')).toEqual([['session.publish()', 'api']]);
  });

  test('spans not shaped like a TrueSeal API name are not references', () => {
    expect(misses('`Sync` `author_pub` `AGENTS.md` `relay.ttl` `TRUESEAL_RELAY_TTL` `unsupported min..max`')).toEqual([]);
  });
});

describe('links', () => {
  test.each([
    ['[x](/agents/nope)', '/agents/nope', 'page'],
    ['[x](/agents/api#api-sendd)', '/agents/api#api-sendd', 'api'],
    ['[x](/agents/api#error-x)', '/agents/api#error-x', 'error'],
    ['[x](/agents/api#event-x)', '/agents/api#event-x', 'event'],
    ['[x](/agents/api#issue-x)', '/agents/api#issue-x', 'event'],
    ['[x](/agents/api#fact-x)', '/agents/api#fact-x', 'fact'],
    ['[x](/agents/api#other)', '/agents/api#other', 'page'],
    ['Read https://trueseal.dev/agents/nope.md today.', 'https://trueseal.dev/agents/nope.md', 'page'],
    ['<a href="/agents/nope">x</a>', '/agents/nope', 'page'],
    ['[x](/agents/api#100%)', '/agents/api#100%', 'page'],
  ])('%s is a miss', (text, reference, kind) => {
    expect(misses(text)).toEqual([[reference, kind]]);
  });

  test('built pages, ids and files pass, with or without a trailing slash, query or origin', () => {
    const text = [
      '[a](/agents/api#api-send) [b](/agents/api/) [c](/agents/limits?x=1#fact-maxgroupsize) [d](/)',
      'See https://trueseal.dev/agents/api.md. and https://trueseal.dev/llms.txt',
      "<a href='/agents/api'>e</a> [f](https://trueseal.dev)",
    ].join('\n');
    expect(misses(text)).toEqual([]);
  });

  test('same-file fragments, external and relative links are skipped', () => {
    expect(misses('[x](#local) https://example.com/agents/nope [y](references/swift.md) [z](//cdn.example.com/a)')).toEqual([]);
  });
});

describe('what is not read', () => {
  test.each([
    ['frontmatter', '---\ntitle: `TrueSeal.opne`\n---\n'],
    ['an MDX comment', '{/* [x](/nope) */}'],
    ['an HTML comment', '<!-- [x](/nope)\n`sendd()` -->'],
    ['an import line', "import X from '/nope';"],
    ['an export line', 'export const x = `sendd()`;'],
    ['a fenced block', '```ts\nTrueSeal.opne(`sendd()`)\n```\n~~~\n[x](/nope)\n~~~'],
    ['a multi-line component tag', '<CodeBlock\n  code={`[x](/nope)\n`sendd()``}\n/>'],
  ])('%s', (_, text) => {
    expect(misses(text)).toEqual([]);
  });

  test('the children of a component are read', () => {
    expect(misses('<Callout>\nCall `sendd()`.\n</Callout>')).toEqual([['sendd()', 'api']]);
  });
});

describe('positions', () => {
  test('lines count from 1 and stay true after a multi-line comment, in file order then line then column', () => {
    const files = [
      { path: 'b.md', text: '{/* one\ntwo */}\n`sendd()` [x](/nope)' },
      { path: 'a.md', text: '`onMesage`' },
    ];
    expect(findMissingReferences(files, known).map(m => [m.file, m.line, m.reference])).toEqual([
      ['b.md', 3, 'sendd()'],
      ['b.md', 3, '/nope'],
      ['a.md', 1, 'onMesage'],
    ]);
  });

  test('every occurrence is reported', () => {
    expect(misses('`sendd()` `sendd()`')).toHaveLength(2);
  });
});

test('formatMissing names the file, line, kind and reference', () => {
  expect(formatMissing({ file: 'a.md', line: 3, reference: 'TrueSeal.opne', kind: 'api' })).toBe('a.md:3: unknown API name TrueSeal.opne');
});
