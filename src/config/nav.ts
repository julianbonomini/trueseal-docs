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
      { title: 'Build on hush-sync',   slug: 'guides/build-on-hush-sync', icon: 'build' },
    ],
  },
  {
    title: 'Components',
    icon: 'extension',
    items: [
      { title: 'hush-sync',     slug: 'components/hush-sync/overview',     icon: 'sync' },
      { title: 'hush-relay',    slug: 'components/hush-relay/overview',    icon: 'hub' },
      { title: 'hush-noise',    slug: 'components/hush-noise/overview',    icon: 'encrypted' },
      { title: 'hush-protocol', slug: 'components/hush-protocol/overview', icon: 'description' },
    ],
  },
  {
    title: 'Reference',
    icon: 'terminal',
    items: [
      { title: 'Wire Format', slug: 'components/hush-protocol/wire-format', icon: 'cable' },
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
