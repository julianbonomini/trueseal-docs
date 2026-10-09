// The single list of URLs that moved or were removed, and where each one now lives.
// Every URL main has ever served must stay a built page or stay in this map: tests/legacy-urls.txt
// lists them and tests/redirects.test.ts holds the build to it.

/** Every URL that moved or was removed → its new home. Keys and values are root-relative paths with
 *  no trailing slash. Passed to Astro's `redirects`; a target is always a built page, never another key. */
export const redirects: Record<string, string> = {
  '/docs': '/docs/overview/what-trueseal-is',
  '/relay': '/docs/operate/deploying',
  '/showcase': '/',

  '/docs/introduction':              '/docs/overview/what-trueseal-is',
  '/docs/architecture':              '/docs/overview/how-it-works',
  '/docs/principles-and-boundaries': '/docs/overview/is-it-right-for-my-app',
  '/docs/future':                    '/docs/overview/roadmap',
  '/docs/license':                   '/docs/overview/license',

  '/docs/overview/introduction':              '/docs/overview/what-trueseal-is',
  '/docs/overview/architecture':              '/docs/overview/how-it-works',
  '/docs/overview/principles-and-boundaries': '/docs/overview/is-it-right-for-my-app',

  '/docs/sdks':                                         '/docs/integrate/sdks',
  '/docs/guides/integrating-trueseal-sync':             '/docs/integrate/integrating-trueseal-sync',
  '/docs/concepts/device-identity':                     '/docs/integrate/device-identity',
  '/docs/concepts/pairing':                             '/docs/integrate/pairing',
  '/docs/concepts/sync-groups':                         '/docs/integrate/sync-groups',
  '/docs/concepts/revocation':                          '/docs/integrate/revocation',
  '/docs/components/trueseal-sync/delivery-guarantees': '/docs/integrate/delivery-guarantees',

  '/docs/components/trueseal-relay/deploying':     '/docs/operate/deploying',
  '/docs/components/trueseal-relay/overview':      '/docs/operate/trueseal-relay',
  '/docs/components/trueseal-relay/inbox-and-ttl': '/docs/operate/inbox-and-ttl',

  '/docs/concepts/zero-trust-and-encryption': '/docs/trust/zero-trust-and-encryption',
  '/docs/concepts/the-dumb-relay':            '/docs/trust/the-dumb-relay',

  '/docs/protocol/overview':                                 '/docs/reference/protocol',
  '/docs/protocol/wire-format':                              '/docs/reference/wire-format',
  '/docs/components/trueseal-relay/sessions':                '/docs/reference/sessions',
  '/docs/components/trueseal-sync/overview':                 '/docs/reference/trueseal-sync',
  '/docs/components/trueseal-sync/envelopes-and-blobs':      '/docs/reference/envelopes-and-blobs',
  '/docs/components/trueseal-sync/group-manifest':           '/docs/reference/group-manifest',
  '/docs/components/trueseal-sync/operation-log-and-outbox': '/docs/reference/operation-log-and-outbox',
  '/docs/components/trueseal-noise/overview':                '/docs/reference/trueseal-noise',
  '/docs/components/trueseal-noise/noise-protocol-primer':   '/docs/reference/noise-protocol-primer',
  '/docs/components/trueseal-noise/xx-pattern':              '/docs/reference/xx-pattern',
  '/docs/components/trueseal-noise/nk-pattern':              '/docs/reference/nk-pattern',
};
