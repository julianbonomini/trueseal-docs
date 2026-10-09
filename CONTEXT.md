# trueseal-docs

The website for the TrueSeal ecosystem — a static Astro site combining a marketing landing page and developer documentation, styled by the brandbook in `brand/90_SYNTHESIS.md`.

## Language

**Landing**
The marketing surface at `/`. Converts skeptical developers — explains what TrueSeal is, why it exists, and drives them to the docs.
_Avoid_: homepage, marketing page, index

**Human Docs**
The developer documentation surface at `/docs/...`, written for people: short pages in plain language. Serves developers and Operators who are using or evaluating TrueSeal. It may simplify, but it never contradicts the Agent Docs.
_Avoid_: documentation site, wiki, reference, Docs (on its own, now ambiguous)

**Agent Docs**
The documentation surface written for AI coding agents: dense, exhaustive pages that say exactly what TrueSeal is and what it is not, including the full SDK API reference. It is authored separately from the Human Docs, has its own `llms.txt`, and is the canonical reference when the two differ (ADR-0003).
_Avoid_: LLM docs, AI docs, llms.txt (that is one file within the Agent Docs)

**Agent Snippet**
The short block an app developer pastes into their own project's `AGENTS.md`: the integration pitfalls and a pointer to the Agent Docs. It lives in the developer's repo, not in TrueSeal's.
_Avoid_: rules file, prompt

**TrueSeal Skills**
The Agent Skills TrueSeal publishes for coding agents: Integrate, Pairing and Relay, one per workflow, shipped from the `trueseal-skills` repo as the `trueseal` plugin. They teach steps and pitfalls and link to the Agent Docs for every API name and fact (ADR-0005).
_Avoid_: prompts, agent docs (a different surface), plugin (the package, not the skills)

**Shared Facts**
The values both the Human Docs and the Agent Docs state and that must never differ between them: error cases, event cases, limits, protocol versions and the Relay Address format. They come from one generated source.
_Avoid_: constants (too code-specific)

**Journey**
The order the site tells the story in: Overview, Integrate, Operate, Trust. The Landing's sections follow it, and so does the Human Docs sidebar, with Reference after it (ADR-0004).
_Avoid_: funnel, onboarding flow

**Seal Demo**
The Island in the Landing hero. A location update on one phone is encrypted in the browser, the relay column shows only sealed packets with their size and time, and the update appears on the other phone (ADR-0004).
_Avoid_: hero animation, playground

**Mascot**
The seal drawn in `brand/mascot/mascot.svg`, the brand's secondary mark (brandbook section 8). An Astro component on the site; appears only where the brandbook allows (404, empty states, Why TrueSeal exists).
_Avoid_: logo, icon (the wordmark is the logo)

**Design token**
A named, theme-aware design value (color, spacing, radius, typography) consumed in code as a CSS custom property in `src/styles/tokens.css`. Values come from brandbook section 8, which is the source of truth (ADR-0004).
_Avoid_: CSS variable (too impl-specific), design variable

**Island**
An interactive React component embedded in an otherwise static Astro page. Hydrated only when needed — never ships JS to the browser unless the component requires it.
_Avoid_: component (ambiguous — use Island specifically for interactive React pieces, Astro component for static markup)

**Astro component**
A static `.astro` file — no client-side JS, no hydration. Used for layouts, nav, content wrappers, and any UI that does not need interactivity.
_Avoid_: component (use Astro component vs Island to be explicit)

**Content collection**
Astro's typed system for organizing and querying markdown/MDX content files. The existing docs markdown files map into a single content collection.
_Avoid_: pages, content folder

**Theme**
The active visual mode — `light` or `dark`. Switched via a `data-theme` attribute on `<html>`. Both themes are fully supported and share the same design token names; the values differ per theme.
_Avoid_: mode, color scheme (use theme)

**Threat Model**
The one page under Trust, with its Agent Docs counterpart, that states TrueSeal's security claims, each naming the tests that prove it at a pinned commit, plus its limitations and what it doesn't defend against. Both render from `src/config/threatModel.ts` (trueseal-roadmap#16).
_Avoid_: security page, security model

## Relationships

- The **Landing**, **Human Docs** and **Agent Docs** live in the same Astro project and share the same design token system and component library.
- **Design tokens** follow the brandbook and are consumed by both **Astro components** and **Islands**.
- An **Island** is always a React component. An **Astro component** is never interactive.
- **Content collections** power the **Human Docs** and **Agent Docs** surfaces. The **Landing** is hand-authored Astro, not driven by a content collection.
- Both **themes** (light and dark) resolve to the same **design token** names — only the values change.

## Example dialogue

> **Dev:** "Should the nav be a component or an island?"
> **Designer:** "It needs a theme toggle — so it's an Island."
> **Dev:** "And the doc page layout?"
> **Designer:** "That's just an Astro component — no interactivity needed."

## Flagged ambiguities

- "component" is overloaded — resolved: use **Astro component** for static `.astro` files, **Island** for interactive React pieces.
- "docs" can mean the content files or a surface of the site — resolved: say **Human Docs** or **Agent Docs** for a surface, and "content" or "markdown files" for the raw files.
