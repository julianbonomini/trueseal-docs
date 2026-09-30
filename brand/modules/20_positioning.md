# 20. Positioning

Status: done (2026-09-29)
Participant: julian

## Inputs (paraphrased)

### Competitive alternatives (Dunford step 1)

The founder pasted a researched answer. It is reproduced here as given. Its external claims (for example "Etebase hosted signup is currently disabled") are not yet verified.

> "If TrueSeal didn't exist, the developer's most likely choice would be **Cloud Firestore plus client-side encryption**: encrypt each payload with a library such as libsodium before writing it, then use Firestore's offline cache and cross-device sync. They would still have to build key sharing, device pairing, and recovery themselves."

| Alternative | When a developer would choose it |
|---|---|
| CloudKit with `CKSyncEngine` and encrypted fields | An Apple-only app whose users already use iCloud. Apple handles much of the sync and field encryption. |
| Self-host Etebase | A developer specifically seeking an encrypted sync backend and client libraries. It's the closest packaged substitute, though its hosted developer signup is reportedly disabled. |
| Build it myself on Supabase or object storage, with libsodium | A team that already has a backend and wants to own its sync protocol. Supabase supplies storage and change notifications, and the team implements encrypted payloads, offline queues, key exchange and delivery rules. |

> "**The competitor to beat is the 'we'll add encryption to our existing sync stack' decision.** TrueSeal's specific pitch is that its SDK already combines device pairing, group membership, encrypted delivery, and outbox replay through a relay that only holds ciphertext."

Sources cited: Firestore offline docs, libsodium secretbox, Apple CKSyncEngine and encrypted fields, etebase.com, Supabase Realtime.

Carried from 10_purpose-why: Anytype (any-sync) is the contrast, a private sync engine shaped around its own note-taking app.

### The real competitor: giving up

- This reframes the competition. The most common alternative is not "Firestore plus libsodium". It's **plain Firestore, unencrypted**: the developer settles.
- DIY encryption is the alternative for the rare developer who persists. The pitch targets the moment someone is about to settle.
- "Free" is defined here as **free in effort**. (Free in cost is also true, via Apache-2.0 and self-hosting, but secondary.)

### Effort proof (founder's view checked against the API as decided)

- The founder expects "an import plus a few screens" with the self-hosted relay, and says the hard part left is the app's own logic.

Checked against trueseal-sync ADR-0028 (canonical SDK API: accepted, **not yet implemented**, so every number here must be re-verified against the shipped SDKs before it appears in copy):

```ts
import { TrueSeal } from "@trueseal/sync";

const ts = await TrueSeal.open("trueseal://<relay-key>@relay.example.com", storage);
ts.onMessage(async (m) => app.apply(m.from, m.body));              // receive
const id = await ts.send(bytes);                                    // send

// Device A: invite and admit
const token = await ts.startPairing();                             // show as QR/text
ts.onEvent((e) => { if (e.type === "joinRequest") ts.accept(e.request); });
// Device B: join
await ts.join(token);
```

- **About 10 lines of integration code.** The relay setup is one Docker container, and the relay CLI prints the address string.
- **Screens:** show a pairing token (QR), scan or enter a token, approve a join request, and optionally a member list with remove, leave and destroy.
- **Never touched by the app:** keys, encryption, signatures, the key exchange during pairing, the offline outbox and retries, recipient inbox delivery, dedup (60-day window), per-sender order, membership convergence, identity reset after removal or destroy, and version rejection.
- **Still the app's job:** its data model and payload encoding (at most 60 KiB per message), conflict resolution, pairing UI, and **recovery**. There is no backup; if every device is lost, the data is gone. The relay holds ciphertext only until delivery or TTL.

### Recovery framing

- For brand purposes, treat the ADR-0028 API as the product. Numeric copy claims are still verified before launch (claims tied to tests, ADR-0031).
- Don't lead with "no recovery". Frame it as proof, not as a loss: **"not even TrueSeal (or your relay host) can recover or read your data."** The consequence ("if you lose every device, it's gone") belongs in the docs and the threat model, stated plainly, not on the hero.

### Category

- Identity: **private sync primitive** (the truest form, matching the purpose statement).
- Descriptor: **end-to-end encrypted sync SDK** (searchable, and it tells people what they install). Use it in subtitles, metadata and package descriptions.

## Synthesis

### Dunford positioning canvas

- **Competitive alternatives, in order of frequency:**
  1. Give up on privacy (plain Firestore, Supabase or a custom backend, unencrypted).
  2. Bolt encryption onto the existing stack (Firestore or Supabase plus libsodium), then build pairing, key sharing, the outbox and membership yourself.
  3. A platform-locked option (CloudKit with encrypted fields; Apple only).
  4. An app-shaped private sync engine (Anytype any-sync, Etebase).
- **Unique attributes:** pairing, membership, E2EE delivery, the offline outbox, dedup and ordering are all included. The same API covers Swift, Kotlin and TS. It's opinion-free about payloads (opaque bytes). The relay is self-hosted in one container and never reads content. It's Apache-2.0.
- **Value:** privacy costs about 10 lines and three screens instead of a protocol project, so developers who would otherwise settle ship private by default.
- **Best-fit customers:** see 30_audience-niche.
- **Market category:** a private sync primitive, described as an end-to-end encrypted sync SDK.
- **Relevant trend:** data-hungry platforms, and users who increasingly notice.

### Moore statement

For developers building apps that sync user data across devices, who want it private but can't justify building pairing, keys and delivery themselves, **TrueSeal is a private sync primitive** (an end-to-end encrypted sync SDK) that makes privacy the default in about ten lines, with a relay you run yourself. Unlike bolting encryption onto Firestore, being locked into CloudKit, or adopting an app-shaped engine like Anytype's, TrueSeal has no opinion about your data and never lets the relay read it.

### Candidate positioning lines

A. "Don't give up on privacy. TrueSeal is the private sync primitive that makes it about ten lines of code."
B. "The private sync primitive. End-to-end encrypted sync for Swift, Kotlin and TypeScript, with a relay you run yourself."
C. "Private by default, not by effort. Pair devices, sync bytes, and let no one in between read them."

### Founder preference

> "between A and B, I like both. I think i edge on A side"

- A leans toward the hero line, and B's content (the platforms and the self-hosted relay) is a strong subline. The final choice happens in 90_SYNTHESIS, after voice.

### Claim rules surfaced

- "About 10 lines" and "three screens" are brand claims that must be verified against the shipped SDKs (ADR-0031 ties claims to tests).
- Recovery: say "not even TrueSeal or your relay host can recover or read it". Never lead with "no recovery".
- Don't use "anonymous" (see 10), and don't say "can't see your IP" until the IP decision is made.

### Open questions

- Etebase's status (hosted signup disabled) is unverified. Don't name it in public copy without checking.
- Whether the home page names competitors at all (B's comparison section in the prototype was liked). Decide in 60_narrative or on the docs prototype ticket.
