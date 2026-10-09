// Shared Facts on the built site and in source: no page types a value by hand, both surfaces show the
// same value, and a value changed in the data file changes both, Markdown versions included.
// Reads dist/, so run `bun run build` first.
import { describe, expect, test } from 'bun:test';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { factText } from '../src/facts/facts.ts';
import { sharedFacts } from '../src/facts/shared-facts.ts';
import { contentLines } from './content.ts';
import { pageHtml, pagePaths } from './dist.ts';
import { prose, text } from './html.ts';
import { typedDuration, typedFacts } from './typed-facts.ts';

const repo = join(import.meta.dir, '..');

function typedFactsIn(collection: 'docs' | 'agents', patterns: RegExp[]): string[] {
  return contentLines(collection).flatMap(({ where, line }) =>
    patterns.flatMap(pattern => {
      const match = line.match(pattern);
      return match ? [`${where}: ${match[0]}`] : [];
    }),
  );
}

const valueTexts = (facts: { id: string; value?: unknown }[]) => facts.filter(fact => fact.value).map(fact => factText(fact.id).text);

describe('Shared Facts', () => {
  test('no content source types a Shared Fact by hand', () => {
    expect([...typedFactsIn('docs', typedFacts), ...typedFactsIn('agents', [...typedFacts, typedDuration])]).toEqual([]);
  });

  test('the Protocol Size Limit reads the same on both surfaces', () => {
    const limit = factText('protocolSizeLimit').text;
    for (const path of ['/docs/reference/wire-format', '/agents/limits', '/agents/protocol']) {
      expect({ path, found: prose(pageHtml(path)).includes(limit) }).toEqual({ path, found: true });
    }
  });

  test('no built Human Docs or Agent Docs page says 1 MiB or 1,048,576', () => {
    const pages = pagePaths().filter(path => path.startsWith('/docs') || path.startsWith('/agents'));
    expect(pages.filter(path => /1 MiB|1,048,576/.test(text(pageHtml(path))))).toEqual([]);
  });

  test('every case and value set is on the errors and events page', () => {
    const page = text(pageHtml('/agents/errors-and-events'));
    const names = [
      ...[...sharedFacts.errors, ...sharedFacts.events, ...sharedFacts.deliveryIssues].map(c => c.id),
      ...sharedFacts.valueSets.flatMap(set => set.values),
    ];
    expect(names.filter(name => !page.includes(name))).toEqual([]);
  });

  test('every limit is on the limits page, and every version and Relay Address value on its page', () => {
    const limits = text(pageHtml('/agents/limits'));
    expect(valueTexts([...sharedFacts.clientLimits, ...sharedFacts.relayLimits]).filter(value => !limits.includes(value))).toEqual([]);
    const versions = text(pageHtml('/agents/versions-and-relay-address'));
    expect(valueTexts([...sharedFacts.versions, ...sharedFacts.relayAddress]).filter(value => !versions.includes(value))).toEqual([]);
  });

  test('a Shared Fact changed in the data file changes both surfaces', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'trueseal-facts-'));
    try {
      for (const entry of ['src', 'public', 'brand', 'astro.config.mjs', 'tsconfig.json', 'package.json']) {
        cpSync(join(repo, entry), join(tmp, entry), { recursive: true });
      }
      symlinkSync(join(repo, 'node_modules'), join(tmp, 'node_modules'));
      const data = join(tmp, 'src', 'facts', 'shared-facts.ts');
      const original = "value: { kind: 'bytes', value: 61440 }";
      const source = readFileSync(data, 'utf8');
      expect(source.split(original).length - 1).toBe(1);
      writeFileSync(data, source.replace(original, "value: { kind: 'bytes', value: 51200 }"));

      const build = Bun.spawnSync([join(repo, 'node_modules', '.bin', 'astro'), 'build'], {
        cwd: tmp,
        env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      });
      expect({ exitCode: build.exitCode, stderr: build.exitCode === 0 ? '' : build.stderr.toString() }).toEqual({ exitCode: 0, stderr: '' });

      for (const page of ['docs/reference/wire-format', 'agents/limits']) {
        const built = text(readFileSync(join(tmp, 'dist', page, 'index.html'), 'utf8'));
        expect({ page, changed: built.includes('51,200 bytes (50 KiB)'), old: built.includes('61,440') }).toEqual({ page, changed: true, old: false });
      }
      for (const file of ['docs/reference/wire-format.md', 'agents/limits.md']) {
        const markdown = readFileSync(join(tmp, 'dist', file), 'utf8');
        expect({ file, changed: markdown.includes('51,200 bytes (50 KiB)'), old: markdown.includes('61,440') }).toEqual({ file, changed: true, old: false });
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, 120_000);
});
