# License

All hush components — **hush-noise**, **hush-sync**, **hush-relay** — are licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

Copyright 2026 Julian Bonomini.

## Why Apache 2.0

**Goal: maximum adoption.** hush's purpose is to make privacy the path of least resistance. A license that creates friction — legal, commercial, or practical — works against that goal. Apache 2.0 removes all friction.

**Anyone can use it, for anything.** Individuals, startups, and large corporations can use, modify, and ship hush in proprietary products without obligation to contribute back. This is intentional. More products built on hush means more encrypted data in the world. That is the win.

**The relay is already zero-trust.** A stricter copyleft license on hush-relay might seem like it protects users — forcing relay operators to publish their code. But it doesn't. hush's security model doesn't rely on the relay being trustworthy or open. Data is encrypted on-device before it moves anywhere. An adversary can run the relay, modify it, and hide those changes. It doesn't matter. The encryption is the guarantee, not the relay's source code. Copyleft on the relay would only add friction without adding security.

**Patent protection baked in.** Apache 2.0 includes an explicit patent grant: contributors cannot later sue users for patents embodied in their contributions. This matters for cryptographic code (hush-noise implements the Noise Protocol Framework). It also signals safety to corporate legal teams — removing a common adoption blocker.

**No lock-in, by design and by license.** The manifesto says any relay instance works, you can run your own, no hosted dependency. The license matches: no strings attached, no mandatory trust in any operator, including us.

## Summary

| Question | Answer |
|---|---|
| Can I use hush in a commercial product? | Yes |
| Can I modify hush and not publish my changes? | Yes |
| Can I run a hosted service on hush? | Yes |
| Do I need to contribute back? | No |
| Are patent rights covered? | Yes — Apache 2.0 grants them explicitly |
