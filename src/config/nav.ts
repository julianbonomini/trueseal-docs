// The Human Docs sidebar: its sections, their pages and the order they appear in.
// Every other place that needs a page's section asks sectionOf().

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

/** The sidebar sections in display order. */
export const docsNav: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction',            slug: 'introduction' },
      { title: 'Principles & Boundaries', slug: 'principles-and-boundaries' },
      { title: 'Architecture',            slug: 'architecture' },
    ],
  },
  {
    title: 'Concepts',
    items: [
      { title: 'Device Identity',        slug: 'concepts/device-identity' },
      { title: 'Zero Trust & Encryption', slug: 'concepts/zero-trust-and-encryption' },
      { title: 'Sync Groups',            slug: 'concepts/sync-groups' },
      { title: 'Pairing',                slug: 'concepts/pairing' },
      { title: 'Revocation',             slug: 'concepts/revocation' },
      { title: 'The Dumb Relay',         slug: 'concepts/the-dumb-relay' },
    ],
  },
  {
    title: 'Protocol',
    items: [
      { title: 'Overview',    slug: 'protocol/overview' },
      { title: 'Wire Format', slug: 'protocol/wire-format' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'Integrating trueseal-sync',   slug: 'guides/integrating-trueseal-sync' },
    ],
  },
  {
    title: 'Components',
    items: [
      {
        title: 'trueseal-sync',
        slug: 'components/trueseal-sync/overview',
        children: [
          { title: 'Envelopes & Blobs',      slug: 'components/trueseal-sync/envelopes-and-blobs' },
          { title: 'Group Manifest',         slug: 'components/trueseal-sync/group-manifest' },
          { title: 'Operation Log & Outbox', slug: 'components/trueseal-sync/operation-log-and-outbox' },
          { title: 'Delivery Guarantees',    slug: 'components/trueseal-sync/delivery-guarantees' },
        ],
      },
      {
        title: 'trueseal-relay',
        slug: 'components/trueseal-relay/overview',
        children: [
          { title: 'Sessions',     slug: 'components/trueseal-relay/sessions' },
          { title: 'Inbox & TTL',  slug: 'components/trueseal-relay/inbox-and-ttl' },
          { title: 'Deploying',    slug: 'components/trueseal-relay/deploying' },
        ],
      },
      {
        title: 'trueseal-noise',
        slug: 'components/trueseal-noise/overview',
        children: [
          { title: 'Noise Protocol Primer', slug: 'components/trueseal-noise/noise-protocol-primer' },
          { title: 'XX Pattern',            slug: 'components/trueseal-noise/xx-pattern' },
          { title: 'NK Pattern',            slug: 'components/trueseal-noise/nk-pattern' },
        ],
      },
    ],
  },
  {
    title: 'SDKs',
    items: [
      { title: 'Overview', slug: 'sdks' },
    ],
  },
  {
    title: 'Project',
    items: [
      { title: 'Roadmap & Research', slug: 'future' },
      { title: 'License',           slug: 'license' },
    ],
  },
];

/** The docs slug of a page's URL path, e.g. `/docs/concepts/pairing/` → `concepts/pairing`. */
export function slugOf(pathname: string): string {
  return pathname.replace(/^\/docs\//, '').replace(/\/$/, '');
}

/** The sidebar section that lists `slug` (a docs slug without `/docs/`, e.g.
 *  `components/trueseal-sync/group-manifest`), whether as an item or a child,
 *  or undefined when the page isn't in the sidebar. */
export function sectionOf(slug: string): NavSection | undefined {
  return docsNav.find(section =>
    section.items.some(item => item.slug === slug || item.children?.some(child => child.slug === slug)),
  );
}
