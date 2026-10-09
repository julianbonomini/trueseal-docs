// The Markdown versions, llms.txt and llms-full.txt on the built site, and each Human Docs page's link to its
// Agent Docs version and Copy as Markdown. Reads dist/, so run `bun run build` first.
import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { agentsVersionOf, markdownPathOf, sidebarPages, sidebarPaths, surfaceOf } from '../src/config/nav.ts';
import { siteDescription, siteUrl } from '../src/config/site.ts';
import { factText } from '../src/facts/facts.ts';
import { sharedFacts } from '../src/facts/shared-facts.ts';
import { dist, pageHtml, pagePaths } from './dist.ts';
import { descriptionOf, text } from './html.ts';

const docsPages = pagePaths().filter(path => surfaceOf(path) !== undefined);
const markdownOf = (path: string) => readFileSync(join(dist, markdownPathOf(path)), 'utf8');
const llms = () => readFileSync(join(dist, 'llms.txt'), 'utf8');

function versionsBlock(html: string): string | undefined {
  return html.match(/<div class="docs__versions"[\s\S]*?<\/astro-island>\s*<\/div>/)?.[0];
}

describe('Markdown versions', () => {
  test('every Human Docs and Agent Docs page has a Markdown version starting with its h1', () => {
    const missing = docsPages.filter(path => !existsSync(join(dist, markdownPathOf(path))) || !markdownOf(path).startsWith('# '));
    expect(missing).toEqual([]);
  });

  test('no Markdown version holds an MDX component tag, an import line or an MDX comment', () => {
    for (const path of docsPages) {
      const prose = markdownOf(path).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
      const leftovers = prose.match(/<[A-Z][A-Za-z]*[\s/>]|^import |\{\/\*/gm) ?? [];
      expect({ path, leftovers }).toEqual({ path, leftovers: [] });
    }
  });

  test('Shared Facts appear as their values, and fact tables as GFM tables', () => {
    const limit = factText('protocolSizeLimit').text;
    expect(markdownOf('/agents/limits')).toContain(limit);
    expect(markdownOf('/docs/reference/wire-format')).toContain(limit);
    expect(markdownOf('/agents/limits')).toMatch(/^\| Fact +\| Value +\| Meaning +\| Source +\|$/m);
    const page = markdownOf('/agents/errors-and-events');
    const ids = [...sharedFacts.errors, ...sharedFacts.events, ...sharedFacts.deliveryIssues].map(c => c.id);
    expect(ids.filter(id => !page.includes(id))).toEqual([]);
  });

  test('components give their own Markdown: every CodeBlock tab and the FlowDiagram panels', () => {
    const kitchenSink = markdownOf('/docs/kitchen-sink');
    for (const fence of ['```rust', '```go', '```bash']) expect(kitchenSink).toContain(fence);
    expect(markdownOf('/docs/overview/architecture')).toContain('**SENDER** (DEVICE):');
  });
});

describe('llms.txt', () => {
  test('starts with the title and the summary', () => {
    expect(llms().startsWith(`# TrueSeal\n\n> ${siteDescription}\n`)).toBe(true);
  });

  test('has one section per Agent Docs sidebar section, in order', () => {
    const headings = [...llms().matchAll(/^## (.*)$/gm)].map(m => m[1]);
    expect(headings).toEqual([...new Set(sidebarPages('agents').map(page => page.section))]);
  });

  test('links every Agent Docs page in sidebar order, with its description, to a built Markdown version', () => {
    const links = [...llms().matchAll(/^- \[[^\]]+\]\(([^)]+)\): (.*)$/gm)].map(m => ({ url: m[1], description: m[2] }));
    expect(links.map(link => link.url)).toEqual(sidebarPaths('agents').map(path => siteUrl + markdownPathOf(path)));
    sidebarPaths('agents').forEach((path, i) => {
      expect({ path, description: links[i].description }).toEqual({ path, description: descriptionOf(pageHtml(path)) });
      expect(existsSync(join(dist, markdownPathOf(path)))).toBe(true);
    });
  });
});

test('llms-full.txt holds every Agent Docs page in sidebar order, each after its Source line', () => {
  const full = readFileSync(join(dist, 'llms-full.txt'), 'utf8');
  const positions = sidebarPaths('agents').map(path => full.indexOf(`Source: ${siteUrl}${markdownPathOf(path)}\n\n${markdownOf(path)}`));
  expect(positions.every(position => position > 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
});

describe('Agent Docs version and Copy as Markdown', () => {
  test('every Human Docs page links to its Agent Docs version and offers Copy as Markdown', () => {
    for (const path of docsPages.filter(path => surfaceOf(path) === 'docs')) {
      const html = pageHtml(path);
      const block = versionsBlock(html) ?? '';
      const found = {
        link: block.includes(`<a href="${agentsVersionOf(path)!.href}"`),
        button: /<button[^>]*>Copy as Markdown<\/button>/.test(block),
        markdownPath: block.includes(markdownPathOf(path)),
        ignored: /class="docs__meta"[^>]*data-pagefind-ignore|data-pagefind-ignore[^>]*class="docs__meta"/.test(html),
      };
      expect({ path, found }).toEqual({ path, found: { link: true, button: true, markdownPath: true, ignored: true } });
    }
  });

  test('the Agent Docs link names the Agent Docs page', () => {
    expect(text(versionsBlock(pageHtml('/docs/integrate/pairing'))!)).toContain('Agent Docs: SDK API');
  });

  test('no Agent Docs page shows them', () => {
    expect(docsPages.filter(path => surfaceOf(path) === 'agents' && pageHtml(path).includes('class="docs__versions"'))).toEqual([]);
  });
});
