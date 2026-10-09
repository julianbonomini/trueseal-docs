---
title: License
description: Every TrueSeal component is licensed under Apache 2.0. What that lets you do, and why TrueSeal chose it.
---

# License

Every TrueSeal component is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0): trueseal-noise, trueseal-sync, trueseal-relay, and the Swift, Kotlin and TypeScript SDKs.

Copyright 2026 Julian Bonomini.

## What it lets you do

| Question | Answer |
|---|---|
| Can I use TrueSeal in a commercial product? | Yes |
| Can I change TrueSeal and keep my changes private? | Yes |
| Can I run a relay as a service for others? | Yes |
| Do I have to contribute anything back? | No |
| Am I covered against patent claims from contributors? | Yes, through the license's patent grant |

You must keep the license and copyright notices in what you ship, and mark files you changed. The license text has the full terms.

## Why Apache 2.0

TrueSeal exists so that adding privacy to an app costs as little effort as possible. A license that sends a developer to their legal team works against that, so I picked a permissive one. Anyone can ship TrueSeal inside a closed-source product with no obligation to give anything back, and I'm fine with that, because every app that uses it is one more app whose data the server can't read.

The patent grant matters for cryptographic code. A contributor can't later sue a user over a patent that covers their own contribution.

I considered a copyleft license for the relay and decided against it. It wouldn't protect your users. The relay can't read or forge messages whatever code it runs, because devices seal and sign every message before sending it. What a modified relay could do is log more of the metadata it already sees, or drop and delay messages, and a copyleft license wouldn't stop that either, since nobody outside can check which code a relay is running. The protection comes from the encryption on the device, so the license only has to keep adoption easy.
