# Sync Groups

A Sync Group is the set of devices that share data. Every blob sent by any member is delivered to every other member. Membership is not implicit — it is defined by a signed document called the Group Manifest, which every member holds and every member can update.

## The Group Manifest

The Group Manifest is the authoritative, versioned record of who belongs to a Sync Group. It contains:

- A stable **Group ID** — a random identifier generated when the group is first created. Never changes, even as membership evolves.
- A **version number** — a monotonically increasing integer that increments on every membership change.
- The **member list** — every current member's noise public key and signing public key.
- The **issuer** — the signing public key of the member who produced this version.
- A **signature** — an Ed25519 signature over the group ID, version, and member list, made by the issuer.

Any current member can issue a new manifest version. There is no admin, no coordinator, no device with elevated authority. Authority derives from membership — if you are in the current manifest, you can issue the next one.

## Validity and Convergence

When a device receives a new manifest, it accepts it if:

1. The signature is valid.
2. The issuer is a member of the device's current manifest — the update came from someone who was legitimately a member at the time of issuance.
3. The version number is strictly higher than the current version.

If two members simultaneously issue conflicting manifest updates — for example, device A removes device B at the same moment device C adds device D — both updates propagate through the group. The higher version number wins. Membership converges to a consistent state without any consensus protocol.

## Sending to the Group

When a device calls `send()`, trueseal-sync reads the current Group Manifest to determine who to send to. It produces one encrypted blob per member — each addressed individually to that member's noise public key. The relay receives N independent blobs and routes each to the appropriate recipient's Inbox.

The relay has no concept of the group. It sees N blobs addressed to N public keys. It does not know those blobs are related, or that the senders and recipients share a group membership.

## Receiving and Filtering

Every inbound blob is verified against the current Group Manifest. If the sender's signing public key is not in the manifest, the blob is silently discarded — even if the Ed25519 signature itself is valid. Valid signature from an unknown device is not enough. The device must be a member.

This is how soft removal takes effect. When a device is removed from the manifest, remaining members update their local copy and begin discarding that device's messages. The removed device can still push blobs to the relay — the relay accepts them, because the relay enforces nothing about sender identity — but every recipient discards them silently on receipt.

## Joining the Group

A new device joins through the Pairing ceremony (see [Pairing](./pairing.md)). Once the initiating device calls `accept_member()`, two things happen:

1. The current manifest is sent to the new device, giving it an immediate, complete view of the group.
2. A new manifest version is issued that includes the new device, signed by the admitting device, and pushed to every existing member.

The new device is in the group from the moment the manifest update is delivered. There is no convergence lag — every existing member receives the same authoritative document.

## Offline Members

A device that is offline when a manifest update is issued will receive it when it reconnects, via the relay's deferred delivery. Until then, it operates with a stale manifest:

- It will not send blobs to newly added members.
- It will not filter messages from newly removed members.

This is a narrow and temporary inconsistency. The moment the device reconnects, it receives the queued manifest update and immediately converges to the current state.

## Sequence Numbers

Every envelope a device sends carries a global sequence number — a monotonically increasing counter scoped to that device, not to any individual object. It increments once per envelope, across all objects.

The sequence counter is global — not per-object — for one key reason: object IDs are caller-defined data that must never be visible to the relay. They live inside the encrypted payload. A per-object counter would require the envelope header to carry object context, leaking information to the relay. A global counter keeps the header clean.

The sequence number is not used for recipient-side gap detection. Reliability is the sender's responsibility — undelivered blobs live in the sender's outbox and are replayed in order on reconnect. The recipient receives blobs in arrival order and delivers them to the caller as they arrive.

<!-- TODO: diagram — group manifest structure, send fan-out to N members, manifest update propagation -->
