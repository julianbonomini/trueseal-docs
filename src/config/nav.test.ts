import { expect, test } from 'bun:test';
import { agentsVersionOf, markdownPathOf, placeOf, sidebarOf, sidebarPages, sidebarPaths, surfaceOf, surfaces } from './nav';

test('surfaceOf maps each path prefix to its surface and nothing else', () => {
  expect(surfaceOf('/docs/integrate/pairing')).toBe('docs');
  expect(surfaceOf('/agents')).toBe('agents');
  expect(surfaceOf('/agents/')).toBe('agents');
  expect(surfaceOf('/agents/protocol')).toBe('agents');
  for (const path of ['/', '/404', '/agentsx', '/docsy']) expect(surfaceOf(path)).toBeUndefined();
});

test('the switch lists the Human Docs then the Agent Docs', () => {
  expect(Object.keys(surfaces)).toEqual(['docs', 'agents']);
  expect(surfaces.agents.home).toBe('/agents/');
});

test('the Human Docs sidebar sections follow the Journey, none empty', () => {
  const sidebar = sidebarOf('/docs/overview/introduction')!;
  expect(sidebar.label).toBe('Docs');
  expect(sidebar.sections.map(section => section.title)).toEqual(['Overview', 'Integrate', 'Operate', 'Trust', 'Reference']);
  expect(sidebar.sections.filter(section => section.links.length === 0)).toEqual([]);
});

test('the Agent Docs sidebar is its own', () => {
  const sidebar = sidebarOf('/agents/protocol')!;
  expect(sidebar.label).toBe('Agent Docs');
  expect(sidebar.sections.map(section => section.title)).toEqual(['Start', 'Reference', 'Trust']);
  const links = sidebar.sections.flatMap(section => section.links);
  expect(links[0].href).toBe('/agents/');
  expect(links.filter(link => !link.href.startsWith('/agents'))).toEqual([]);
  expect(links.filter(link => link.current).map(link => link.href)).toEqual(['/agents/protocol']);
});

test('sidebarOf is undefined off both surfaces', () => {
  expect(sidebarOf('/')).toBeUndefined();
});

test('children show only while their page or one of them is current', () => {
  const syncLink = (pathname: string) =>
    sidebarOf(pathname)!.sections.flatMap(section => section.links).find(link => link.href === '/docs/reference/trueseal-sync')!;
  expect(syncLink('/docs/reference/trueseal-sync').children).toHaveLength(3);
  expect(syncLink('/docs/reference/envelopes-and-blobs').children).toHaveLength(3);
  expect(syncLink('/docs/overview/introduction').children).toEqual([]);
});

test('placeOf gives the first page its section and only a next link', () => {
  const place = placeOf('/docs/overview/introduction');
  expect(place?.section).toBe('Overview');
  expect(place?.prev).toBeUndefined();
  expect(place?.next?.href).toBe('/docs/overview/architecture');
});

test('previous and next cross section boundaries', () => {
  expect(placeOf('/docs/integrate/sdks')?.prev?.href).toBe('/docs/overview/license');
  expect(placeOf('/docs/integrate/delivery-guarantees')?.next?.href).toBe('/docs/operate/deploying');
});

test('children follow their parent in reading order, in its section', () => {
  expect(placeOf('/docs/reference/trueseal-sync')?.next?.href).toBe('/docs/reference/envelopes-and-blobs');
  expect(placeOf('/docs/reference/envelopes-and-blobs')?.section).toBe('Reference');
});

test('the last page of a surface has no next link, so links never cross surfaces', () => {
  expect(placeOf('/docs/reference/compatibility-table')?.next).toBeUndefined();
  expect(placeOf('/agents/protocol')?.next?.href).toBe('/agents/versions-and-relay-address');
  expect(placeOf('/agents/errors-and-events')?.next?.href).toBe('/agents/compatibility-table');
  expect(placeOf('/agents/reporting-a-vulnerability')?.next).toBeUndefined();
});

test('placeOf is undefined for a page outside the sidebar', () => {
  expect(placeOf('/docs/kitchen-sink')).toBeUndefined();
});

test('placeOf ignores a trailing slash', () => {
  expect(placeOf('/docs/integrate/pairing/')).toEqual(placeOf('/docs/integrate/pairing'));
  expect(placeOf('/agents')).toEqual(placeOf('/agents/'));
});

test('the Agent Docs index starts its sidebar', () => {
  const place = placeOf('/agents/');
  expect(place?.section).toBe('Start');
  expect(place?.prev).toBeUndefined();
  expect(place?.next?.href).toBe('/agents/what-trueseal-is');
  expect(placeOf('/agents/api')?.next?.href).toBe('/agents/protocol');
});

test('sidebarPaths lists a surface in reading order', () => {
  expect(sidebarPaths('agents')).toEqual(['/agents/', '/agents/what-trueseal-is', '/agents/api', '/agents/protocol', '/agents/versions-and-relay-address', '/agents/limits', '/agents/errors-and-events', '/agents/compatibility-table', '/agents/threat-model', '/agents/reporting-a-vulnerability']);
  expect(sidebarPaths('docs')[0]).toBe('/docs/overview/introduction');
});

test('sidebarPages gives each sidebar page its section, in sidebarPaths order', () => {
  const pages = sidebarPages('agents');
  expect(pages.map(page => page.link.href)).toEqual(sidebarPaths('agents'));
  expect([...new Set(pages.map(page => page.section))]).toEqual(['Start', 'Reference', 'Trust']);
});

test('markdownPathOf drops a trailing slash and adds .md', () => {
  expect(markdownPathOf('/docs/integrate/pairing')).toBe('/docs/integrate/pairing.md');
  expect(markdownPathOf('/docs/integrate/pairing/')).toBe('/docs/integrate/pairing.md');
  expect(markdownPathOf('/agents/')).toBe('/agents.md');
  expect(markdownPathOf('/agents')).toBe('/agents.md');
});

test('agentsVersionOf links a Human Docs page to its closest Agent Docs page', () => {
  expect(agentsVersionOf('/docs/overview/introduction')).toEqual({ title: 'What TrueSeal is', href: '/agents/what-trueseal-is' });
  expect(agentsVersionOf('/docs/reference/wire-format')?.href).toBe('/agents/protocol');
  expect(agentsVersionOf('/docs/integrate/pairing/')?.href).toBe('/agents/api');
  expect(agentsVersionOf('/docs/kitchen-sink')?.href).toBe('/agents/');
  expect(agentsVersionOf('/agents/api')).toBeUndefined();
  expect(agentsVersionOf('/')).toBeUndefined();
});

test('every Human Docs sidebar page links to an Agent Docs sidebar page', () => {
  const agents = sidebarPaths('agents');
  expect(sidebarPaths('docs').filter(path => !agents.includes(agentsVersionOf(path)!.href))).toEqual([]);
});
