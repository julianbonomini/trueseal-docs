---
name: trueseal-fixture
description: A skill file whose every reference exists.
---

# Passing fixture

Read the [Limits](https://trueseal.dev/agents/limits.md) first.
See https://trueseal.dev/llms.txt.
Then [send](/agents/api#api-send) a message.

Open with `TrueSeal.open`, send with `trueSeal.send()`, and handle `groupFull{max}` and `sendFailed(messageId, reason)`.
Read `sdkVersion`, call `Subscription.cancel()`, and register `onMessage`.

The [Protocol Size Limit](/agents/limits#fact-protocolsizelimit) caps a body.
A full group fails with [groupFull](/agents/errors-and-events#error-groupfull).
Status changes arrive as [statusChanged](/agents/errors-and-events#event-statuschanged).
The handshake is [Noise](https://noiseprotocol.org/).
Paste it into `AGENTS.md`; the relay answers with `Sync`.

```ts
`fooBar()`
TrueSeal.opne()
```

<!-- [x](/nope) -->
