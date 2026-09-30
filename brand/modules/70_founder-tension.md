# 70. Founder Brand vs Project Brand

Status: done (2026-09-30)
Participant: julian

## Inputs (paraphrased)

### Who speaks

- **Founder brand.** TrueSeal speaks as the founder, in the first person ("I").
- The founder is willing to put their name on it.
- Credentials offered: more than 10 years of experience, and prior sync-engine work at a large platform company (named privately; public naming waits for the founder's check of their agreements).
- **Tensions to resolve:**
  - Credentials can read as authority ("trust me, I know"), which collides with "never I know better" and with the anti-trust stance ("don't trust anyone, trust me", rejected in 10).
  - First person in reference docs (API, errors) fights "literal, what happened, what to do".
- **Practical flag, not a brand decision:** naming a former employer publicly is the founder's call. It's worth checking any agreements they signed. State it as a plain fact ("previously worked on sync at [former employer]") with no logos or implied endorsement.

### Credential intent

- The credential is introduction, not authority: "I'm Julian, I did X."
- It's framed as **shared pain**: "I've built sync before; I know which parts hurt."

## Synthesis

### Founder brand model

TrueSeal is a **founder brand**. One named person speaks in the first person and hands over a tool they believe in. There's no "we", because there's no team to imply.

### Where "I" appears (default, reversible)

| Surface | Pronoun |
|---|---|
| Home page | Reader-led ("you"). One small founder line near the end or footer: "Built by Julian Bonomini." |
| "Why TrueSeal exists" page | Full first person: the clipboard story, background, conviction |
| Introduction, guides | "You" for the reader, with occasional first-person asides where the founder's judgement matters ("I left conflict resolution out on purpose.") |
| Threat model | Impersonal and exact. The founder may sign a short preface. |
| API reference, errors, CLI | Impersonal, literal |
| SECURITY.md, releases, posts | First person, signed |

### How the background is stated

- An introduction framed as shared pain: "I'm Julian. I've spent more than ten years building software, including sync at [former employer]. The painful parts of sync are exactly what TrueSeal takes off your hands."
- Never "trust me", never used as proof of security (proof is tests and the threat model), and no employer logos or implied endorsement.
- Before publishing a former employer's name, the founder checks their own agreements.

### Risk

- The brand depends on one person (bus factor, and a support expectation aimed at one name). This is acceptable for a developer preview with no support promise. Revisit if contributors join.

