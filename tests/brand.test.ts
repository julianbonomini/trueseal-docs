// Brand checks on the source under src/: brandbook section 8 (ADR-0004) as rules a test can read.
// "CSS text" is every .css file plus the <style> blocks of every .astro file.
import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dir, '..');
const srcDir = join(root, 'src');

interface SourceFile {
  path: string;
  text: string;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.(astro|css|ts|tsx|md|mdx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

const sources: SourceFile[] = walk(srcDir).map(path => ({
  path: relative(root, path),
  text: readFileSync(path, 'utf8'),
}));

const cssTexts: SourceFile[] = sources.flatMap(({ path, text }) => {
  if (path.endsWith('.css')) return [{ path, text }];
  if (!path.endsWith('.astro')) return [];
  const blocks = [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  return blocks.length > 0 ? [{ path, text: blocks.join('\n') }] : [];
});

const tokensPath = 'src/styles/tokens.css';
const wordmarkPath = 'src/components/layout/Wordmark.astro';

/** Every "path: match" of `pattern` in `files`, skipping the paths in `allowed`. */
function hits(files: SourceFile[], pattern: RegExp, allowed: string[] = []): string[] {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  return files
    .filter(file => !allowed.includes(file.path))
    .flatMap(file => [...file.text.matchAll(global)].map(m => `${file.path}: ${m[0]}`));
}

describe('Design tokens', () => {
  test('the token file holds only brandbook section 8 colours', () => {
    const tokens = readFileSync(join(root, tokensPath), 'utf8');
    const hexes = new Set([...tokens.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => m[0].slice(1).toUpperCase()));
    expect([...hexes].sort()).toEqual(
      ['F5F1E8', '1A1814', '5C574E', 'A3301E', '161412', 'EDE7DA', '9C958A', 'E4644B'].sort(),
    );
    const light = tokens.match(/\[data-theme='light'\]\s*\{([^}]*)\}/)?.[1] ?? '';
    const dark = tokens.match(/\[data-theme='dark'\]\s*\{([^}]*)\}/)?.[1] ?? '';
    for (const block of [light, dark]) {
      for (const name of ['--paper', '--ink', '--ink-muted', '--seal']) {
        expect(block).toContain(`${name}:`);
      }
    }
  });

  test('no file under src/ uses a removed token name', () => {
    const removed = [
      /--color-[a-z]/,
      /--text-(display|headline|body|mono)-/,
      /--layout-(gutter|margin)/,
      /material-symbols/i,
      /Material\+Symbols/,
      /tech-grid/,
    ];
    expect(removed.flatMap(pattern => hits(sources, pattern))).toEqual([]);
  });

  test('no colour literal sits outside the token file', () => {
    expect(hits(cssTexts, /#[0-9a-fA-F]{3,8}\b/, [tokensPath])).toEqual([]);
  });
});

describe('Shape and colour', () => {
  test('seal is never a fill, except the wordmark cursor', () => {
    const allowed = [wordmarkPath];
    expect(hits(cssTexts, /(background(-color)?|fill)\s*:[^;]*var\(--seal\)/, allowed)).toEqual([]);
  });

  test('no shadows, gradients or rounded corners', () => {
    expect(hits(cssTexts, /box-shadow|linear-gradient\(|radial-gradient\(/)).toEqual([]);
    expect(hits(cssTexts, /border-radius\s*:\s*(?!0\s*;)[^;]+/)).toEqual([]);
  });

  test('no label is set in uppercase', () => {
    expect(hits(cssTexts, /text-transform\s*:\s*uppercase/)).toEqual([]);
  });
});

describe('Motion', () => {
  test('the wordmark cursor is the only animation and stops under reduced motion', () => {
    expect(hits(sources, /@keyframes/)).toEqual([`${wordmarkPath}: @keyframes`]);
    expect(hits(sources, /animation\s*:/, [wordmarkPath])).toEqual([]);
    const wordmark = readFileSync(join(root, wordmarkPath), 'utf8');
    expect(wordmark).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.wordmark__cursor\s*\{[^}]*animation:\s*none/,
    );
  });
});

describe('Old design system', () => {
  test('the design-system markdown files are gone and nothing names them', () => {
    expect(existsSync(join(root, 'trueseal-light-design-system.md'))).toBe(false);
    expect(existsSync(join(root, 'trueseal-dark-design-system.md'))).toBe(false);
    const named = [...sources.map(f => f.path), 'README.md', 'CONTEXT.md', 'astro.config.mjs'].filter(path =>
      readFileSync(join(root, path), 'utf8').includes('design-system.md'),
    );
    expect(named).toEqual([]);
  });
});

describe('Section display', () => {
  test('the Landing section look is written once, in global.css', () => {
    const globalPath = 'src/styles/global.css';
    const values = [
      /clamp\(64px, 10vw, 104px\)/,
      /font-size:\s*var\(--text-section\)/,
      /max-width:\s*18ch/,
      /max-width:\s*60ch/,
    ];
    for (const pattern of values) {
      expect(hits(cssTexts, pattern, [globalPath])).toEqual([]);
    }
    const global = readFileSync(join(root, globalPath), 'utf8');
    expect(global).toContain('.section-display__heading');
    expect(global).toContain('.section-display__lede');
  });
});

describe('Stacked table', () => {
  test('the phone stacking is written once, in global.css', () => {
    const globalPath = 'src/styles/global.css';
    expect(hits(cssTexts, /thead\s*\{\s*display:\s*none/, [globalPath])).toEqual([]);
    expect(readFileSync(join(root, globalPath), 'utf8')).toContain('table.stacked-table');
  });
});
