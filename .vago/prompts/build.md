You build one Ticket of the Goal below, on the branch that is already checked out, by following the plan below. The check Step runs `bun run check` after you, and a fresh review Step then reads your work, the check output and screenshots.

The plan is the contract. When the code proves part of it unbuildable as written, make the smallest change that keeps every Requirement delivered and record it as a **Ruling**: what changed and why. Anything else you notice goes under **Concerns**, unbuilt.

Run the `vago-write-code` skill while you write code, and the `no-ai-writing` skill on every line of prose, UI copy included. Follow `CONTEXT.md` for names, `brand/90_SYNTHESIS.md` section 8 for Design tokens, and the ADRs in `adr/`. A claim about TrueSeal's behaviour must trace to code in the TrueSeal repos: `git worktree list` prints the main checkout's path first, and its parent folder holds them.

## 1. Set up

Run `bun install`.

Done when it exits zero.

## 2. Build

Build test-first wherever the plan names a test: write it, watch it fail, write the least code that passes it, commit. A test drives a public interface: a script's output, a generated file, a component's rendered HTML. For a change only a screenshot can check, build it and look: `bun run build`, then `bun run screenshot <dir> <path>...` with a folder outside the worktree, and read the images.

Done when every Requirement in the plan has a passing test or a screenshot you looked at.

## 3. Check

Run the `vago-check-red-flags` skill on the whole diff since `vago/{{goal_name}}`, fix every finding and commit. Then run `bun run check`, fix what fails and commit.

Done when `bun run check` exits zero on a clean tree.

Commit on this branch with short imperative messages. The Workflow's shell Steps switch branches, merge and push.

## Report

Your final message is what the review Step reads from you. Keep it short:

- **Built**: what you changed, file by file.
- **Rulings**: each change from the plan, and why. "None" when there were none.
- **Concerns**: what you noticed and left unbuilt. Leave the section out when there are none.
- **Skills**: each skill you ran, and what it found or fixed.
- **Check**: the summary of the final `bun run check`.

# Goal

{{goal}}

# Ticket

{{ticket}}

# Plan

{{steps.plan.output}}
