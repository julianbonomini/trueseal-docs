# TrueSeal Brandbook

Version 1, 2026-09-30. Founder: Julian Bonomini. Derived from the interview modules in `modules/` (10 to 70).

This is the reference for anyone writing, designing or building for TrueSeal. When a module and this file disagree, this file wins.

## 1. Purpose

> **What's yours stays between your devices. TrueSeal is the private sync primitive any app can build on.**

TrueSeal exists so that privacy is the default for anyone who wants it, with no trust in a vendor and no protocol project for the developer. The founder is a private person, and the conviction is simple. You draw the circle of who can read your data, and everyone outside it, including the relay, sees ciphertext.

"Stays between your devices" refers to content. The relay can't read or forge messages, but it does see some metadata (see the Threat Model). Copy that expands the purpose line must not imply metadata is hidden.

## 2. Positioning

**Identity:** a private sync primitive. **Descriptor** (search, package metadata, subtitles): an end-to-end encrypted sync SDK.

For developers building apps that sync user data across devices, who want it private but can't justify building pairing, keys and delivery themselves, TrueSeal is a private sync primitive that makes privacy the default in about ten lines, with a relay you run yourself. It has no opinion about your data, and the relay never gets to read it.

**What we compete with, most common first:**

1. Giving up. Plain Firestore, Supabase or a custom backend, unencrypted.
2. Bolting libsodium onto the existing stack, then building pairing, key sharing, an outbox and membership by hand.
3. A platform-locked option (CloudKit with encrypted fields).
4. A private sync engine shaped around someone else's app (Anytype's any-sync).

**Why TrueSeal wins:** pairing, membership, end-to-end encrypted delivery, the offline outbox, dedup and ordering come included. The same API covers Swift, Kotlin and TypeScript. Payloads are opaque bytes. The relay runs in one container. Everything is Apache-2.0.

**What stays the app's job:** its data model, conflict resolution and pairing screens. TrueSeal says so out loud.

## 3. Audience

**First builder:** an indie developer, solo or a pair, shipping a mobile or desktop app where a small, trusted circle shares something personal. They want a working demo in an afternoon, no bill, no account, and the ability to tell their users that nobody else can read their data.

**Flagship scenario:** location sharing between family or friends. Others are secrets or passwords between your own devices, and clipboard or notes sync (Hush).

**Not for, in the preview:**
- Browser and web apps (not yet).
- Open groups that anyone can join without explicit admission.
- Apps whose server must read the data (search, analytics, moderation).
- Teams that need SLAs, compliance certifications or vendor support.
- People who need network-level anonymity (pending the relay IP decision).

Don't cite the current group size cap in brand copy. It's an arbitrary current limit. Reference docs state the tested value.

## 4. Personality

**Archetype:** Sage first, Creator second. It explains exactly how it works and what it doesn't do, then hands over a well-made tool and steps back. The stance is "here it is, I believe in it, do whatever you want."

**Always** reliable, secure and elegant. **Never** "I know better".

"Secure" is a character trait. In copy, name the specific property and link the test that proves it.

| Aaker dimension | Level | Shows up as |
|---|---|---|
| Competence | High | Exact specs, tested claims, honest limits |
| Sincerity | High | Says what the relay sees, and never oversells |
| Sophistication | Medium-high | Restraint and craft, never luxury |
| Ruggedness | Medium | Evidence of surviving offline, restarts and hostile relays |
| Excitement | Low | Interest comes from precision, not hype |

The nerd in the Pikachu shirt is still in there, showing up as the seal mascot and one well-placed joke, never as the overall look.

## 5. Voice

Clear enough for any developer, and written like the person who built it.

**Principles**

1. Clear before clever. Plain word first, the term of art second if it's needed.
2. Start with a situation the reader has lived, then explain the mechanism.
3. Draw the line out loud. Say what TrueSeal does and what stays the app's job.
4. Be exact about security. State only what tests prove, and say what the relay sees in the same breath.
5. Ration the humour. At most one shared-pain joke per page, and none in the threat model, errors or API reference.
6. Never lecture. No sermons about trust, and no implying the reader should already know.

**Anti-AI rules (hard bans for all TrueSeal writing)**

| Ban | Do this instead |
|---|---|
| Em dashes and en dashes as punctuation, including a spaced hyphen | A full stop, a comma or parentheses. Hyphens inside compound words are fine. |
| "This is not X, it is Y" | Say what it is. |
| Via negativa parallels ("Not A, not B, C") | One positive statement. |
| Mixed metaphors | Literal language, or one metaphor carried consistently. |
| Emoji as a crutch | None in docs, READMEs or the site. |
| Verbose, structured rambling | Short prose. Lists only for truly parallel items. |
| LinkedIn staccato | Normal paragraphs with complete sentences. |
| Colon overuse | Write the sentence. Colons only before code or a real list. |
| Tag questions, hedges and filler ("right?", "basically", "simply", "just") | Cut them. |

**Banned terms:** zero-trust, zero-knowledge, no communication graph, structurally unknowable, cryptographic guarantee, anonymous, military-grade, and "secure" on its own. Don't write "fully private" or "completely private".

**Allowed rhetorical moves:**
- one question that makes the obvious choice obvious ("Why wouldn't it be private?"), at most once per page;
- naming the real alternative plainly, without sneering;
- a flat closing verdict.

**Saying "free":** the lead idea is privacy for free, by default, meaning no extra effort. Cost comes second: "Free to use, free to host, and about ten lines to add."

**Tone by surface**

| Surface | Tone | Humour |
|---|---|---|
| Home page | Confident, product-first, imperative hero | One joke allowed |
| Quickstart | Brisk, second person, numbered steps | One line at the finish, at most |
| Concepts and guides | Situation first, plain explanation, occasional first-person aside | Rare |
| Threat model | Flat and exact, each claim linked to its test | None |
| API reference, errors, CLI | Literal. What happened and what to do | None |
| README | Home-page voice at half volume, links to the threat model | Rare |
| Founder posts and releases | First person, conversational, signed | Allowed |

**Before and after**

> Before: "The server can't read your data. Not 'shouldn't', not 'promises not to', *can't*. Compromise the relay completely and an attacker walks away with ciphertext and some recipient public keys. That's it."
>
> After: "The relay can't read your messages. It does see who's online, when they send, and roughly how much. Here's the full list."

## 6. Narrative

The reader is the hero, TrueSeal is the tool, and the founder is the guide who appears on the Why page.

1. A developer is building an app where a few devices share something personal.
2. Doing sync privately looks like a protocol project, so they're about to settle and ship it readable by whoever runs the server.
3. Don't give up on privacy. TrueSeal brings the privacy with the sync, in about ten lines.
4. Their app logic and conflicts stay theirs, and TrueSeal gets out of the way.
5. Their feature list gains a trailing clause, said almost in passing: "Syncs across all your devices, and no one else can read it."

Privacy arrives as an afterthought. That offhand ending is the signature, used once per story.

**Trueline:** TrueSeal is the only private sync primitive that makes privacy a default for developers building apps where a few devices share something personal, at a time when every sync service can read what passes through it.

**Signature line:** "The best privacy feature is the one nobody had to build." Alternates: "Ship sync. Get privacy with it." and "Privacy should be the boring part of your app."

**Home page hero (working draft):**

> **Don't give up on privacy.**
> TrueSeal is the private sync primitive that makes it about ten lines of code. End-to-end encrypted sync for Swift, Kotlin and TypeScript, with a relay you run yourself.

**On recovery:** don't lead with it. Frame it as proof ("No one can recover or read your data, not TrueSeal and not whoever runs your relay") and state the consequence plainly in the docs (lose every device and the data is gone).

## 7. Founder voice

TrueSeal is a founder brand. One named person speaks in the first person. There's no "we", because there's no team to imply.

| Surface | Pronoun |
|---|---|
| Home page | "You". A small "Built by Julian Bonomini" line near the end |
| Why TrueSeal exists | Full first person. The clipboard story, background and conviction |
| Introduction and guides | "You", with occasional first-person asides where the founder's judgement matters |
| Threat model | Impersonal. The founder may sign a short preface |
| API reference, errors, CLI | Impersonal |
| SECURITY.md, releases, posts | First person, signed |

Background is stated as shared pain, never as authority. For example: "I'm Julian. I've spent more than ten years building software, including sync at [former employer]. I know which parts of sync hurt, and those are the parts TrueSeal takes off your hands." Don't use employer logos or anything that implies endorsement. The founder checks their own agreements before the former employer is named, then fills in the placeholder.

## 8. Visual identity

The look is plain and precise, like ink on paper. It gets people interested through precision and attracts the right engineers rather than everyone.

### Colour

A warm paper base, ink text, and one accent, **wax-seal red**. A wax seal is the oldest sign that a letter is private and hasn't been opened, which is the idea of the brand, and it's in the name. Use it rarely and only for meaning, such as the cursor, links, focus and "sealed" or encrypted states. Never use it for decoration or large fills.

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` (background) | `#F5F1E8` | `#161412` | Page background |
| `ink` (text) | `#1A1814` | `#EDE7DA` | Body and headings |
| `ink-muted` | `#5C574E` | `#9C958A` | Secondary text, borders at lower alpha |
| `seal` (accent) | `#A3301E` | `#E4644B` | Cursor, links, focus, sealed state |

Contrast against the background is 15.7:1 for ink and 6.4:1 for ink-muted in light mode (14.9:1 and 6.2:1 in dark). Seal is 6.2:1 in light and 5.5:1 in dark, which passes WCAG AA for text. Never use pure white or pure black. Gradients are allowed only when they encode something (for example a progress or TTL bar), never as decoration. Stronger, playful colour belongs to the Hush example apps.

### Shape and layout

- Square corners everywhere, with a radius of 0. It's a primitive.
- Hairline rules and strict alignment instead of cards and shadows.
- Generous whitespace, with typography doing the hierarchy.
- Motion only with purpose. The blinking cursor is the one idle animation, and it respects `prefers-reduced-motion`.
- No fear imagery or hacker clichés (padlocks, skulls, matrix green, hooded figures).

### Type

- **Monospace** (JetBrains Mono today) for the wordmark, code, labels and small technical metadata.
- **Sans** (Geist today) for prose and headings.
- Both are already in the docs tokens. A later pass may swap either for something more distinctive, but it must stay a precise grotesk and a legible mono.

### Logo system

- **Wordmark (primary):** `trueseal` set in the mono, followed by a blinking block cursor in `seal` red. It reads as a live terminal prompt. It's the everyday mark for the nav, the README and favicons (just the cursor block, or "t" plus the cursor).
- **Mascot (secondary):** a cute seal, the founder's wordplay on the name. It carries the nerd's warmth, so the rest of the system can stay plain.
  - Style: flat and monoline in `ink`, geometric enough to sit beside square corners, with at most one `seal`-red detail. A natural idea is a small red wax-seal stamp the seal holds or wears.
  - Where it appears: the README header, the 404 and empty states, the social avatar, stickers, and the "Why TrueSeal exists" page.
  - Where it doesn't: the home page hero headline, the threat model, error messages and API reference.
  - It is never a padlock, and never scary.

## 9. Brand identity prism (Kapferer)

| Facet | TrueSeal |
|---|---|
| Physique | Ink on warm paper, one wax-seal red accent, square corners, a blinking cursor, a small monoline seal |
| Personality | Reliable, secure and elegant. A quiet expert who hands you a good tool and trusts you with it |
| Culture | Privacy as agency, proof over promise, a primitive and not a product, open source out of conviction |
| Relationship | A peer who has felt the same pain. It hands over the tool and draws the boundary honestly |
| Reflection | The developer who ships privacy by default without making a project of it |
| Self-image | "My users' data is theirs, and I didn't have to become a cryptographer to make it so" |

## 10. Claims that need evidence before launch

These are brand claims today. Each needs a test or a check before it appears in public copy.

- "About ten lines" and "three screens", checked against the shipped SDKs.
- "A relay in one container", checked against the self-hosting guide.
- The Life360 data-broker report (The Markup, December 2021), if cited at all.
- Etebase's current status, if named at all.
- IP wording. Use "The relay never logs, stores or uses your IP address. The server it runs on still sees the connection, as with any internet service. To hide your IP from the server too, use a VPN or Tor." Never say "can't see". The release gate checks the relay's logs and store (trueseal-relay ADR-0012).

## 11. Open items handed off

- **Visual rendering:** Prototype: docs site structure, home page, and visual direction (trueseal-roadmap#17) applies this brandbook to the site.
- **Mascot artwork:** drawn in `brand/mascot/` (`mascot.svg` plus the avatar and README-header PNGs), trueseal-docs#15.
- **Relay IP visibility:** decided in Decision: should the relay be unable to see client IPs in the preview? (trueseal-roadmap#26). The relay never logs, stores or uses IPs in any mode. Hiding IPs from the host is deferred past the preview.
- **Browser support:** not in the preview. Revisit as a future scope decision.

## Appendix. Why these choices

Each rule above has a reason. Change a rule only if its reason no longer holds. The full paraphrased interview is in `modules/`.

| Choice | Rejected alternative | Why |
|---|---|---|
| Purpose line "What's yours stays between your devices" | "You decide what you share" | People choose TrueSeal for what they don't share. Agency means drawing the circle of who can read, not deciding whether to share. |
| Frame privacy positively | "Stop saying 'trust us'" and "Privacy shouldn't require trust" | TrueSeal also asks to be trusted, so preaching distrust undermines itself. |
| The main competitor is giving up | Leading with Firestore plus libsodium | Most developers don't build DIY encryption. They settle for no privacy, so the pitch targets that moment. |
| "Free" means effort first, cost second | Leading with price | The founder's point is that privacy should cost no extra work. Apache-2.0 and self-hosting are true but secondary. |
| "Private sync primitive", described as an end-to-end encrypted sync SDK | "Encrypted messaging between devices" | "Primitive" is the truest description. "Sync SDK" is what developers search for. "Messaging" suggests a chat app. |
| Recovery framed as proof | Leading with "no recovery" | That no one else can recover the data proves the promise. The consequence belongs in the docs, stated plainly. |
| Indie developers first | Enterprise teams | The preview has no support promise. Indies ship fast and value a demo in an afternoon. |
| Location sharing as the flagship | Clipboard sync only | It's small circles and small payloads, the sensitivity is obvious, and there's a public contrast. It came up during the interview. |
| No web apps, no open groups, no group-size number in copy | Promising "any app or website" | Browsers can't open the relay's TCP transport yet. Admission is explicit. The size cap is arbitrary and will change. |
| Sage plus Creator | Sage plus Outlaw | Outlaw reads as "I know better". Creator hands over the tool and steps back. |
| Plain and precise look | A playful, quirky look | Precision attracts the right engineers. The playfulness moves to the mascot and one joke per page. |
| Anti-AI writing rules | A generic "friendly docs" tone | The writing has to read like a person who built the thing. Machine-sounding patterns cost that trust. |
| No "fully private", no "anonymous", and no "can't see your IP" | Stronger privacy adjectives | The relay sees metadata (ADR-0024, ADR-0031). Claims are limited to what tests prove. |
| Reader-led story, founder's story on the Why page | Founder story on the home page | The reader is the hero. The founder's story explains conviction, but it doesn't sell the primitive. |
| Privacy as an afterthought ending | A dramatic privacy climax | The point is that privacy is there by default, without anyone worrying about it. |
| Founder brand, first person | "We", or a faceless project | It's one person. "We" would imply a team that doesn't exist. |
| Background stated as shared pain | Background as authority | Authority collides with "never I know better" and with the anti-trust stance. |
| Warm paper, ink, and one wax-seal red accent | Pure white, pure black and white, or several colours | Pure white felt harsh. A wax seal is the classic sign of a private, unopened letter, and it's in the name. Stronger colour belongs to the Hush apps. |
| Square corners and the blinking cursor | Rounded cards and decorative gradients | They read as a primitive for developers. Gradients are allowed only when they encode something. |
| A cute seal mascot | Padlocks, shields or no mascot | It's the founder's wordplay on the name and carries the warmth. Padlocks are fear imagery. |
