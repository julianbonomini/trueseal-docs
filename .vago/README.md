# Vago in trueseal-docs

Vago takes a Goal, splits it into Tickets, and has a coding agent write and review each Ticket on its own branch. This folder holds the repo's one Workflow, `small`, set up for a documentation repo: there is no test suite or check script, so each Ticket gets a writer and a fresh reviewer instead of a build gate.

## What a Ticket goes through

| Step | Kind | What it does |
|---|---|---|
| New branch | shell | Cuts `<goal>/<ticket>` from `vago/<goal>`. |
| Write | agent | Writes the Ticket, traces every claim about TrueSeal to code in the sibling repos, and runs the `no-ai-writing` skill. |
| Review | agent | Re-checks scope, facts, consistency with other pages, and writing, then fixes what it finds. Its report goes in the PR. |
| Goal review | agent | Last Ticket only. Reads the whole Goal for drift between Tickets: renamed terms, one fact stated two ways, broken links. |
| Squash merge | shell | Squashes the Ticket into `vago/<goal>`, pushes, and opens or updates the Goal's PR. |

Once every Ticket is done, the describe Step writes the PR body and the ready Step labels the PR `ready-for-review`. You merge the PR.

The prompts are in `prompts/`, the shell Steps in `scripts/`.

## Setup

1. Install the `vago` CLI and check it runs: `vago --help`.
2. Log in to GitHub with `gh auth login`. The merge and ready Steps push and open PRs with it.
3. Install Claude Code; the Workflow runs on it (`harness` in `workflows/small.toml`).
4. Check out the TrueSeal repos next to this one, in the same parent folder: `trueseal-sync`, `trueseal-relay`, `trueseal-noise` and the SDK repos. The agents read their code to check every claim, and leave a `TODO:` where they can't.
5. Install the skills the prompts use that are not in this repo, in `~/.claude/skills/` for Claude Code or `~/.agents/skills/` for Codex:
   - `no-ai-writing`: every line of prose.
   - `writing-for-agents`: Agent Docs, Agent Snippets, skills.
   - `domain-modeling`: changes to `CONTEXT.md` and new ADRs.

   The `vago-*` skills ship in `.claude/skills/` and `.agents/skills/`.
6. Install [Bun](https://bun.sh). The agents run `bun run build` only when a Ticket changes code, not prose.

Don't run `vago init`: the files already exist, so it refuses. **Don't run `vago update` without reading its diff**: it overwrites every starter file that differs from Vago's copy, and restores the ones this repo removed. Here that means `workflows/small.toml`, `prompts/review.md`, `prompts/goal-review.md`, `prompts/describe.md` and `prompts/planning.md`, plus the deleted `try-hard` Workflow and its prompts. `prompts/write.md` and this file are not starter files, so it leaves them alone.

## Running a Goal

Plan it with an agent, which proposes the Goal and its Tickets:

```bash
vago plan new <name>
```

Or write the Goal yourself and add Tickets one by one:

```bash
vago goal new <goal> --workflow small --body-file goal.md
vago ticket add <goal> <slug> --body-file ticket.md
```

Then run it:

```bash
vago run <goal>
vago goal report <goal>   # Tickets, Runs and review reports
```

Goals live in `.vago-goals/`, which git ignores through `.git/info/exclude`.
