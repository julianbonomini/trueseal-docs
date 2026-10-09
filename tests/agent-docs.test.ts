// The Agent Docs on the built site: their pages and sidebar, the header switch on every
// page and brandbook voice. Reads dist/, so run `bun run build` first.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sidebarPaths } from '../src/config/nav.ts';
import { dist, pageHtml, pagePaths, servedAt } from './dist.ts';
import { descriptionOf, prose, text, titleOf, voiceProblems } from './html.ts';

function sidebarNav(html: string, label: string): string | undefined {
  return html.match(new RegExp(`<nav class="sidebar"[^>]*aria-label="${label}"[^>]*>[\\s\\S]*?</nav>`))?.[0];
}

describe('Agent Docs', () => {
  test('the Agent Docs pages are built and served as pages', () => {
    expect(['/agents', '/agents/what-trueseal-is', '/agents/api', '/agents/protocol', '/agents/versions-and-relay-address', '/agents/limits', '/agents/errors-and-events'].filter(path => servedAt(path)?.kind !== 'page')).toEqual([]);
  });

  test('every Agent Docs page shows the Agent Docs sidebar and never the Human Docs one', () => {
    for (const path of sidebarPaths('agents')) {
      const html = pageHtml(path);
      const nav = sidebarNav(html, 'Agent Docs');
      expect({ path, nav: nav !== undefined }).toEqual({ path, nav: true });
      const hrefs = [...nav!.matchAll(/href="([^"]*)"/g)].map(m => m[1]);
      expect(hrefs.filter(href => !href.startsWith('/agents'))).toEqual([]);
      expect(sidebarNav(html, 'Docs')).toBeUndefined();
    }
  });

  test('Agent Docs copy follows the brandbook voice', () => {
    for (const path of sidebarPaths('agents')) {
      const html = pageHtml(path);
      const problems = [prose(html), titleOf(html), descriptionOf(html)].flatMap(voiceProblems);
      expect({ path, problems }).toEqual({ path, problems: [] });
    }
  });
});

describe('Docs / Agent Docs switch', () => {
  const pages = [...pagePaths().map(path => ({ path, html: pageHtml(path) })), { path: '/404', html: readFileSync(join(dist, '404.html'), 'utf8') }];

  test('every page links both surfaces and marks only the one it is on', () => {
    for (const { path, html } of pages) {
      const nav = html.match(/<nav class="navbar__surfaces"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
      const links = [...nav.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/g)].map(m => ({
        href: m[1].match(/href="([^"]*)"/)?.[1],
        label: text(m[2]).trim(),
        current: /aria-current/.test(m[1]),
      }));
      expect({ path, links }).toEqual({
        path,
        links: [
          { href: '/docs/overview/introduction', label: 'Docs', current: path.startsWith('/docs') },
          { href: '/agents/', label: 'Agent Docs', current: path.startsWith('/agents') },
        ],
      });
    }
  });

  test('no page shows the old "soon" placeholder', () => {
    expect(pages.filter(page => page.html.includes('navbar__soon')).map(page => page.path)).toEqual([]);
  });
});
