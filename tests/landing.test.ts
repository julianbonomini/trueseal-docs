// Landing checks on the built site: reads dist/index.html, so run `bun run build` first.
// Covers what the HTML can prove: Journey order, code tabs without JS, the Seal Demo's static render and
// Island, brandbook wording and the mascot's absence.
import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatLocation, START_POINT } from '../src/components/landing/sealDemo.ts';
import { findBannedTerms } from './banned-terms.ts';
import { builtPages, dist } from './dist.ts';

const indexPath = join(dist, 'index.html');
if (!existsSync(indexPath)) throw new Error('dist/index.html is missing. Run bun run build first.');
const html = readFileSync(indexPath, 'utf8');

function decode(s: string): string {
  return s
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/** The visible text: no scripts, styles or tags, entities decoded. */
function text(source: string): string {
  return decode(source.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' '));
}

/** The visible text outside code blocks. */
function prose(source: string): string {
  return text(source.replace(/<pre[\s\S]*?<\/pre>/g, ' '));
}

const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');

describe('Landing', () => {
  test('the sections follow the Journey', () => {
    const ids = [...html.matchAll(/<section[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
    expect(ids).toEqual(['hero', 'overview', 'integrate', 'operate', 'trust', 'close']);
  });

  test('the code tabs are in the static HTML and need no JS', () => {
    const radios = [...html.matchAll(/<input[^>]*>/g)]
      .map(m => m[0])
      .filter(tag => tag.includes('type="radio"') && tag.includes('name="integrate-code"'));
    expect(radios).toHaveLength(3);
    expect(radios.filter(tag => /\bchecked\b/.test(tag))).toHaveLength(1);
    const labels = [...html.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/g)].map(m => text(m[1]).trim());
    expect(labels).toEqual(expect.arrayContaining(['Swift', 'Kotlin', 'TypeScript']));

    const panels = [...html.matchAll(/<pre[^>]*class="[^"]*code-tabs__panel[^"]*"[^>]*>([\s\S]*?)<\/pre>/g)];
    expect(panels).toHaveLength(3);
    expect(panels.filter(m => /\bhidden\b/.test(m[0].slice(0, m[0].indexOf('>'))))).toEqual([]);
    const code = panels.map(m => text(m[1]));
    expect(code[0]).toContain('import TruesealSync');
    expect(code[1]).toContain('import dev.trueseal.sync.TrueSeal');
    expect(code[2]).toContain("from '@trueseal/sync'");
    for (const panel of code) expect(panel).toContain('TrueSeal.open(');
  });

  test('the Trust section uses the brandbook IP sentence verbatim', () => {
    expect(text(html).replace(/\s+/g, ' ')).toContain(
      'The relay never logs, stores or uses your IP address. The server it runs on still sees the connection, as with any internet service. To hide your IP from the server too, use a VPN or Tor.',
    );
  });

  test('no banned term appears in the text, title or meta description', () => {
    const all = [text(html), title, description].join(' ');
    expect(findBannedTerms(all)).toEqual([]);
    // Brandbook section 5 words the site-wide list leaves out, because the Reference still uses "Anonymous Push Session".
    const lower = all.toLowerCase();
    expect(['anonymous', 'military-grade', 'fully private', 'completely private'].filter(term => lower.includes(term))).toEqual([]);
  });

  test('prose and title have no dashes', () => {
    for (const s of [prose(html), title]) {
      expect(s).not.toMatch(/—|–| - /);
    }
  });

  test('the mascot stays off the Landing', () => {
    expect(html).not.toMatch(/mascot/i);
  });

  test('the Seal Demo is readable with JS off', () => {
    const visible = text(html).replace(/\s+/g, ' ');
    for (const s of [
      "Mum's phone",
      'The relay',
      'Your phone',
      'Sealed packets appear here.',
      'Waiting for Mum',
      'Nothing in this demo leaves your browser.',
      formatLocation(START_POINT),
    ]) {
      expect(visible).toContain(s);
    }
  });

  test('the Seal Demo is the only Island besides the Theme toggle, hydrated when visible', () => {
    const islands = [...html.matchAll(/<astro-island[^>]*>/g)].map(m => m[0]);
    const names = islands.map(tag => {
      const url = tag.match(/component-url="([^"]*)"/)?.[1] ?? '';
      return url.slice(url.lastIndexOf('/') + 1).split('.')[0];
    });
    expect([...new Set(names)].sort()).toEqual(['SealDemo', 'ThemeToggle']);
    const sealDemo = islands.find(tag => /component-url="[^"]*\/SealDemo\./.test(tag)) ?? '';
    expect(sealDemo).toContain('client="visible"');
  });
});

describe('Seal Demo outside the Landing', () => {
  test('no other built page loads the Seal Demo', () => {
    const others = builtPages().filter(path => path !== indexPath);
    expect(others.filter(path => readFileSync(path, 'utf8').includes('SealDemo'))).toEqual([]);
  });

  test('the demo moves only when reduced motion is not requested', () => {
    const css = readFileSync(join(import.meta.dir, '..', 'src/components/landing/SealDemo.css'), 'utf8');
    const block = css.indexOf('@media (prefers-reduced-motion: no-preference)');
    expect(block).toBeGreaterThan(-1);
    expect(css.slice(0, block)).not.toMatch(/transition|@starting-style/);
  });
});
