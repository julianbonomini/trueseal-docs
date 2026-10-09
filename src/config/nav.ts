// The sidebars of the Human Docs and the Agent Docs, and which path belongs to which surface.
// It owns the path layout (`/{surface}/{slug}`, the index page at `/{surface}/`), each page's Markdown version
// path, reading order, which children show, and which Agent Docs page each Human Docs page maps to.
// Every other place asks surfaceOf(), sidebarOf(), placeOf(), markdownPathOf() or agentsVersionOf().

/** A documentation surface: the Human Docs at /docs/... or the Agent Docs at /agents/... */
export type Surface = 'docs' | 'agents';

/** Each surface's header label and the page the Docs / Agent Docs switch opens. Key order is switch order. */
export const surfaces: Record<Surface, { label: string; home: string }> = {
  docs: { label: 'Docs', home: '/docs/overview/what-trueseal-is' },
  agents: { label: 'Agent Docs', home: '/agents/' },
};

/** A link to a docs page, as the sidebar and the previous/next links show it. */
export interface DocLink {
  title: string;
  href: string;
}

/** One sidebar link. `children` is filled only while this page or one of its children is current, otherwise empty. */
export interface SidebarLink {
  title: string;
  href: string;
  current: boolean;
  children: SidebarLink[];
}

// A page of a surface; slug '' is the surface's index page.
interface NavItem {
  title: string;
  slug: string;
  children?: NavItem[];
}

// A Human Docs page, with the slug of the Agent Docs page closest to it.
interface DocsNavItem extends NavItem {
  agents: string;
  children?: DocsNavItem[];
}

interface NavSection<Item extends NavItem = NavItem> {
  title: string;
  items: Item[];
}

// The Human Docs sections in display order: the Journey followed by Reference.
const docsNav: NavSection<DocsNavItem>[] = [
  {
    title: 'Overview',
    items: [
      { title: 'What TrueSeal is',        slug: 'overview/what-trueseal-is',        agents: 'what-trueseal-is' },
      { title: 'How it works',            slug: 'overview/how-it-works',            agents: 'protocol' },
      { title: 'Is it right for my app?', slug: 'overview/is-it-right-for-my-app',  agents: 'what-trueseal-is' },
      { title: 'Why TrueSeal exists',     slug: 'overview/why-trueseal-exists',     agents: 'what-trueseal-is' },
      { title: 'Developer preview',       slug: 'overview/developer-preview',       agents: 'developer-preview' },
      { title: 'Roadmap & Research',      slug: 'overview/roadmap',                 agents: 'what-trueseal-is' },
      { title: 'License',                 slug: 'overview/license',                 agents: 'what-trueseal-is' },
    ],
  },
  {
    title: 'Integrate',
    items: [
      { title: 'SDKs',                      slug: 'integrate/sdks',                      agents: 'api' },
      { title: 'Integrating trueseal-sync', slug: 'integrate/integrating-trueseal-sync', agents: 'api' },
      { title: 'Device Identity',           slug: 'integrate/device-identity',           agents: 'api' },
      { title: 'Pairing',                   slug: 'integrate/pairing',                   agents: 'pairing' },
      { title: 'Membership',                slug: 'integrate/membership',                agents: 'membership' },
      { title: 'Destroy Group',             slug: 'integrate/destroy-group',             agents: 'destroy-group' },
      { title: 'Sending and receiving',     slug: 'integrate/sending-and-receiving',     agents: 'sending-and-receiving' },
      { title: 'Delivery issues',           slug: 'integrate/delivery-issues',           agents: 'delivery-issues' },
    ],
  },
  {
    title: 'Operate',
    items: [
      { title: 'Running a relay',           slug: 'operate/running-a-relay',           agents: 'running-a-relay' },
      { title: 'Relay Address and keypair', slug: 'operate/relay-address-and-keypair', agents: 'relay-address-and-keypair' },
      { title: 'Limits and quotas',         slug: 'operate/limits-and-quotas',         agents: 'relay-limits-and-quotas' },
      { title: 'Backups',                   slug: 'operate/backups',                   agents: 'relay-backups' },
      { title: 'Upgrading',                 slug: 'operate/upgrades',                  agents: 'upgrades' },
      { title: 'Upgrade Notes',             slug: 'operate/upgrade-notes',             agents: 'upgrade-notes' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { title: 'Threat Model',              slug: 'trust/threat-model',              agents: 'threat-model' },
      { title: 'Encryption',                slug: 'trust/encryption',                agents: 'what-trueseal-is' },
      { title: 'The Dumb Relay',            slug: 'trust/the-dumb-relay',            agents: 'what-trueseal-is' },
      { title: 'Reporting a vulnerability', slug: 'trust/reporting-a-vulnerability', agents: 'reporting-a-vulnerability' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'Protocol',    slug: 'reference/protocol',    agents: 'protocol' },
      { title: 'Wire Format', slug: 'reference/wire-format', agents: 'protocol' },
      {
        title: 'trueseal-sync',
        slug: 'reference/trueseal-sync',
        agents: 'api',
        children: [
          { title: 'Envelopes and Blobs', slug: 'reference/envelopes-and-blobs', agents: 'protocol' },
          { title: 'Group Manifest',      slug: 'reference/group-manifest',      agents: 'protocol' },
          { title: 'Session State',       slug: 'reference/session-state',       agents: 'upgrades' },
        ],
      },
      {
        title: 'trueseal-noise',
        slug: 'reference/trueseal-noise',
        agents: 'protocol',
        children: [
          { title: 'Noise Protocol Primer', slug: 'reference/noise-protocol-primer', agents: 'protocol' },
          { title: 'XX Pattern',            slug: 'reference/xx-pattern',            agents: 'protocol' },
          { title: 'NK Pattern',            slug: 'reference/nk-pattern',            agents: 'protocol' },
        ],
      },
      { title: 'Compatibility Table', slug: 'reference/compatibility-table', agents: 'compatibility-table' },
    ],
  },
];

// The Agent Docs sections.
const agentsNav: NavSection[] = [
  {
    title: 'Start',
    items: [
      { title: 'Agent Snippet',     slug: '' },
      { title: 'What TrueSeal is',  slug: 'what-trueseal-is' },
      { title: 'Developer preview', slug: 'developer-preview' },
    ],
  },
  {
    title: 'Integrate',
    items: [
      { title: 'Pairing',               slug: 'pairing' },
      { title: 'Membership',            slug: 'membership' },
      { title: 'Destroy Group',         slug: 'destroy-group' },
      { title: 'Sending and receiving', slug: 'sending-and-receiving' },
      { title: 'Delivery issues',       slug: 'delivery-issues' },
    ],
  },
  {
    title: 'Operate',
    items: [
      { title: 'Running a relay',           slug: 'running-a-relay' },
      { title: 'Relay Address and keypair', slug: 'relay-address-and-keypair' },
      { title: 'Relay limits and quotas',   slug: 'relay-limits-and-quotas' },
      { title: 'Relay backups',             slug: 'relay-backups' },
      { title: 'Upgrades',                  slug: 'upgrades' },
      { title: 'Upgrade Notes',             slug: 'upgrade-notes' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'SDK API',                    slug: 'api' },
      { title: 'Protocol and wire format',   slug: 'protocol' },
      { title: 'Versions and Relay Address', slug: 'versions-and-relay-address' },
      { title: 'Limits',                     slug: 'limits' },
      { title: 'Errors and events',          slug: 'errors-and-events' },
      { title: 'Compatibility Table',        slug: 'compatibility-table' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { title: 'Threat Model',              slug: 'threat-model' },
      { title: 'Reporting a vulnerability', slug: 'reporting-a-vulnerability' },
    ],
  },
];

const navs: Record<Surface, NavSection[]> = { docs: docsNav, agents: agentsNav };

/** The surface a site path belongs to: `/docs` or `/docs/...` → 'docs', `/agents` or `/agents/...` → 'agents'.
 *  Undefined for every other path (the Landing, the 404 page). */
export function surfaceOf(pathname: string): Surface | undefined {
  return (Object.keys(surfaces) as Surface[]).find(surface => pathname === `/${surface}` || pathname.startsWith(`/${surface}/`));
}

function hrefOf(surface: Surface, slug: string): string {
  return slug ? `/${surface}/${slug}` : `/${surface}/`;
}

// Paths compare with any trailing slash removed, so `/agents/` and `/agents` are the same page.
function samePath(a: string, b: string): boolean {
  return a.replace(/\/$/, '') === b.replace(/\/$/, '');
}

/** The sidebar of the surface `pathname` is on: its nav label ('Docs' | 'Agent Docs') and sections in order.
 *  Undefined off both surfaces. */
export function sidebarOf(pathname: string): { label: string; sections: { title: string; links: SidebarLink[] }[] } | undefined {
  const surface = surfaceOf(pathname);
  if (!surface) return undefined;
  const linkOf = (item: NavItem): SidebarLink => {
    const href = hrefOf(surface, item.slug);
    const children = item.children ?? [];
    const expanded = [item, ...children].some(page => samePath(hrefOf(surface, page.slug), pathname));
    return { title: item.title, href, current: samePath(href, pathname), children: expanded ? children.map(linkOf) : [] };
  };
  return {
    label: surfaces[surface].label,
    sections: navs[surface].map(section => ({ title: section.title, links: section.items.map(linkOf) })),
  };
}

// A section's items in reading order: each item followed by its children.
function inReadingOrder<Item extends NavItem>(items: Item[]): Item[] {
  return items.flatMap(item => [item, ...((item.children ?? []) as Item[])]);
}

/** Every sidebar page of a surface in reading order (sections in order, each item followed by its children),
 *  with its section title. */
export function sidebarPages(surface: Surface): { section: string; link: DocLink }[] {
  return navs[surface].flatMap(section =>
    inReadingOrder(section.items)
      .map(page => ({ section: section.title, link: { title: page.title, href: hrefOf(surface, page.slug) } })),
  );
}

/** Where a page sits in its surface's sidebar: the section title and the pages before and after it in reading
 *  order (sections in order, each item followed by its children), never crossing surfaces. A trailing slash is
 *  ignored. Undefined when the page isn't in a sidebar. */
export function placeOf(pathname: string): { section: string; prev?: DocLink; next?: DocLink } | undefined {
  const surface = surfaceOf(pathname);
  if (!surface) return undefined;
  const order = sidebarPages(surface);
  const index = order.findIndex(page => samePath(page.link.href, pathname));
  if (index === -1) return undefined;
  return { section: order[index].section, prev: order[index - 1]?.link, next: order[index + 1]?.link };
}

/** The href of every sidebar page of a surface, children included, in reading order. */
export function sidebarPaths(surface: Surface): string[] {
  return sidebarPages(surface).map(page => page.link.href);
}

/** The site path of a page's Markdown version: the page path without its trailing slash, plus `.md`.
 *  `/docs/integrate/pairing` → `/docs/integrate/pairing.md`; `/agents/` and `/agents` → `/agents.md`. */
export function markdownPathOf(pathname: string): string {
  return `${pathname.replace(/\/$/, '')}.md`;
}

/** The Agent Docs page closest to a Human Docs page, as its sidebar link ({ title: 'SDK API', href: '/agents/api' }).
 *  A Human Docs page outside the sidebar gets the Agent Docs index. Undefined off the Human Docs. */
export function agentsVersionOf(pathname: string): DocLink | undefined {
  if (surfaceOf(pathname) !== 'docs') return undefined;
  const page = docsNav
    .flatMap(section => inReadingOrder(section.items))
    .find(item => samePath(hrefOf('docs', item.slug), pathname));
  const href = hrefOf('agents', page?.agents ?? '');
  return sidebarPages('agents').find(agentsPage => agentsPage.link.href === href)!.link;
}
