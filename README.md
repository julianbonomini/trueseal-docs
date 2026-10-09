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

CI runs the same `bun run check` on every pull request and every push to `main` (`.github/workflows/check.yml`).

### Reference check

`bun test` fails when a Human Docs page, an Agent Docs page or the Agent Snippet names a page, API name, error or event case, or Shared Fact that doesn't exist. Each miss prints as `<file>:<line>: unknown <kind> <reference>`. The check reads the source Markdown/MDX and resolves against the built site in `dist/`, `apiNames()` and Shared Facts. `src/references/references.ts` holds the rules.

A reference is either of these:

- a link to a site path: a Markdown link or `href` starting with `/`, or a `https://trueseal.dev/…` URL. The page or file must be built, and a `#fragment` must be an id on that page.
- a code span shaped like a TrueSeal API name: `TrueSeal.open`, `send()`, `trueSeal.send()`, `groupFull{max}`, `onMessage`. Bare PascalCase words such as `Sync` aren't checked.

Frontmatter, comments, `import` and `export` lines, fenced code, MDX component tags, external links and relative links aren't read. To reference a limit from plain Markdown, link its table row: `/agents/limits#fact-protocolsizelimit` (a value fact's row id is `fact-` plus its id lowercased, and a value set's is `set-` plus its id lowercased). Link an error, event or delivery issue on `/agents/errors-and-events` as `#error-`, `#event-` or `#issue-` and the case id lowercased: `/agents/errors-and-events#error-groupfull`.

`bun run check:references` runs the same check on any folder or file of Markdown/MDX, against this checkout's build:

```bash
bun run build
bun run check:references --ref main path/to/skills
```

It exits 0 with no misses, 1 with misses, and 2 on a usage error, a missing build, or when `--ref` names a commit other than the checkout's `HEAD`.

The `trueseal-skills` CI runs it from a trueseal-docs checkout at a release tag:

```yaml
- uses: actions/checkout@v4
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: 1.4.2
- uses: actions/checkout@v4
  with:
    repository: julianbonomini/trueseal-docs
    ref: vX.Y.Z
    path: trueseal-docs
- run: cd trueseal-docs && bun install --frozen-lockfile && bun run build
- run: bun trueseal-docs/scripts/check-references.ts --ref vX.Y.Z skills
```

To screenshot built pages in both themes at desktop and phone width (run `bunx playwright install chromium` once first):

```bash
bun run screenshot /tmp/shots / /docs/overview/introduction
```

The mascot artwork is `brand/mascot/mascot.svg`. After changing it, run `bun run export-mascot` to regenerate the PNG exports beside it.

---

## Deployment

This repo is connected to **Cloudflare Pages**. Any push to `main` triggers an automatic build and deploy. No manual steps required.

Build settings (already configured in Cloudflare):
- **Framework**: Astro
- **Build command**: `bun run build`
- **Output directory**: `dist`

---

## Content

The Human Docs live in `src/content/docs/`. Files can be `.md` or `.mdx`.

The Agent Docs live in `src/content/agents/` and are served at `/agents/...`. They are written for coding agents: literal, with no humour. Every Shared Fact (limits, versions, Relay Address, error and event cases) lives in `src/facts/shared-facts.ts` with its source; pages show a value with `<Fact id="…" />` or `<FactTable group="…" />`, and the cases with `<ApiEntries>`, and never type them. A test fails on a typed value. The SDK API reference renders from `src/api/api-reference.ts`; pages place `<ApiEntries>` and never list API names. Their sidebar is in `src/config/nav.ts`, beside the Human Docs one.

The Agent Snippet, the first Agent Docs page, renders `src/agent-snippet/agent-snippet.ts`. The Landing's Integrate section renders the same text, so edit it only there.

Use `.mdx` when a page needs custom components (flow diagrams, phase breakdowns, code blocks with tabs, callouts, etc.). Plain prose pages can stay as `.md`.

After `astro build`, `src/markdown/markdown.ts` writes a Markdown version of every Human Docs and Agent Docs page at its URL plus `.md` (`/docs/integrate/pairing.md`, `/agents.md`), and `llms.txt` and `llms-full.txt` over the Agent Docs sidebar. It converts each page's `<article>` HTML, so a Shared Fact reads the same in the page and its Markdown. A component whose HTML doesn't read as Markdown sets `data-markdown` on its root `div` to the Markdown it stands for. These files exist only after `bun run build`, so Copy as Markdown works in `bun run preview` and not in `bun run dev`.

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
| `<Fact id="..." />` | One Shared Fact's value, inline |
| `<FactTable group="..." />` | Every Shared Fact of a group as a table |
| `<ApiEntries section="..." />` | Every API entry of a section, or every error, event or delivery-issue case, with its signature, meaning and each platform's spelling |

---

## Project Structure

```
.github/
  workflows/      # check.yml: CI runs bun run check
brand/
  mascot/         # Mascot SVG and its PNG exports
src/
  agent-snippet/  # agent-snippet.ts (the Agent Snippet text both surfaces render)
  api/            # api-reference.ts (every public API name and its platform spelling), api.ts (sections, case spelling rule, apiNames())
  components/
    landing/      # Landing page sections
    docs/         # Sidebar
    layout/       # Navbar, Wordmark, Footer
    mdx/          # Reusable MDX components
    ui/           # Buttons, theme toggle, mascot
  config/         # nav.ts (both sidebars, reading order and which path belongs to which surface), redirects.ts (moved URLs), shiki.ts (code theme), site.ts (site URL, description, version label)
  content/
    docs/         # Human Docs
    agents/       # Agent Docs
  facts/          # shared-facts.ts (every Shared Fact and its source), facts.ts (lookup and formatting)
  layouts/        # BaseLayout, DocsLayout, LandingLayout
  markdown/       # markdown.ts (Markdown versions of built pages, llms.txt, llms-full.txt)
  pages/          # Astro routes
  references/     # references.ts (the reference check)
  styles/         # tokens.css, global.css
scripts/          # check-references.ts (the reference check CLI), screenshot.ts, export-mascot.ts
```

`tests/` holds the brand checks on the source and the Landing checks, the mascot and 404 checks, the redirect, link and docs-sidebar checks on the built site, the Agent Docs and header-switch checks, the Agent Snippet checks, the SDK API reference checks, the Shared Facts checks, including a build of a copy with a changed fact, the Markdown version, `llms.txt` and Copy as Markdown checks, the reference check on its fixtures, the real content and its CLI, and the CI workflow check, run by `bun test`.
