# 30. Audience & Niche

Status: done (2026-09-29)
Participant: julian

## Inputs (paraphrased)

### First answer: breadth

- The founder sees the audience as horizontal: anyone whose devices or users exchange data. The argument is "sync comes for free, so why wouldn't it be private?"
- Use cases named: secret sharing, location sharing, sensitive information.
- **Fact check: "website" isn't a supported target.** The TS SDK is Node/Electron via napi-rs (trueseal-sync-ts README; ADR-0030 targets Node 20+ on macOS, Linux and Windows). The relay speaks raw TCP with Noise, which browsers can't open. Browser support would need WASM plus a WebSocket or WebTransport relay listener, which is a scope decision and not a brand one. Until then, copy says "apps" (iOS, Android, macOS, desktop and Node), never "websites".
- Fit check: "users" works within limits. A group is at most 32 devices, and admission is explicit pairing by an existing member (ADR-0027, ADR-0023). That's suited to small, trusted circles (me and my devices, a family, a small team), not open multi-user networks.

### Flagship use case

- **Location sharing is the candidate flagship example.** It was discovered in this interview, not planned.
- Why it fits:
  - Small trusted circles (a family, well within the group limit).
  - Small, frequent payloads (far under 60 KiB).
  - Obviously sensitive, and it needs no explanation.
  - A well-known contrast: mainstream family-location apps have been reported selling location data to brokers (Life360, reported by The Markup in Dec 2021; verify before citing publicly).
- An honest limit to carry: frequent location pushes make activity timing visible to the relay (ADR-0024 fan-out, and size/timing are a documented limitation). The relay can see *when* devices send updates (which may hint at movement), never *where* they are.

### First builder

- **The first builder is an indie developer.** This matters because it sets how the brand speaks and what it proves first:
  - speed to a working demo;
  - quickstarts;
  - free and self-hosted;
  - honest limits.
- Enterprise concerns (SLAs, compliance, support) wait, and that matches the developer preview's no-support stance.

### Anti-audience confirmed

- Browsers are "not yet", not "never".
- "Open groups" is the founder's term, meaning groups anyone can join without admission.
- Don't use the 32-device cap in brand copy. It's an arbitrary current limit. (The reference docs and threat model may still state the current value as a tested limit.)

## Synthesis

### Ideal first customer (ICP)

- **Who:** an indie developer (solo or two people) shipping a mobile or desktop app where a small, trusted circle exchanges sensitive data.
- **Flagship scenario:** family or friends location sharing. Others include secret or password sharing between one's own devices and personal clip or notes sync (Hush).
- **Trigger:** they need sync and have been about to settle for an unencrypted backend.
- **What they value:** a working demo in an afternoon, no bill, no account, a relay in one container, and the ability to tell their users "we can't see your data".
- **Why indie first:** indies ship fast, care visibly about privacy as a feature, and match the preview's no-support, allowed-to-break status.

### Not for (anti-audience, confirmed)

- Browser and web apps, **not yet**.
- Open groups that anyone can join without explicit admission.
- Apps that need the server to read data (search, analytics, moderation, server-side business logic).
- Teams needing SLAs, compliance attestations or vendor support (post-preview).
- People who need network-level anonymity (pending the IP decision).

### Candidate audience lines

A. "For developers who'd rather not ask their users to trust them."
B. "Built for indie developers shipping private apps without a backend team."
C. "If your app shares something personal between a few devices, it should be private. Now it can be."

### Open questions

- Browser support is a potential map decision (not filed; the founder hasn't asked for it).
- "Anyone" (the founder's instinct) versus "indie first" (the brand focus) isn't a contradiction. The brand is broad in *why* and specific in *who it shows*.
