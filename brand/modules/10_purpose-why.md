# 10. Purpose / Why

Status: done (2026-09-29)
Participant: julian

## Inputs (paraphrased)

### Correction to known visual inputs (2026-09-29)

- Monochrome is not a personal preference. It is justified by "primitive". Monochrome plus one accent colour is open.
- Square corners and the blinking cursor are justified by "primitive" and "developer thing".
- Rounded corners: no. Gradients: acceptable if used with purpose (not a hard ban).

### Origin moment

- The trigger was leaving Apple's walled garden. The founder wanted a cross-device clipboard with history. Apple's Universal Clipboard has no history, and none of the many third-party clipboard apps felt trustworthy.
- Instead of building one more app that asks for trust, the founder chose to build the primitive, so any developer could get the same privacy for their own use case.
- What excited the founder was multiplying privacy across other people's products, not the clipboard itself.

### Root driver (ladder 1)

- There's no triggering incident. It's a matter of temperament: "trust us" is not an acceptable basis.
- Engineering craft is enjoyment, not purpose. It is the "how", not the "why".
- The root purpose is to make privacy free and easy for anyone who wants it.

### What privacy costs today (ladder 2)

- The three costs today are: (1) trusting a corporation, (2) trusting code you can't run yourself, and (3) existing private sync engines are opinionated and shaped around their own app (Anytype is the example).
- Self-hosting a relay is not easy anywhere else. Running it yourself is part of the promise.
- There's a sharp boundary: TrueSeal does pairing, sync, messaging and versioning privately; the app owns conflict resolution and its data model. "I don't care" is a deliberate refusal of scope, not indifference.
- There's a candidate competitive contrast: Anytype (any-sync), a private sync engine bent around note-taking.

### Obituary probe

- The obituary frame didn't land (it's a personal project with no horizon), but it surfaced the core value: **privacy as agency**. The person decides when to share.
- "Privacy is important even if you don't care about it" means privacy is the default, not a feature you opt into.

### Choosing a formulation

- **B chosen.**
- A and C were rejected for a principled reason: "don't trust anyone" is self-undermining when TrueSeal itself asks to be trusted. The brand must not use anti-trust rhetoric. It frames privacy positively, as agency.
- The IP gap was raised as a possible product change, and it is handled as a separate scope decision (see Open questions).

### Purpose statement reopened

- B is rejected on reflection. "Deciding what you share" frames TrueSeal as a sharing tool. The real use is keeping data **between your own devices and the people you chose**, and away from everyone in between.
- Refinement of the agency value: it's not *whether* to share, but *who can read it*. The circle is yours to draw.

### Final pick

- Chosen over E ("Sync with your devices and no one else") and F ("Only the devices you choose can read it").

## Synthesis

### Golden Circle

- **Why:** Everyone should decide what they share and when. Privacy is power, and it should be the default, not a privilege for people who can afford to trust or build.
- **How:** An unopinionated primitive you can run yourself, where the relay is never trusted with content. It does the hard, shared part (pairing, sync, messaging, versioning) and deliberately nothing app-specific.
- **What:** End-to-end encrypted device sync SDKs for Swift, Kotlin and TypeScript, plus a self-hostable relay.

### Core values surfaced

1. **Proof over promise.** "Trust us" is not good enough for the founder. But the brand doesn't preach distrust, because TrueSeal also asks to be trusted. It shows its evidence instead (a threat model with claims tied to tests).
2. **Privacy as agency.** You draw the circle of who can read your data. Everyone outside it, including the relay, sees ciphertext.
3. **Privacy for free.** Remove the cost (trusting a vendor, trusting code you can't run, adopting someone else's opinions) so any developer can pass privacy on to their users.
4. **Primitive, not product.** A hard scope boundary. What's app-specific belongs to the app.
5. Craft (enjoying hard problems) is how the founder works, not the brand's purpose. Keep it out of the purpose statement.

### Purpose statement (chosen: D)

> **What's yours stays between your devices. TrueSeal is the private sync primitive any app can build on.**

This replaces B ("You decide what you share..."), which was rejected because TrueSeal is chosen for what you *don't* share. Agency means drawing the circle of who can read your data, not deciding whether to share.

The claim boundary: "stays between your devices" refers to content. The relay can't read or forge messages, but it does see metadata (ADR-0031). Copy that expands the line must not imply that metadata is hidden.

### Candidate purpose statements (considered)

A. "Privacy shouldn't require trust. TrueSeal makes it free for every developer to give their users."
B. "You decide what you share. TrueSeal is the private sync primitive that lets any app keep that promise."
C. "Stop saying 'trust us'. TrueSeal is private device sync you can run yourself and build anything on."

### Contradictions / open questions

- **The word "anonymous" conflicts with the threat model.** The founder frames privacy as "private and anonymous", but ADR-0031 and the map rule network-level anonymity out of scope: the relay sees IPs and timing, and co-membership is inferable via push fan-out (ADR-0024). The brand can promise confidentiality and agency, **not anonymity**. Copy must say "private", never "anonymous".
- "Privacy for free" has two meanings: free as in cost (Apache-2.0, self-hostable) and free as in effort (the developer gets it without doing crypto). Both are intended, and this needs one phrasing in 50_voice-tone.
- There's no origin story beyond the clipboard frustration. The Hush clip history is the natural story seed for 60_narrative-story.

- **Founder wants the relay to never see IPs.** This reopens an out-of-scope item on the roadmap map ("Hiding network-level identity"). The relay already never reads, stores or keys state on IPs (trueseal-relay ADR-0012), but the TCP connection exposes the IP to the host. Hiding it needs an extra network hop. This is a scope decision that doesn't block the brand. Until it's settled, copy may say "the relay doesn't record or use your IP", never "the relay can't see your IP".
