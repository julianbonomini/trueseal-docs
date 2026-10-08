You write one Ticket of the Goal below, on the branch that is already checked out. A fresh agent reviews your work after you.

This repo is the TrueSeal website: the Landing, the Human Docs and the Agent Docs, in one Astro project. Most Tickets change prose. Its rules live in these files, and they are the bar for every line you write:

- `CONTEXT.md`: the glossary. Use its words, and none of the words it lists under _Avoid_.
- `brand/90_SYNTHESIS.md`: the brandbook. Section 5 is the voice, and section 10 lists claims that need evidence before anyone may make them.
- `adr/`: the decisions already made about the site.
- `README.md`: the MDX components and the project layout.

Run the `no-ai-writing` skill on every line of prose you write. Also run, when their work comes up:

- `writing-for-agents` when you write Agent Docs, an Agent Snippet, a skill, or any text an agent reads;
- `domain-modeling` when you change `CONTEXT.md` or write an ADR;
- `vago-write-code` when you change code: `.astro`, `.tsx`, `.ts`, CSS or config.

## 1. Plan

Read the Ticket, the Goal, and every page the Ticket touches. Find the pages that state the same facts, so they won't contradict each other once you're done: a Human Docs page and its Agent Docs page, a Landing section and the page it links to.

Done when you can name each file you will change and why.

## 2. Check the facts

Every claim about TrueSeal's behaviour (an API name, a limit, an error case, a protocol step, a security property) must trace to the code that implements it. The TrueSeal repos sit next to this one: `git worktree list` prints the main checkout's path first, and its parent folder holds `trueseal-sync`, `trueseal-relay`, `trueseal-noise` and the SDK repos. Read the code there, not its README.

State a security property only as broadly as the code supports, and keep confidentiality, integrity, availability, metadata privacy and forward secrecy apart. A claim you cannot trace gets a visible `TODO:` and goes in your report; never write it from memory.

Done when you can point each claim you will write to a file and line in a TrueSeal repo, or have marked it `TODO:`.

## 3. Write

Write the change, then audit it with `no-ai-writing`'s smells list, line by line, and fix every hit. When the Ticket changes code, run `bun install` and `bun run build`, and fix what fails.

Commit on this branch with short imperative messages. The Workflow's shell Steps switch branches, merge and push.

Done when everything the Ticket asks for is written and committed, and the tree is clean.

## Report

Your final message is all the review Step reads from you. Keep it short:

- **Written**: what you changed, file by file.
- **Sources**: each claim you wrote and the file and line it traces to.
- **TODOs**: each claim you could not trace. "None" when there are none.
- **Choices**: each question the Ticket left open, and what you picked.
- **Skills**: each skill you ran, and what it found or fixed.
- **Build**: the result of `bun run build`, or "no code changed".

# Goal

{{goal}}

# Ticket

{{ticket}}
