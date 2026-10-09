// The sidebars of the Human Docs and the Agent Docs, and which path belongs to which surface.
// It owns the path layout (`/{surface}/{slug}`, the index page at `/{surface}/`), each page's Markdown version
// path, reading order, which children show, and which Agent Docs page each Human Docs page maps to.
// Every other place asks surfaceOf(), sidebarOf(), placeOf(), markdownPathOf() or agentsVersionOf().

/** A documentation surface: the Human Docs at /docs/... or the Agent Docs at /agents/... */
export type Surface = 'docs' | 'agents';

/** Each surface's header label and the page the Docs / Agent Docs switch opens. Key order is switch order. */
export const surfaces: Record<Surface, { label: string; home: string }> = {
  docs: { label: 'Docs', home: '/docs/overview/introduction' },
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
      { title: 'Introduction',            slug: 'overview/introduction',              agents: '' },
      { title: 'Architecture',            slug: 'overview/architecture',              agents: 'protocol' },
      { title: 'Principles & Boundaries', slug: 'overview/principles-and-boundaries', agents: '' },
      { title: 'Roadmap & Research',      slug: 'overview/roadmap',                   agents: '' },
      { title: 'License',                 slug: 'overview/license',                   agents: '' },
    ],
  },
  {
    title: 'Integrate',
    items: [
      { title: 'SDKs',                      slug: 'integrate/sdks',                      agents: 'api' },
      { title: 'Integrating trueseal-sync', slug: 'integrate/integrating-trueseal-sync', agents: 'api' },
      { title: 'Device Identity',           slug: 'integrate/device-identity',           agents: 'api' },
      { title: 'Pairing',                   slug: 'integrate/pairing',                   agents: 'api' },
      { title: 'Sync Groups',               slug: 'integrate/sync-groups',               agents: 'api' },
      { title: 'Revocation',                slug: 'integrate/revocation',                agents: 'api' },
      { title: 'Delivery Guarantees',       slug: 'integrate/delivery-guarantees',       agents: 'protocol' },
    ],
  },
  {
    title: 'Operate',
    items: [
      { title: 'Deploying',      slug: 'operate/deploying',      agents: 'versions-and-relay-address' },
      { title: 'trueseal-relay', slug: 'operate/trueseal-relay', agents: 'protocol' },
      { title: 'Inbox & TTL',    slug: 'operate/inbox-and-ttl',  agents: 'limits' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { title: 'Zero Trust & Encryption', slug: 'trust/zero-trust-and-encryption', agents: '' },
      { title: 'The Dumb Relay',          slug: 'trust/the-dumb-relay',            agents: '' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'trueseal-protocol', slug: 'reference/protocol',    agents: 'protocol' },
      { title: 'Wire Format',       slug: 'reference/wire-format', agents: 'protocol' },
      { title: 'Sessions',          slug: 'reference/sessions',    agents: 'protocol' },
      {
        title: 'trueseal-sync',
        slug: 'reference/trueseal-sync',
        agents: 'api',
        children: [
          { title: 'Envelopes & Blobs',      slug: 'reference/envelopes-and-blobs',      agents: 'protocol' },
          { title: 'Group Manifest',         slug: 'reference/group-manifest',           agents: 'protocol' },
          { title: 'Operation Log & Outbox', slug: 'reference/operation-log-and-outbox', agents: 'protocol' },
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
    ],
  },
];

// The Agent Docs sections. The Agent Snippet goes first in Start once it exists.
const agentsNav: NavSection[] = [
  { title: 'Start',     items: [{ title: 'What TrueSeal is', slug: '' }] },
  {
    title: 'Reference',
    items: [
      { title: 'SDK API',                    slug: 'api' },
      { title: 'Protocol and wire format',   slug: 'protocol' },
      { title: 'Versions and Relay Address', slug: 'versions-and-relay-address' },
      { title: 'Limits',                     slug: 'limits' },
      { title: 'Errors and events',          slug: 'errors-and-events' },
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
