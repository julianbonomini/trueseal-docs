You review the work on the current branch, which the build Step made for the Ticket below by following the plan below. Fix what you find yourself and commit. After you, the Goal review reads across Tickets, and the merge Step squash-merges whatever this branch holds, so every finding ends here: fixed in a commit, or listed under **Concerns**.

Trust the code and the screenshots over the build report. Hold the work to the plan, `CONTEXT.md`, the ADRs in `adr/`, and `brand/90_SYNTHESIS.md`: section 8 for Design tokens, type and the logo, section 5 for the voice.

## 1. Read

The current branch is `{{goal_name}}/<ticket>`, cut from `vago/{{goal_name}}`. Read `git log vago/{{goal_name}}..HEAD` and `git diff vago/{{goal_name}}...HEAD`. If the check output below shows a failure, record it as the first finding.

Done when you have read every hunk.

## 2. Look

Run `bun install` and `bun run build`. Then screenshot every path the plan's **Screens** lists, and every page whose layout or styles the diff touches:

```
bun run screenshot <dir> <path>...
```

Use a folder outside the worktree. It shoots each path in the light and dark Themes at desktop and phone width, and flags pages wider than the viewport, failed loads and console errors. Open every image.

Done when every screenshot has a verdict against the plan's **Screens** and ADR-0004's look: passes, or what is wrong and where.

## 3. Judge

- **Spec.** Each line of the plan's Requirements is built. Label every gap: **Missing**, **Extra**, or **Misunderstood**. Keep a Ruling when its reason holds and every Requirement is still delivered.
- **Look.** Colours come from Design tokens, never literals. Both Themes work. Anything that moves stops under `prefers-reduced-motion`; read the CSS and scripts for it, since a screenshot can't show motion. Interactive elements have a visible focus state. Islands are used only where the page must run code in the browser.
- **Code.** Run the `vago-check-red-flags` skill on the whole diff. Each test drives a public interface.
- **Writing.** Run `no-ai-writing` on every changed line of prose and UI copy. Names follow `CONTEXT.md`. A claim about TrueSeal's behaviour traces to code in the TrueSeal repos: `git worktree list` prints the main checkout's path first, and its parent folder holds them.

Done when every changed file has a verdict on each check.

## 4. Fix

Fix every finding: spec first, then look, code and writing. Run `bun run check`, fix what fails, and commit. Screenshot again what you changed.

Done when every finding is fixed or listed under **Concerns**, and `bun run check` exits zero on a clean tree.

## Report

Your final message goes in the Goal report, which becomes part of the Goal's PR. Keep it short:

1. **Concerns**: every concern from the plan and the build report, carried forward, then your own. Leave the section out when there are none.
2. **Findings**: each finding, where it was and how you fixed it. "None" when there were none.
3. **Screens**: each path you screenshot and its verdict.
4. **Skills**: each skill you ran, and what it found.
5. **Check**: the summary of the final `bun run check`.

# Ticket

{{ticket}}

# Plan

{{steps.plan.output}}

# Build report

{{steps.build.output}}

# Check output

{{steps.check.output}}
