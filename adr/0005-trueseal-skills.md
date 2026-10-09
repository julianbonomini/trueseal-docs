# TrueSeal Skills: three workflow skills in a lockstep repo

Status: accepted (decided 2026-09-30 in [trueseal-roadmap#24](https://github.com/julianbonomini/trueseal-roadmap/issues/24); partly implemented: the Agent Snippet's skills line). Builds on ADR-0003, which settled that skills exist, live in a dedicated repo and teach from the Agent Docs. Research: [agent-ready onboarding findings](https://github.com/julianbonomini/trueseal-roadmap/blob/research/agent-onboarding/research/agent-onboarding.md) §1.3 and §3.

Skills help agents most with multi-step workflows, and least with general API knowledge, which the Agent Snippet carries. They are also often left unused unless something points at them. So TrueSeal ships a few sharp workflow skills, points at them from the Agent Snippet, and proves with evals that they trigger.

## Decision

- **Three skills, one per workflow:**
  - **Integrate** (`trueseal:integrate`): add TrueSeal to an app. It covers install, open, the Relay Address, registering the handler, sending, and the dedupe and ack pitfalls. Troubleshooting failed delivery (delivery issues, typed refusals, the outbox) is a reference file inside it.
  - **Pairing** (`trueseal:pairing`): build pairing UI with explicit admission on both sides, including the Pending Join, failure and restart states. The membership lifecycle after pairing (add, remove, `leaveGroup()`, Destroy Group) is a section inside it.
  - **Relay** (`trueseal:relay`): run a relay for local dev or on a single Docker node, covering the keypair, the Relay Address and backups.
- **One skill per workflow, not per SDK.** ADR-0028 in trueseal-sync gives the SDKs one API shape, so each skill has `references/swift.md`, `references/kotlin.md` and `references/ts.md` for syntax only.
- **Repo and plugin.** The repo is `julianbonomini/trueseal-skills`, licensed Apache-2.0. The plugin is named `trueseal`.
- **Distribution.**
  - The repo doubles as a Claude Code marketplace.
  - It uses the standard Agent Skills layout, so `npx skills add julianbonomini/trueseal-skills` works in any agent.
  - The docs site publishes `/.well-known/agent-skills/index.json`, with sha256 digests, built from a pinned `trueseal-skills` tag.
- **Lockstep versioning.** `trueseal-skills` joins the TrueSeal Release (ADR-0030 in trueseal-sync). Every release tags it `vX.Y.Z`, `plugin.json` carries that version, and it is part of the Release Manifest, even when nothing in it changed.
- **Teach from the Agent Docs.** A skill holds workflow steps, decision points and pitfalls. It links to Agent Docs pages for API signatures and every Shared Fact, and copies in no limits, error cases or versions. Short code examples in the per-platform references are allowed. The ADR-0003 reference-existence check covers every link and API name in the skills, and it is a hard gate.
- **The Agent Snippet points at the skills** in one line that gives both install commands.
- **Evals.** Each skill has `claude plugin eval` cases in `evals/`:
  - a **trigger** case: a natural prompt that doesn't name the skill, where the skill must be used;
  - a **non-trigger** case: an unrelated prompt, where the skill must not be used;
  - an **outcome** case graded against a no-plugin baseline. For example, Integrate must dedupe by Message ID and must not ack before the handler finishes; Pairing must implement admission on both sides.

  A skill passes when it triggers in at least 2 of 3 runs and its outcome case beats the baseline. The evals run in the manual pre-release gate from ADR-0003, and the results are recorded as release evidence. They are tested on Claude Code only, and the docs say that other agents are untested.

## Considered options

- **More skills (a separate debug-delivery skill, a membership-lifecycle skill).** Rejected for the preview. Every skill adds to the listing that is always loaded and needs its own evals. Both fit as sections inside Integrate and Pairing.
- **One skill per SDK.** Rejected. The workflow is identical across the SDKs, and nine listing entries would dilute triggering.
- **Skills on their own version schedule.** Rejected. It would break the "same version, same guidance" promise and make plugin auto-update drift from SDK upgrades.
- **Restating API signatures and limits in the skills.** Rejected. It is the drift ADR-0003 exists to prevent. The cost is that an agent without web access gets the steps but not the signatures.
- **Submitting to Anthropic's official plugin directory.** Deferred until after launch feedback. It is an external listing with a review dependency.

## Consequences

- A new `trueseal-skills` repo, with a tag in every TrueSeal Release even when it has no changes.
- The docs build gains a `/.well-known/agent-skills/index.json` endpoint that pins a skills tag.
- The Agent Snippet gains one line.
- The pre-release eval gate grows by nine cases, three per skill.
