// The Agent Snippet: what its text may state, and that the Agent Docs index and the Landing both render it.
// Reads dist/, so run `bun run build` first.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { agentSnippet } from '../src/agent-snippet/agent-snippet.ts';
import { apiNames } from '../src/api/api.ts';
import { sidebarPages, sidebarPaths } from '../src/config/nav.ts';
import { siteUrl } from '../src/config/site.ts';
import { sharedFacts } from '../src/facts/shared-facts.ts';
import { dist, pageHtml, servedAt } from './dist.ts';
import { decode, voiceProblems } from './html.ts';
import { typedFacts } from './typed-facts.ts';

const installCommands = [
  '/plugin marketplace add julianbonomini/trueseal-skills',
  '/plugin install trueseal@trueseal-skills',
  'npx skills add julianbonomini/trueseal-skills',
];

describe('Agent Snippet text', () => {
  test('states no Shared Fact or case', () => {
    expect(agentSnippet).not.toMatch(/\d/);
    expect(typedFacts.filter(pattern => pattern.test(agentSnippet))).toEqual([]);
    const ids = [...sharedFacts.errors, ...sharedFacts.events, ...sharedFacts.deliveryIssues].map(fact => fact.id);
    expect(ids.filter(id => new RegExp(`\\b${id}\\b`).test(agentSnippet))).toEqual([]);
  });

  test('names the llms.txt URL and both install routes', () => {
    expect(agentSnippet).toContain(`${siteUrl}/llms.txt`);
    expect(installCommands.filter(command => !agentSnippet.includes(command))).toEqual([]);
  });

  test('names the pitfalls', () => {
    expect(['onMessage', 'MessageId', 'accept(request)', 'join(token)'].filter(name => !agentSnippet.includes(name))).toEqual([]);
  });

  test('every code span is an API name or an install command', () => {
    const names = apiNames();
    const spans = [...agentSnippet.matchAll(/`([^`]+)`/g)].map(m => m[1]);
    expect(spans.filter(span => !installCommands.includes(span) && !names.includes(span.replace(/\(.*\)/, '')))).toEqual([]);
  });

  test('every site URL resolves to a built file', () => {
    const urls = [...agentSnippet.matchAll(new RegExp(`${siteUrl}\\S+`, 'g'))].map(m => m[0].replace(/[.,]$/, ''));
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.filter(url => servedAt(url.slice(siteUrl.length))?.kind !== 'file')).toEqual([]);
  });

  test('follows the brandbook voice', () => {
    expect(voiceProblems(agentSnippet)).toEqual([]);
  });
});

describe('Agent Snippet on the site', () => {
  test('the Landing renders the same text', () => {
    const html = pageHtml('/');
    const block = html.match(/<pre class="agent__snippet"[^>]*>([\s\S]*?)<\/pre>/)?.[1];
    expect(decode(block ?? '')).toBe(agentSnippet);
  });

  test('/agents/ holds it in a code block with a Copy button hydrated on load', () => {
    const html = pageHtml('/agents');
    const island = html.match(/<astro-island[^>]*component-url="[^"]*CodeBlock[^"]*"[^>]*>/)?.[0] ?? '';
    expect(island).toContain('client="load"');
    const code = html.match(/<pre class="code-block__pre[^"]*"><code>([\s\S]*?)<\/code><\/pre>/)?.[1];
    expect(decode(code ?? '')).toBe(agentSnippet);
    expect(html).toContain('<button class="code-block__copy"');
  });

  test('it comes first in the sidebar, llms.txt and the Markdown version', () => {
    expect(sidebarPaths('agents')[0]).toBe('/agents/');
    expect(sidebarPages('agents')[0].link.title).toBe('Agent Snippet');
    const llms = readFileSync(join(dist, 'llms.txt'), 'utf8');
    expect(llms.match(/^- \[[^\]]*\]\(([^)]+)\)/m)?.[1]).toBe(`${siteUrl}/agents.md`);
    const markdown = readFileSync(join(dist, 'agents.md'), 'utf8');
    expect(markdown).toContain('```markdown\n' + agentSnippet);
  });
});
