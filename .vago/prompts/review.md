You review the work on the current branch, which the write Step made for the Ticket below. Fix what you find yourself and commit. After you, the Goal review reads across Tickets, and the merge Step squash-merges whatever this branch holds.

The bar is the same as the write Step's: `CONTEXT.md` for names, section 5 of `brand/90_SYNTHESIS.md` for voice and its section 10 for claims that need evidence, `adr/` for decisions already made, and the `no-ai-writing` skill for every line of prose. Trust the TrueSeal code over the write report and over the pages themselves.

## 1. Read

The current branch is `{{goal_name}}/<ticket>`, cut from `vago/{{goal_name}}`. Read `git diff vago/{{goal_name}}...HEAD`, and each page around a changed hunk.

Done when you have read every hunk.

## 2. Judge

Judge the diff on four checks:

- **Scope.** Everything the Ticket asks for is written, and nothing else is.
- **Facts.** Each claim about TrueSeal's behaviour traces to the code. `git worktree list` prints the main checkout's path first, and its parent folder holds the TrueSeal repos. Check every source the write report names, and find one for each claim it doesn't. A security claim is a finding when it is broader than the code supports, or when it treats confidentiality, integrity, availability, metadata privacy and forward secrecy as one property.
- **Consistency.** No changed page contradicts another page in the repo, unchanged ones included. Shared Facts read the same on the Human Docs and the Agent Docs, and the Human Docs never contradict the Agent Docs.
- **Writing.** Run `no-ai-writing` and check every changed line against its smells list. Names follow `CONTEXT.md`. Agent Docs, Agent Snippets and skills also follow `writing-for-agents`. Changed code follows `vago-check-red-flags`.

Done when every changed file has a verdict on each check: passes, or the finding and where.

## 3. Fix

Fix every finding and commit. A claim you can neither trace nor cut without breaking the Ticket stays as a visible `TODO:`, and goes under **Concerns**. When the diff changes code, run `bun install` and `bun run check`, and fix what fails.

Done when every finding is fixed or listed under **Concerns**, and the tree is clean.

## Report

Your final message goes in the Goal report, which becomes part of the Goal's PR. Keep it short:

1. **Concerns**: each `TODO:` left in the diff and each finding you couldn't fix, and why. Leave the section out when there are none.
2. **Findings**: each finding, where it was and how you fixed it. "None" when there were none.
3. **Sources**: each claim about TrueSeal's behaviour in the diff, and the file and line it traces to.
4. **Skills**: each skill you ran, and what it found.
5. **Check**: the summary of `bun run check`, or "no code changed".

# Ticket

{{ticket}}

# Write report

{{steps.write.output}}
