# Site structure and visual direction for the preview

Status: accepted (decided 2026-09-30 in [trueseal-roadmap#17](https://github.com/julianbonomini/trueseal-roadmap/issues/17); partly implemented: Design tokens, layouts, Navbar, the Landing sections and the Seal Demo (DOCS-1), the mascot and the 404 page (DOCS-10), the Journey sidebar with redirects for every moved URL (structural half of DOCS-2), the Agent Docs tree behind the Docs / Agent Docs switch, the Agent Docs limits, errors and events, and versions pages, the Agent Docs SDK API reference, each Human Docs page's link to its Agent Docs version and Copy as Markdown, `llms.txt`, `llms-full.txt` and per-page Markdown, and the Agent Snippet as the first Agent Docs page and in the Landing's Integrate section). The chosen design is variant E on the throwaway branch [`prototype/docs-site-shape`](https://github.com/julianbonomini/trueseal-docs/tree/prototype/docs-site-shape/src/components/prototype/home) (`?variant=E` for the Landing, `?variant=E-DOCS` for a Human Docs page). Variants A to D on the same branch record what was tried and rejected.

The site applies the [brandbook](../brand/90_SYNTHESIS.md). The brandbook decides the purpose, voice and visual identity. This ADR decides how the site is organised and how the Landing and the docs pages use that identity.

## Decision

### Look

- **Brandbook section 8 is the source of truth for design tokens.** Warm paper, ink and ink-muted, plus one wax-seal red in light and dark. It supersedes `trueseal-light-design-system.md`, `trueseal-dark-design-system.md` and the grey Material-style palette in `src/styles/tokens.css`. There is no Figma token export; tokens are written by hand in `tokens.css`.
- **Red means something every time.** It is used for the wordmark cursor, links, focus rings and the sealed state (for example, the mark on each sealed packet in the demo). It is never used for fills or decoration.
- **Square corners and hairline rules** everywhere. There are no cards, no shadows, and no decorative gradients.
- **Wordmark:** `trueseal` in the mono face, followed by a blinking block cursor in seal red. The cursor is the only idle animation, and it stops under `prefers-reduced-motion`.
- **Type:** Geist for prose and headings, and JetBrains Mono for the wordmark, code and small technical labels.

### Landing (`/`)

It is product-first and ordered as the Journey:

1. **Hero.** The brandbook's working hero ("Don't give up on privacy.") and a **Seal Demo**, an Island built on the flagship scenario, family location sharing.
   - Dragging Mum's dot encrypts each update in the browser.
   - The relay column shows only sealed packets, each with a size and a time.
   - The dot then moves on "Your phone".
   - It shows the product and the metadata limit at the same moment.
2. **Overview.** The moment a developer gives up on privacy, what stays the app's job, and a comparison with the real alternatives: your own backend, libsodium with your own pairing, and CloudKit encrypted fields.
3. **Integrate.** "About ten lines", with code tabs for Swift, Kotlin and TypeScript, and the Agent Snippet.
4. **Operate.** A relay in one container.
5. **Trust.** What the relay can and can't see, worded as in the threat model, linking to it.
6. **Close.** The signature line, what "free" means, and "Built by Julian Bonomini" linking to Why TrueSeal exists.

### Human Docs

- The layout is a persistent sidebar, an on-page contents list, and a version label in the header.
- The sidebar follows the **Journey**:
  - **Overview:** What TrueSeal is, How it works, Is it right for my app?, Why TrueSeal exists, Developer preview.
  - **Integrate:** one quickstart per SDK, then pairing, sending and receiving, membership, Destroy Group and delivery issues.
  - **Operate:** running a relay, the Relay Address and keypair, limits and quotas, backups and upgrades.
  - **Trust:** the threat model, known limitations, and reporting a vulnerability.
  - **Reference:** after the Journey, the protocol specification, wire format and test vectors, the Compatibility Table and the glossary.
- Pages start with a situation, then the mechanism, and say what stays the app's job. Every page links to its Agent Docs version and offers "Copy as Markdown".
- There is a single canonical Threat Model page under Trust (trueseal-roadmap#16).

### Agent Docs

- A separate top-level tree (`/agents/...`), selected by a Docs / Agent Docs switch in the header (ADR-0003).
- It contains the Agent Snippet, `llms.txt`, the full SDK API, errors and events, limits, the protocol and wire format, and the Compatibility Table.

## Considered options

- **Refined monochrome with the old tokens (A).** Kept its look but rejected on its own: there was nowhere for the eye to land, and nothing to capture attention.
- **Colourful product marketing (B).** Its product storytelling and comparison were kept. The rounded cards, gradients and logo were rejected, because a primitive shouldn't shout.
- **Docs as the home page (C).** Its docs layout and Journey were kept for the Human Docs. It was rejected as the Landing, which has to win buy-in before anyone reads docs.
- **Monochrome product page with a highlighter accent (D).** Close, but it had no brand identity yet. The brandbook replaced the yellow highlighter with the seal red and gave red the meaning "sealed".
- **Audience split or Diátaxis navigation.** Rejected in favour of the Journey. Each is sound, but the Journey matches the story told on the Landing, so the Landing works as the table of contents.

## Consequences

- `tokens.css`, the layouts, the Navbar and the landing components are rebuilt to this spec. The old design-system markdown files are deleted once the tokens move.
- The nav config (`src/config/nav.ts`) is restructured to the Journey. Existing content pages move or are rewritten under it, in the brand voice.
- The Seal Demo is the one new Island. The code tabs need client-side JS too, or a CSS-only approach.
- Copy on the Landing is limited by brandbook section 10. "About ten lines" and "one container" need evidence against the shipped SDKs and the self-hosting guide, and the comparison-table cells for the alternatives need checking before launch.
- The seal mascot is not part of the Landing hero. It is drawn in `brand/mascot/mascot.svg` and appears where the brandbook allows (the 404 page today).
