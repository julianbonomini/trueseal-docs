# React islands over a full SPA architecture

trueseal-docs is primarily static content — the docs and landing copy do not change at runtime. Shipping a full React SPA (via Next.js or Remix) would hydrate every page on load, sending JS the browser doesn't need. Astro's island architecture ships JS only to components that require interactivity (animated hero, theme toggle, search). The rest of the site — all doc pages, layouts, nav structure — is zero-JS HTML. This matches the actual interactivity budget of the site and keeps page weight minimal without sacrificing the ability to add rich interactive sections on the landing page.

## Considered options

- **Next.js full SPA** — rejected: full hydration cost for a mostly-static site
- **Pure Astro (no React)** — rejected: landing page animations and interactive elements need a component model; vanilla JS doesn't scale for this
- **Astro + React islands** — chosen: zero JS for static content, React only where interactivity is real
