# Astro over Starlight for the docs surface

Starlight is the obvious choice for a documentation site built on Astro — it provides nav, sidebar, search, and a complete doc theme out of the box. We rejected it because hush-docs requires a fully custom design matched 1:1 to a Figma design system. Overriding Starlight's layout, sidebar, header, footer, typography, and color system would mean fighting the framework rather than using it. Plain Astro with MDX and a hand-built component library gives us the same content authoring experience with no design constraints.

## Considered options

- **Starlight** — fast to a working site, opinionated design, difficult to fully override
- **Plain Astro + MDX** — chosen: no design opinions, full control, same static output
- **Next.js** — rejected: SPA hydration model ships more JS than needed for a primarily static site
