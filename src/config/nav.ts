export interface NavItem {
  title: string;
  slug: string;
  icon: string;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

export const docsNav: NavSection[] = [
  {
    title: 'Getting Started',
    icon: 'info',
    items: [
      { title: 'Introduction',            slug: 'introduction',               icon: 'info' },
      { title: 'Principles & Boundaries', slug: 'principles-and-boundaries',   icon: 'balance' },
      { title: 'Architecture',            slug: 'architecture',               icon: 'account_tree' },
    ],
  },
  {
    title: 'Concepts',
    icon: 'lightbulb',
    items: [
      { title: 'Device Identity',        slug: 'concepts/device-identity',          icon: 'fingerprint' },
      { title: 'Zero Trust & Encryption',slug: 'concepts/zero-trust-and-encryption',icon: 'lock' },
      { title: 'Sync Groups',            slug: 'concepts/sync-groups',              icon: 'group' },
      { title: 'Pairing',                slug: 'concepts/pairing',                  icon: 'link' },
      { title: 'Revocation',             slug: 'concepts/revocation',               icon: 'remove_circle' },
      { title: 'The Dumb Relay',         slug: 'concepts/the-dumb-relay',           icon: 'hub' },
    ],
  },
  {
    title: 'Protocol',
    icon: 'description',
    items: [
      { title: 'Overview',    slug: 'protocol/overview',    icon: 'description' },
      { title: 'Wire Format', slug: 'protocol/wire-format', icon: 'cable' },
    ],
  },
  {
    title: 'Guides',
    icon: 'map',
    items: [
      { title: 'Integrating trueseal-sync',   slug: 'guides/integrating-trueseal-sync', icon: 'build' },
    ],
  },
  {
    title: 'Components',
    icon: 'extension',
    items: [
      {
        title: 'trueseal-sync',
        slug: 'components/trueseal-sync/overview',
        icon: 'sync',
        children: [
          { title: 'Envelopes & Blobs',      slug: 'components/trueseal-sync/envelopes-and-blobs',      icon: 'mail' },
          { title: 'Group Manifest',         slug: 'components/trueseal-sync/group-manifest',           icon: 'groups' },
          { title: 'Operation Log & Outbox', slug: 'components/trueseal-sync/operation-log-and-outbox', icon: 'history' },
          { title: 'Delivery Guarantees',    slug: 'components/trueseal-sync/delivery-guarantees',      icon: 'verified' },
        ],
      },
      {
        title: 'trueseal-relay',
        slug: 'components/trueseal-relay/overview',
        icon: 'hub',
        children: [
          { title: 'Sessions',     slug: 'components/trueseal-relay/sessions',     icon: 'cable' },
          { title: 'Inbox & TTL',  slug: 'components/trueseal-relay/inbox-and-ttl', icon: 'inbox' },
          { title: 'Deploying',    slug: 'components/trueseal-relay/deploying',     icon: 'rocket_launch' },
        ],
      },
      {
        title: 'trueseal-noise',
        slug: 'components/trueseal-noise/overview',
        icon: 'encrypted',
        children: [
          { title: 'Noise Protocol Primer', slug: 'components/trueseal-noise/noise-protocol-primer', icon: 'school' },
          { title: 'XX Pattern',            slug: 'components/trueseal-noise/xx-pattern',            icon: 'swap_horiz' },
          { title: 'NK Pattern',            slug: 'components/trueseal-noise/nk-pattern',            icon: 'visibility_off' },
        ],
      },
    ],
  },
  {
    title: 'SDKs',
    icon: 'code',
    items: [
      { title: 'Overview', slug: 'sdks', icon: 'code' },
    ],
  },
  {
    title: 'Project',
    icon: 'more_horiz',
    items: [
      { title: 'Roadmap & Research', slug: 'future',  icon: 'explore' },
      { title: 'License',           slug: 'license', icon: 'gavel' },
    ],
  },
];
