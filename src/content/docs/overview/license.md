---
title: License
description: All trueseal components are licensed under Apache 2.0. Why that license, and what it lets you do.
---

# License

Every trueseal component — **trueseal-noise**, **trueseal-sync**, **trueseal-relay** — is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

Copyright 2026 Julian Bonomini.

## Why Apache 2.0

**Maximum adoption is the goal.** trueseal exists to make privacy the path of least resistance. A license that creates friction — legal, commercial, or anything else — fights that goal. Apache 2.0 doesn't create any.

**Anyone can use it, for anything.** Individuals, startups, big companies — all free to use, modify, and ship trueseal inside proprietary products, with no obligation to give anything back. That's deliberate. More products built on trueseal means more encrypted data in the world. That's the win, and that's the only metric I care about here.

**Copyleft on the relay would be theatre.** It's tempting to think a stricter license on trueseal-relay would protect users by forcing operators to publish their source. It wouldn't. trueseal doesn't rely on the relay for confidentiality or integrity, or even on it being the code it claims to be. Everything is encrypted on the device before it gets near the relay. An adversary can fork it, modify it, hide the changes — none of it lets the relay read or forge messages. The encryption is the guarantee, not the source code. A copyleft relay would add friction without adding any security.

**Patent protection is built in.** Apache 2.0 includes an explicit patent grant: contributors can't later turn around and sue users over patents that show up in their own contributions. That matters a lot for cryptographic code (trueseal-noise implements the Noise Protocol Framework). It also clears one of the most common adoption blockers inside corporate legal teams.

**No lock-in, license-level.** The manifesto says any relay works, you can run your own, you don't depend on us. The license has to match: no strings, no mandatory trust in any operator — us included.

## Summary

| Question | Answer |
|---|---|
| Can I use trueseal in a commercial product? | Yes |
| Can I modify trueseal and not publish my changes? | Yes |
| Can I run a hosted service on trueseal? | Yes |
| Do I need to contribute back? | No |
| Are patent rights covered? | Yes — Apache 2.0 grants them explicitly |
