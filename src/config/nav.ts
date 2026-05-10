export interface NavItem {
  title: string;
  slug: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const docsNav: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', slug: 'introduction' },
      { title: 'Architecture', slug: 'architecture' },
      { title: 'Principles & Boundaries', slug: 'principles-and-boundaries' },
    ],
  },
  {
    title: 'Concepts',
    items: [
      { title: 'Device Identity', slug: 'concepts/device-identity' },
      { title: 'Zero Trust & Encryption', slug: 'concepts/zero-trust-and-encryption' },
      { title: 'Sync Groups', slug: 'concepts/sync-groups' },
      { title: 'Pairing', slug: 'concepts/pairing' },
      { title: 'Revocation', slug: 'concepts/revocation' },
      { title: 'The Dumb Relay', slug: 'concepts/the-dumb-relay' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'Getting Started', slug: 'guides/getting-started' },
      { title: 'Build on hush-sync', slug: 'guides/build-on-hush-sync' },
      { title: 'Self-host the Relay', slug: 'guides/self-host-relay' },
    ],
  },
  {
    title: 'Components',
    items: [
      { title: 'hush-sync', slug: 'components/hush-sync/overview' },
      { title: 'hush-relay', slug: 'components/hush-relay/overview' },
      { title: 'hush-noise', slug: 'components/hush-noise/overview' },
      { title: 'hush-protocol', slug: 'components/hush-protocol/overview' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'API', slug: 'reference/api' },
      { title: 'Threat Model', slug: 'reference/threat-model' },
      { title: 'Wire Format', slug: 'reference/wire-format' },
    ],
  },
  {
    title: 'More',
    items: [
      { title: 'SDKs', slug: 'sdks' },
      { title: 'Future Directions', slug: 'future' },
      { title: 'License', slug: 'license' },
    ],
  },
];
