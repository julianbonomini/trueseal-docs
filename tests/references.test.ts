// The reference check against the built site: the fixtures, the real content and the CLI. Reads dist/.
import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { agentSnippet } from '../src/agent-snippet/agent-snippet.ts';
import { findMissingReferences, formatMissing, knownReferences, markdownFiles, type MissingReference } from '../src/references/references.ts';
import { dist } from './dist.ts';

const root = join(import.meta.dir, '..');
const known = knownReferences(dist);
const fixtures = 'tests/fixtures/references';

// Today's API names on Human Docs pages written before ADR-0028; the preview-pages Goal rewrites them. Remove each entry then.
const pending = new Set([
  ...[
    'session.publish()', 'onMemberJoined', 'removeMember', 'onRemovedFromGroup', 'onGroupDestroyed', 'session.pairingToken()',
    'acceptRequest()', 'onMemberRequest', 'senderNoisePub', 'onMemberJoined(id, name)', 'onMemberLeft(id, name)',
  ].map(name => `src/content/docs/integrate/integrating-trueseal-sync.mdx: ${name}`),
  ...['removeMember()', 'onRemovedFromGroup()', 'onGroupDestroyed()'].map(name => `src/content/docs/integrate/revocation.mdx: ${name}`),
  'src/content/docs/integrate/delivery-guarantees.mdx: onMemberJoined',
  'src/content/docs/reference/trueseal-sync.mdx: onMemberJoined',
  'src/content/docs/reference/group-manifest.mdx: onRemovedFromGroup()',
]);

describe('the broken fixtures', () => {
  test.each([
    ['api-name', 'TrueSeal.opne', 'api'],
    ['error-case', 'groupFul{max}', 'error'],
    ['event-case', '/agents/errors-and-events#event-statuschangd', 'event'],
    ['limit', '/agents/limits#fact-maxgroupsze', 'fact'],
    ['page-link', '/agents/limitz', 'page'],
  ] as [string, string, MissingReference['kind']][])('%s is one miss naming its file, line and reference', (name, reference, kind) => {
    const file = `${fixtures}/broken/${name}.md`;
    const misses = findMissingReferences(markdownFiles(file), known);
    expect(misses).toEqual([{ file, line: 3, reference, kind }]);
    const line = formatMissing(misses[0]);
    for (const part of [file, ':3:', reference]) expect(line).toContain(part);
  });
});

test('the passing fixture has no misses', () => {
  expect(findMissingReferences(markdownFiles(`${fixtures}/passing`), known)).toEqual([]);
});

test('the Human Docs, the Agent Docs and the Agent Snippet name nothing missing beyond the pending list', () => {
  const files = [
    ...markdownFiles('src/content/docs'),
    ...markdownFiles('src/content/agents'),
    { path: 'src/agent-snippet/agent-snippet.ts (agentSnippet)', text: agentSnippet },
  ];
  const misses = findMissingReferences(files, known).map(miss => `${miss.file}: ${miss.reference}`);
  expect([...new Set(misses)].sort()).toEqual([...pending].sort());
});

describe('the CLI', () => {
  const run = (...args: string[]) => {
    const result = Bun.spawnSync(['bun', 'scripts/check-references.ts', ...args], { cwd: root });
    return { code: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
  };

  test('lists every miss in file order and exits 1', () => {
    const result = run(`${fixtures}/broken`);
    const expected = ['api-name', 'error-case', 'event-case', 'limit', 'page-link'].flatMap(name =>
      findMissingReferences(markdownFiles(`${fixtures}/broken/${name}.md`), known).map(formatMissing),
    );
    expect(result.code).toBe(1);
    expect(result.stdout.split('\n').slice(0, 5)).toEqual(expected);
  });

  test('exits 0 on a folder with no misses, with or without a matching --ref', () => {
    expect(run(`${fixtures}/passing`).code).toBe(0);
    expect(run('--ref', 'HEAD', `${fixtures}/passing`).code).toBe(0);
  });

  test('exits 2 on a ref the checkout is not at, and on no paths', () => {
    const wrongRef = run('--ref', 'no-such-ref-xyz', `${fixtures}/passing`);
    expect(wrongRef.code).toBe(2);
    expect(wrongRef.stderr).toContain('no-such-ref-xyz');
    const noPaths = run();
    expect(noPaths.code).toBe(2);
    expect(noPaths.stderr).toContain('usage:');
  });
});
