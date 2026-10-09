// The Human Docs sidebar: its sections, their pages and the order they appear in.
// Every other place that needs a page's section or neighbours asks placeOf().

/** A sidebar link to `/docs/{slug}`. */
export interface NavItem {
  title: string;
  slug: string;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** A link to a docs page, as the sidebar and the previous/next links show it. */
export interface DocLink {
  title: string;
  href: string;
}

/** The sidebar sections in display order, which is the Journey followed by Reference. */
export const docsNav: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'What TrueSeal is',         slug: 'overview/what-trueseal-is' },
      { title: 'How it works',             slug: 'overview/how-it-works' },
      { title: 'Is it right for my app?',  slug: 'overview/is-it-right-for-my-app' },
      { title: 'Why TrueSeal exists',      slug: 'overview/why-trueseal-exists' },
      { title: 'Roadmap & Research',       slug: 'overview/roadmap' },
      { title: 'License',                  slug: 'overview/license' },
    ],
  },
  {
    title: 'Integrate',
    items: [
      { title: 'SDKs',                      slug: 'integrate/sdks' },
      { title: 'Integrating trueseal-sync', slug: 'integrate/integrating-trueseal-sync' },
      { title: 'Device Identity',           slug: 'integrate/device-identity' },
      { title: 'Pairing',                   slug: 'integrate/pairing' },
      { title: 'Sync Groups',               slug: 'integrate/sync-groups' },
      { title: 'Revocation',                slug: 'integrate/revocation' },
      { title: 'Delivery Guarantees',       slug: 'integrate/delivery-guarantees' },
    ],
  },
  {
    title: 'Operate',
    items: [
      { title: 'Deploying',      slug: 'operate/deploying' },
      { title: 'trueseal-relay', slug: 'operate/trueseal-relay' },
      { title: 'Inbox & TTL',    slug: 'operate/inbox-and-ttl' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { title: 'Zero Trust & Encryption', slug: 'trust/zero-trust-and-encryption' },
      { title: 'The Dumb Relay',          slug: 'trust/the-dumb-relay' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'trueseal-protocol', slug: 'reference/protocol' },
      { title: 'Wire Format',       slug: 'reference/wire-format' },
      { title: 'Sessions',          slug: 'reference/sessions' },
      {
        title: 'trueseal-sync',
        slug: 'reference/trueseal-sync',
        children: [
          { title: 'Envelopes & Blobs',      slug: 'reference/envelopes-and-blobs' },
          { title: 'Group Manifest',         slug: 'reference/group-manifest' },
          { title: 'Operation Log & Outbox', slug: 'reference/operation-log-and-outbox' },
        ],
      },
      {
        title: 'trueseal-noise',
        slug: 'reference/trueseal-noise',
        children: [
          { title: 'Noise Protocol Primer', slug: 'reference/noise-protocol-primer' },
          { title: 'XX Pattern',            slug: 'reference/xx-pattern' },
          { title: 'NK Pattern',            slug: 'reference/nk-pattern' },
        ],
      },
    ],
  },
];

/** The docs slug of a page's URL path, e.g. `/docs/integrate/pairing/` → `integrate/pairing`. */
export function slugOf(pathname: string): string {
  return pathname.replace(/^\/docs\//, '').replace(/\/$/, '');
}

// Every sidebar page in reading order: sections in order, each item followed by its children.
const readingOrder = docsNav.flatMap(section =>
  section.items
    .flatMap(item => [item, ...(item.children ?? [])])
    .map(page => ({ slug: page.slug, section: section.title, link: { title: page.title, href: `/docs/${page.slug}` } })),
);

/** The slug of every page in the sidebar, children included, in reading order. */
export const sidebarSlugs: string[] = readingOrder.map(page => page.slug);

/** Where a docs page sits in the sidebar: its section's title, and the pages before and after it
 *  in reading order (sections in order, each item followed by its children). prev is undefined on
 *  the first page and next on the last. Undefined when the page isn't in the sidebar. */
export function placeOf(slug: string): { section: string; prev?: DocLink; next?: DocLink } | undefined {
  const index = readingOrder.findIndex(page => page.slug === slug);
  if (index === -1) return undefined;
  return { section: readingOrder[index].section, prev: readingOrder[index - 1]?.link, next: readingOrder[index + 1]?.link };
}
