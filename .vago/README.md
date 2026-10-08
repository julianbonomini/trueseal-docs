# Vago in trueseal-docs

Vago takes a Goal, splits it into Tickets, and has a coding agent build and review each Ticket on its own branch. This repo has two Workflows:

- `small` for Tickets that change prose: Human Docs, Agent Docs, the glossary, ADRs.
- `code` for Tickets that change the site's code: UI, layouts, Islands, build-time generation, CI checks and scripts. A Goal with both kinds of Ticket goes through `code`.

The planning agent recommends one; you can override it with `vago plan workflow <name> <workflow>`.

## What a Ticket goes through

`small`:

| Step | Kind | What it does |
|---|---|---|
| New branch | shell | Cuts `<goal>/<ticket>` from `vago/<goal>`. |
| Write | agent | Writes the Ticket, traces every claim about TrueSeal to code in the sibling repos, and runs the `no-ai-writing` skill. |
| Review | agent | Re-checks scope, facts, consistency with other pages, and writing, then fixes what it finds. Its report goes in the PR. |
| Goal review | agent | Last Ticket only. Reads the whole Goal for drift between Tickets: renamed terms, one fact stated two ways, broken links. |
| Squash merge | shell | Squashes the Ticket into `vago/<goal>`, pushes, and opens or updates the Goal's PR. |

`code`:

| Step | Kind | What it does |
|---|---|---|
| New branch | shell | As in `small`. |
| Plan | agent | Reads only. Writes the design against ADR-0004 and brandbook section 8: files, interfaces, tests, and the pages to screenshot. It goes in the PR. |
| Build | agent | Follows the plan test-first, screenshots its own UI work, and runs `bun run check`. |
| Checks | shell | `bun install && bun run check`. A failure doesn't stop the Run; the review reads it and fixes it. |
| Review | agent | Screenshots every changed page, judges spec, look, code and writing, and fixes what it finds. Its report goes in the PR. |
| Goal review | agent | As in `small`, plus red flags in code across Tickets. |
| Squash merge | shell | As in `small`. |

Once every Ticket is done, the describe Step writes the PR body and the ready Step labels the PR `ready-for-review`. You merge the PR.

The prompts are in `prompts/`, the shell Steps in `scripts/`.

## Checks and screenshots

`bun run check` type-checks with `astro check`, runs `bun test` on every `*.test.ts`, then builds the site. It passes with no tests, so the first Ticket that needs one adds it.

`bun run screenshot <dir> <path>...` serves the built site from `dist/` and shoots each path in the light and dark Themes at 1440px and 390px wide. It flags pages wider than the viewport, failed loads and console errors, and exits 1 when a page doesn't load. Run `bun run build` first.

## Setup

1. Install the `vago` CLI and check it runs: `vago --help`.
2. Log in to GitHub with `gh auth login`. The merge and ready Steps push and open PRs with it.
3. Install Claude Code; both Workflows run on it (`harness` in each `.toml`).
4. Install [Bun](https://bun.sh), then run `bun install` and `bunx playwright install chromium` once. The browser goes in a shared cache, so the Goal worktrees use it too.
5. Check out the TrueSeal repos next to this one, in the same parent folder: `trueseal-sync`, `trueseal-relay`, `trueseal-noise` and the SDK repos. The agents read their code to check every claim, and leave a `TODO:` where they can't.
6. Install the skills the prompts use that are not in this repo, in `~/.claude/skills/` for Claude Code or `~/.agents/skills/` for Codex:
   - `no-ai-writing`: every line of prose and UI copy.
   - `writing-for-agents`: Agent Docs, Agent Snippets, skills.
   - `domain-modeling`: changes to `CONTEXT.md` and new ADRs.
   - `frontend-design`: the `code` plan, when a Ticket changes how a page looks.

   The `vago-*` skills ship in `.claude/skills/` and `.agents/skills/`.

Don't run `vago init`: the files already exist, so it refuses. **Don't run `vago update` without reading its diff**: it overwrites every starter file that differs from Vago's copy, and restores the ones this repo removed. Here that means `workflows/small.toml`, `prompts/review.md`, `prompts/goal-review.md`, `prompts/describe.md` and `prompts/planning.md`, plus the deleted `try-hard` Workflow and its prompts. `code.toml`, `prompts/write.md`, `prompts/plan.md`, `prompts/build.md`, `prompts/review-code.md` and this file are not starter files, so it leaves them alone.

## Running a Goal

Plan it with an agent, which proposes the Goal, its Tickets and a Workflow:

```bash
vago plan new <name>
```

Or write the Goal yourself and add Tickets one by one:

```bash
vago goal new <goal> --workflow code --body-file goal.md
vago ticket add <goal> <slug> --body-file ticket.md
```

Then run it:

```bash
vago run <goal>
vago goal report <goal>   # Tickets, Runs and review reports
```

Goals live in `.vago-goals/`, which git ignores through `.git/info/exclude`.
