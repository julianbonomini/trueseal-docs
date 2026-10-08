---
name: vago-to-goal
description: "Turn the current conversation into a Vago Goal, the spec its Tickets build: no interview, just synthesis of what you've already discussed."
---

This skill takes the current conversation context and codebase understanding and produces a Goal: the spec of where the Project is going and why. Do NOT interview the user; just synthesize what you already know. Slice it into Tickets afterwards with `/vago-to-tickets`.

Vago takes each of the Goal's Tickets through the Goal's Workflow with no human present, and every agent Step of every Ticket reads the Goal. So the Goal carries everything the Steps share. Vago runs in the human's checkout, driven by the Project's `.vago/`, the installed `vago` and the scripts its Workflow calls; changes to those wait until the Goal is merged.

## In a Vago planning chat

When you plan a Goal in a Vago planning chat, the planning instructions you started from describe a proposal block. Write the Goal from the template below into that block's `goal`, and the Workflow you recommend into its `workflow` with the reason in `workflow_reason`, as those instructions say. Don't run `vago` and don't write files: Vago saves the proposal, and the human accepts it. The steps below are for a chat outside Vago.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the Goal, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Pick the Workflow with the user: name the Workflows in `.vago/workflows/` and recommend one by the Goal's size.

4. Write the Goal using the template below to a temporary file, then create it with `vago goal new <goal> --workflow <name> --body-file <file>` (see `vago goal new --help`). Tell the user the Goal's name and to slice it with `/vago-to-tickets`.

<goal-template>

# <What's true when the Goal is done>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Only decisions the conversation made go here. What nobody decided stays open for the Workflow's Steps.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this Goal.

## After Merging

What the human does or checks once the Goal is merged: outcomes only a real Run or the human can verify, and any change to what drives the Goal (`.vago/`, the installed `vago`, the Workflow's scripts).

## Further Notes

Any further notes about the feature: where the code lives, what else breaks when it changes, anything the Steps would otherwise dig for. File paths are welcome; the Goal runs within hours.

</goal-template>
