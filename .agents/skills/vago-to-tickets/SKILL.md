---
name: vago-to-tickets
description: Break a Vago Goal into a set of tracer-bullet Tickets, each declaring its blocking edges, written with the vago CLI and ready for `vago run`.
---

# To Tickets

Break a Vago Goal into a set of **Tickets**: tracer-bullet vertical slices, each declaring the Tickets that **block** it.

Vago takes the Tickets through the Goal's Workflow with no human present, one at a time, the lowest-numbered ready Ticket first. Every agent Step of a Ticket reads the Goal and that Ticket, and nothing of the other Tickets. A stuck Ticket stops the Goal.

## In a Vago planning chat

When you plan a Goal in a Vago planning chat, the planning instructions you started from describe a proposal block. Put each Ticket from the template below in that block's `tickets`, in dependency order, with its blockers in `blocked_by`, as those instructions say. Don't run `vago` and don't write files: Vago saves the proposal, and the human accepts it. The steps below are for a chat outside Vago.

## Process

### 1. Gather context

Read the Goal: the one the user names, or the one `/vago-to-goal` just wrote, in `.vago-goals/<goal>/goal.md`. Work from whatever else is already in the conversation context.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** Tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each Ticket its **blocking edges**: the other Tickets that must complete before it can start. A Ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own Ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a Ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share the Goal's branch and all block a final integrate-and-verify Ticket; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each Ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other Tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this Ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each Ticket only depend on Tickets that genuinely gate it?
- Should any Tickets be merged or split further?

Iterate until the user approves the breakdown.

### 5. Write the Tickets with the vago CLI

Write each approved Ticket's body to a temporary file using the template below, then add it with `vago ticket add <goal> <slug> --blocked-by <NN>... --body-file <file>` (see `vago ticket add --help`), in dependency order (blockers first), so each `--blocked-by` names a Ticket that exists. Vago numbers them from `01`.

Do NOT change the Goal.

Finish by telling the user each Ticket with its blockers and the command that runs them: `vago run <goal>`.

<ticket-template>

# <Ticket title>

## What to build

The end-to-end behaviour this Ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

</ticket-template>

Blocking edges go in `--blocked-by`, not the body.

Avoid specific file paths or code snippets in a Ticket: the Goal's Further Notes hold where the code lives. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.
