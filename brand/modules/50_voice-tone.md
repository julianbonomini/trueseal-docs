# 50. Voice & Tone

Status: done (2026-09-30)
Participant: julian

## Inputs (paraphrased)

### Stated preferences

- Above all, **clear and accessible for all developers.**
- To the point.
- Casual, plain terminology balanced with documentation rigour.
- Humour is allowed but rationed: zingers, "bonding through pain" (shared developer suffering).
- Never a know-it-all, and never needs a doctorate to follow.
- The founder asked for a source-derived profile of their own writing (see below).

### Source-derived profile of the founder's writing

```text
VOICE PROFILE
=============
Author: julian (TrueSeal founder), translated into the TrueSeal brand voice
Goal: docs, home page and README voice that is clear and accessible to every developer
Confidence: medium. The private set is 14 conversational samples; the public set is one page of unconfirmed authorship.

Source Set
- Private working voice: 14 of the founder's own replies in the 2026-09-29/30 brand interview (paraphrased in modules 10 to 50). The pasted competitor table in 20 is excluded as researched or AI-assisted text.
- Public voice (authorship unconfirmed): trueseal-docs src/content/docs/introduction.mdx ("The gap" and "The core guarantee").

Rhythm
- Private: long, spoken run-on sentences joined with "and / but / so", punctuated by short flat verdicts: "I didn't want that." "I don't care." "It's not good enough for me."
- Public: short paragraphs, a setup then a turn, often ending on a one-line punch ("That's it.").

Compression
- Moderate. Explains through one concrete example (the iCloud clipboard, Anytype, a Pikachu shirt) rather than definitions.
- Skips the obvious explicitly ("blah blah"), with no filler enumeration.

Capitalization
- Private: mixed (dictated messages conventional, typed ones lowercase with typos). The brand uses conventional capitalization; don't mimic lowercase.

Parentheticals
- Rare, used only to narrow a claim: "(in terms of effort)". Never for asides or jokes.

Question Use
- Tag questions seeking agreement ("..., right?") appear constantly in speech. Drop them in writing.
- One strong rhetorical move to keep: "Why wouldn't you do it privately?" and "why should I build the app if I could build the primitive?" A question that makes the obvious choice obvious. At most one per page.

Claim Style
- Hedged about self ("I don't know", "I think"), firm about principle ("never an 'I know better'").
- Brand keeps the firmness and drops the hedging. Claims are sharpened by naming the alternative and drawing a boundary, never with adjectives.

Preferred Moves
- Lead with a concrete, relatable scenario before any mechanism.
- Name the real alternative plainly (iCloud, Firebase, Anytype) and say where it falls short, without sneering.
- Draw the scope boundary out loud: "Conflict resolution is yours. We don't touch it."
- A plain imperative pitch: "Don't give up on privacy. Use this."
- A shared-pain zinger, sparingly: the developer-to-developer "yes, that part is a pain" moment (the founder's "pain in the ass" becomes "that's the painful part" in docs).
- Plain words first, the term of art second: "the relay only ever sees ciphertext (encrypted bytes)".

Banned Moves
- Know-it-all tone, lecturing, or implying the reader should already know. (Founder: "never an 'I know better'".)
- Jargon walls, or anything that "needs a doctorate".
- Anti-trust sermons ("trust no one") (10_purpose-why).
- Absolute security bravado. The public sample's "Not 'shouldn't', not 'promises not to', *can't*" plus "That's it." overclaims (the relay sees metadata; ADR-0024 and ADR-0031). Keep the cadence only for claims that are fully true, such as "The relay can't read your messages."
- "Zero-trust", "zero-knowledge", "no communication graph", "cryptographic guarantee", "anonymous", "military-grade", bare "secure".
- Hype adjectives, exclamation marks, emoji in docs.
- Tag questions ("right?"), hedges ("I think", "basically"), "blah blah".

CTA Rules
- One plain CTA per page, as a verb and an object: "Pair two devices", "Run the relay". Never "Get started today!"

Channel Notes
- Home page: the most voice. One shared-pain zinger allowed. Hero is imperative (positioning line A).
- Quickstart: brisk second person, numbered steps, no humour except maybe one line at the finish.
- Concepts / guides: example-first explanation, plain terms before jargon, boundary statements.
- Threat model / security: flat, exact, no humour, no rhetoric. Each claim is tied to a test.
- Errors, CLI output, API docs: literal and actionable. Say what happened and what to do; no jokes.
- README: the home-page voice at half volume. Link to the threat model rather than making claims.
- X / social: founder's first person is fine. Conversational, one idea per post. Same claim bans.
```

### Before / after (current intro rewritten)

**Current:** "The server can't read your data. Not 'shouldn't', not 'promises not to', *can't*. Compromise the relay completely and an attacker walks away with ciphertext and some recipient public keys. That's it."

**TrueSeal voice (first draft, superseded in Synthesis):** "The relay can't read your messages. Not 'shouldn't', not 'promises not to', *can't*. It does see some things: who's online, when, and roughly how much. [Here's the full list.](/trust/threat-model)"

### Anti-AI rule (founder addition)

- The profile is confirmed, with an explicit anti-AI rule added to Banned Moves (see Synthesis).
- Self-correction: the "after" example above used a via negativa parallel ("Not 'shouldn't', not 'promises not to', *can't*"). That now violates the rule and is rewritten in the Synthesis.

### How to say "free"

- The primary idea is **privacy for free, by default** (free in effort).
- The supporting line spells out cost: "Free to use, free to host, and about ten lines to add."

## Synthesis

### Voice in one line

Clear enough for any developer, exact enough for a cryptographer, and written by someone who has felt the same pain.

### Voice principles

1. **Clear before clever.** Plain words first, and a term of art only after it's been said plainly.
2. **Example first.** A real scenario before a mechanism.
3. **Say the boundary.** State what TrueSeal does, what it doesn't, and what's yours.
4. **Honest to the letter.** Every claim is true as written and linked to its limits. Never broader than the tests.
5. **Rationed humour.** At most one shared-pain line per page, and none in security, reference or error text.
6. **Never "I know better".** No lecturing, no gatekeeping, no fear.

### Anti-AI rules (hard bans across every channel)

- **No em dashes.** Use a period, comma, colon or parentheses.
- **No "This is not X, it's Y"** contrast framing, including "not just X", "X, not Y" slogans, and "less X, more Y".
- **No via negativa parallels.** No "Not A. Not B. C." or "no X, no Y, no Z" litanies as rhetoric. (A plain factual list of what the relay doesn't store is allowed as a table or bullets.)
- **No mixed metaphors**, and at most one metaphor per page, followed through.
- **No emoji as a crutch.** None in docs, READMEs or UI copy.
- **No verbose, structured rambling.** No headers-and-bullets padding around a two-sentence answer, and no recap paragraphs.
- **No LinkedIn staccato.** No one-sentence-per-line drama or cliff-hanger fragments.
- Also carried from the profile: no hype adjectives, no exclamation marks, no bait questions, and no "Excited to share".

### Tone map

| Surface | Voice level | Humour | Notes |
|---|---|---|---|
| Home page | Full | One line max | Imperative hero (positioning A) |
| Quickstart | Brisk | Maybe one line at the finish | Second person, numbered |
| Concepts / guides | Warm, plain | Rare | Example first, boundary statements |
| Threat model / security | Flat, exact | None | Every claim is linked to a test |
| API reference / errors / CLI | Literal | None | What happened, what to do |
| README | Half volume | Rare | Links to the threat model instead of claiming |
| Social (founder) | First person | Allowed | Same bans |

### Before / after (corrected)

- **Current intro:** "The server can't read your data. Not 'shouldn't', not 'promises not to', *can't*. Compromise the relay completely and an attacker walks away with ciphertext and some recipient public keys. That's it."
- **TrueSeal voice:** "The relay can't read your messages. It does see some things: which inboxes are online, when messages arrive, and roughly how big they are. [Here's the full list.](/trust/threat-model)"

### Word list

- **Use:** private, end-to-end encrypted, primitive, pair, relay, your devices, ciphertext (encrypted bytes), self-host.
- **Avoid:** zero-trust, zero-knowledge, military-grade, bank-grade, bare "secure", anonymous, unbreakable, seamless, effortless, revolutionary, blazing fast, leverage, empower, "no communication graph", "cryptographic guarantee".

### Open questions

- The authorship of the current docs introduction is unconfirmed. It affects how canonical the "public voice" sample is.
- Whether "free in effort" is phrased as "free" alone (ambiguous with cost) or "effortless" (banned as hype). Settle in 90_SYNTHESIS copy.
