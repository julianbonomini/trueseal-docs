# Agent Docs as a separate, canonical surface

Status: accepted (decided 2026-09-29 in [trueseal-roadmap#19](https://github.com/julianbonomini/trueseal-roadmap/issues/19); not yet implemented). Research: [agent-ready onboarding findings](https://github.com/julianbonomini/trueseal-roadmap/blob/research/agent-onboarding/research/agent-onboarding.md).

Many developers will add TrueSeal by asking a coding agent to do it. Agent onboarding is therefore a first-class part of the docs, but it is not mixed with the human docs, because the two audiences need different writing. Human readers need short, plain-language pages. Agents need dense, exhaustive pages that say exactly what TrueSeal is and what it is not.

## Decision

- **Two surfaces, authored separately.** **Human Docs** are bite-sized and use general language. **Agent Docs** have their own URL tree (proposed `/agents/...`; the final layout belongs to the docs-site prototype, trueseal-roadmap#17) and their own `llms.txt`, `llms-full.txt` and per-page Markdown. They are written for agents, not generated from the human pages.
- **Agent Docs are canonical.** They are the complete reference, the full SDK API included. Human Docs may simplify and must link across for detail, but must never contradict them.
- **Shared Facts come from one generated source.** The error cases, event and delivery-issue cases, limits (payload size, group size), protocol versions and the Relay Address format are generated once and included by both surfaces, so a number cannot differ between them.
- **Agent Snippet.** The first Agent Docs page is a short block for app developers to paste into their own `AGENTS.md`: the integration pitfalls plus a pointer to the Agent Docs `llms.txt`. It is copy-paste only; there is no setup CLI in the preview.
- **Skills live in a dedicated repo** and teach from Agent Docs rather than restating them. Which skills ship and how they are packaged is a separate decision.
- **READMEs are quickstarts.** The relay README serves Operators (Docker, keypair, Relay Address, backups). Each SDK README serves app developers (install, open, pair, send, receive). Neither holds the full reference; both link to Human Docs and Agent Docs.
- **Correctness gates.**
  - A CI check fails when Agent Docs, the Agent Snippet or a skill references an API name, error case, limit or page that no longer exists. This is a hard release gate.
  - Behavioural evals, in which an agent integrates each SDK against a real relay and the result is graded, are a manual pre-release gate recorded as release evidence. They do not run in CI, because that would be a recurring paid model-API cost. Public copy states what was tested and when, not an unconditional "a few prompts" claim.

## Considered options

- **Generate `llms.txt` and Markdown from the human pages only.** Rejected: one writing style can't serve both audiences, and the human pages would lack the exhaustive API reference and "what it is not" detail agents need.
- **Keep the SDK API reference in each SDK README.** Rejected: ADR-0028 in trueseal-sync fixes one API shape across the SDKs, so one reference is the natural home, and three READMEs would drift.
- **Guidance shipped inside each SDK package** (the Next.js and TanStack Intent pattern). Out of scope for the preview: three packaging efforts, awkward for SwiftPM and Gradle.
- **A TrueSeal MCP server, or submitting to Context7.** Out of scope for the preview: TrueSeal has no hosted account state to expose.
- **Behavioural evals in CI.** Deferred: needs approval for recurring model-API spend.

## Consequences

- Two sets of content to maintain. The Shared Facts source and the reference check are what keep them aligned; without them the split would drift.
- The SDK READMEs shrink to quickstarts, and their API reference moves into Agent Docs.
- The docs-site information architecture (trueseal-roadmap#17) must include Agent Docs as a top-level section, separate from Human Docs.
