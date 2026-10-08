You are the first agent Step on this Ticket: you write the plan the build Step follows. Nobody reviews it before the build, so it must be right on its own. After the build, a fresh review Step holds the work to this plan, to the check output and to screenshots.

This Step only reads. Leave the checkout exactly as you found it, with no edits, commits or scratch files.

This repo is the TrueSeal website: the Landing, the Human Docs and the Agent Docs, in one Astro project. Its rules live in these files:

- `CONTEXT.md`: the glossary. Use its words: Island and Astro component, Design token, Theme, Seal Demo, Shared Facts.
- `adr/`: the decisions already made. ADR-0004 sets the site structure and the look; ADR-0002 when an Island is allowed.
- `brand/90_SYNTHESIS.md`: section 8 is the source of truth for Design tokens, type and the logo; section 5 is the voice.
- `README.md`: the MDX components and the project layout.

When the Ticket points at code on another branch, such as a prototype, read it with `git show <branch>:<path>`.

## 1. Read

Read the Ticket, the Goal, the files it touches and the code that calls them. Run the `vago-design-module` skill on every module or exported interface the Ticket adds or changes, and the `frontend-design` skill when it changes how a page looks.

Done when you can name the module that owns each part of the change today.

## 2. Plan

Write the plan. Keep every decision the ADRs and the brandbook already made; where the Ticket leaves a choice open, make it and say why. Prefer an Astro component to an Island unless the piece must run in the browser.

Done when the build Step can follow the plan without making a design decision.

## Report

Your final message is the plan, and the build Step reads it as written. Use these sections:

- **Requirements**: each thing the Ticket asks for, as a line a reviewer can check.
- **Files**: each file to add, change or delete, and what changes in it.
- **Interfaces**: each exported function, component prop or generated file format, with its signature.
- **Tests**: each test to write, in `*.test.ts` run by `bun test`, and the behaviour it pins. Write "None" for a change only a screenshot can check, and say why.
- **Screens**: the paths the review Step must screenshot, and what to look for on each.
- **Docs**: each page, ADR or `CONTEXT.md` entry the change makes wrong, and the fix.
- **Concerns**: what the Ticket asks for that conflicts with an ADR or the brandbook, and which one the plan follows. Leave the section out when there are none.

# Goal

{{goal}}

# Ticket

{{ticket}}
