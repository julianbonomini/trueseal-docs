export interface NavItem {
  title: string;
  slug: string;
  icon: string;
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
    title: 'Guides',
    icon: 'map',
    items: [
      { title: 'Build on trueseal-sync',   slug: 'guides/build-on-trueseal-sync', icon: 'build' },
    ],
  },
  {
    title: 'Components',
    icon: 'extension',
    items: [
      { title: 'trueseal-sync',     slug: 'components/trueseal-sync/overview',     icon: 'sync' },
      { title: 'trueseal-relay',    slug: 'components/trueseal-relay/overview',    icon: 'hub' },
      { title: 'trueseal-noise',    slug: 'components/trueseal-noise/overview',    icon: 'encrypted' },
      { title: 'trueseal-protocol', slug: 'components/trueseal-protocol/overview', icon: 'description' },
    ],
  },
  {
    title: 'Reference',
    icon: 'terminal',
    items: [
      { title: 'Wire Format', slug: 'components/trueseal-protocol/wire-format', icon: 'cable' },
      { title: 'Swift SDK',   slug: 'sdks/swift',                           icon: 'phone_iphone' },
    ],
  },
  {
    title: 'More',
    icon: 'more_horiz',
    items: [
      { title: 'SDKs',              slug: 'sdks',    icon: 'code' },
      { title: 'Future Directions', slug: 'future',  icon: 'explore' },
      { title: 'License',           slug: 'license', icon: 'gavel' },
    ],
  },
];
