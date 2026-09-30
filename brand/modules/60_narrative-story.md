# 60. Narrative / Story

Status: done (2026-09-30)
Participant: julian

## Inputs (paraphrased)

### Whose story leads

- **The reader's story leads** on the home page and in the introduction. The hero is the developer about to settle for unencrypted sync.
- The founder's story (the iCloud clipboard, the walled garden, seventy untrusted apps) is supporting material. The default placement is a short "Why TrueSeal exists" page, plus the Hush example as proof. It is not on the hero.

### The ending

- **Privacy as an afterthought** is the narrative's core idea. Privacy stops being a project and becomes a trailing clause in the developer's own feature list.
- Claim check: "fully private" overclaims, because the relay sees metadata (ADR-0024, ADR-0031). The brand-safe afterthought is "and it's end-to-end encrypted" or "and no one else can read it". Keep the offhand cadence and change the words.

### Line reaction

- The arc was accepted without changes.
- Ranking: C, then B, then A.

## Synthesis

### Story arc (reader-led)

1. **Ordinary world.** A developer is building an app where a few devices share something personal: a location, a clip, a secret.
2. **The trap.** They need sync. Doing it privately looks like a protocol project (pairing, keys, offline queues, membership). So they're about to settle and ship it readable by whoever runs the server.
3. **The turn.** "Don't give up on privacy." TrueSeal is the sync primitive with the privacy already inside. It takes about ten lines, three screens, and a relay in one container.
4. **The work that stays theirs.** Their app logic, data model and conflicts. TrueSeal draws that line out loud and gets out of the way.
5. **The ending.** Their feature list gains a trailing clause, said almost in passing: "Syncs across all your devices, and no one else can read it."

The founder's story (the clipboard with history, the walled garden, seventy untrusted apps) lives on a short "Why TrueSeal exists" page. Hush is the working proof.

### Trueline (Neumeier onlyness)

TrueSeal is the only **private sync primitive** that makes privacy **a default instead of a project**, for **developers building apps where a few devices share something personal**, at a time when **every sync service can read what passes through it**.

### Narrative lines (ranked by founder)

A. "Privacy should be the boring part of your app."
B. "Ship sync. Get privacy with it."
C. "The best privacy feature is the one nobody had to build." **(first choice, the narrative signature)**

### Rules

- The reader is the hero; TrueSeal is the tool; the founder is the guide who appears only on the Why page.
- The afterthought cadence is the signature, used once at the story's end. Never "fully private" or "completely private".

