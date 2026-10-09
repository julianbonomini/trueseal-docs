<p align="center"><img src="brand/mascot/mascot-readme-header.png" alt="The TrueSeal seal mascot" width="640"></p>

# trueseal-docs

Documentation and landing site for the [TrueSeal](https://github.com/buenomini/TrueSeal) E2EE sync ecosystem. Built with Astro 5 + React islands, deployed on Cloudflare Pages.

---

## Setup

Requires [Bun](https://bun.sh).

```bash
cd docs
bun install
```

## Development

```bash
bun run dev
```

Opens at `http://localhost:4321`. Telemetry is disabled by default.

## Build

```bash
bun run build
```

Output goes to `dist/`. Static site, no adapter needed.

## Check

```bash
bun run check
```

Type-checks with `astro check`, builds, then runs `bun test`. Some tests read the built site in `dist/`, so run `bun run build` before running `bun test` on its own.

To screenshot built pages in both themes at desktop and phone width (run `bunx playwright install chromium` once first):

```bash
bun run screenshot /tmp/shots / /docs/overview/introduction
```

The mascot artwork is `brand/mascot/mascot.svg`. After changing it, run `bun run export-mascot` to regenerate the PNG exports beside it.

### Threat Model check

Every claim on the Threat Model names tests in the sibling repos, listed in `src/config/threatModel.ts`. This script checks each one exists at the commit pinned in `src/config/threatModelPins.json`:

```bash
GITHUB_TOKEN=$(gh auth token) bun scripts/check-threat-model.ts
```

It prints each missing test and exits 1 when any is missing, and exits 2 when it can't fetch a file. `.github/workflows/threat-model.yml` runs it on every pull request and push to `main`, with the `SIBLING_REPOS_TOKEN` secret: a token with read access to trueseal-sync, trueseal-noise, trueseal-relay and trueseal-e2e (trueseal-e2e is private). To bump a pin, put the repo's new full commit SHA in `threatModelPins.json`. The job lists tests the sibling repos haven't written yet, so it isn't a required check until the pins point at commits that have them.

---

## Deployment

This repo is connected to **Cloudflare Pages**. Any push to `main` triggers an automatic build and deploy. No manual steps required.

Build settings (already configured in Cloudflare):
- **Framework**: Astro
- **Build command**: `bun run build`
- **Output directory**: `dist`

---

## Content

Documentation lives in `src/content/docs/`. Files can be `.md` or `.mdx`.

Use `.mdx` when a page needs custom components (flow diagrams, phase breakdowns, code blocks with tabs, callouts, etc.). Plain prose pages can stay as `.md`.

### Kitchen Sink

`/docs/kitchen-sink` is the component reference page — every available MDX component rendered in one place. Check it before writing new doc pages to see what's available.

| Component | Usage |
|---|---|
| `<Callout variant="note|tip|warning|danger">` | Info boxes |
| `<CodeBlock lang="..." code={...} />` | Single-language code block with copy button |
| `<CodeBlock tabs={[{lang, code}]} />` | Multi-language tabbed code block |
| `<PhaseStack phases={[...]} />` | Numbered phase breakdown with optional code/checklist per phase |
| `<FlowDiagram left center right />` | 3-panel node flow diagram (device → relay → device); each step is `{ label }` |
| `<NextPage prev next />` | Previous/next links; `DocsLayout` adds them from the sidebar order, so pages don't |

---

## Project Structure

```
brand/
  mascot/         # Mascot SVG and its PNG exports
src/
  components/
    landing/      # Landing page sections
    docs/         # Sidebar
    layout/       # Navbar, Wordmark, Footer
    mdx/          # Reusable MDX components
    trust/        # The Threat Model parts both surfaces render
    ui/           # Buttons, theme toggle, mascot
  config/         # nav.ts (sidebar and reading order), redirects.ts (moved URLs), site.ts (version label), sharedFacts.ts (Shared Facts),
                  # threatModel.ts (Threat Model claims and limitations) and threatModelPins.json (the commits its tests are checked at)
  content/
    docs/         # All documentation markdown
    agents/       # Agent Docs pages
  layouts/        # BaseLayout, DocsLayout, LandingLayout
  pages/          # Astro routes
  styles/         # tokens.css, global.css
scripts/          # check-threat-model.ts and its core declared-tests.ts, screenshot.ts, export-mascot.ts
```

`tests/` holds the brand checks on the source, the banned-terms check on every file under `src/`, the Landing checks, the mascot and 404 checks, the redirect, link and docs-sidebar checks and the Shared Facts check on the built site, the Threat Model data checks, the check core's fixture tests and the Threat Model page checks, run by `bun test`.
