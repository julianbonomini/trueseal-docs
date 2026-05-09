# Future Directions

Speculative ideas that are out of scope for now but worth preserving. None of this is planned. All of it is interesting.

---

## Selective Replication

Today every group member receives every blob. A future primitive could support partial subscriptions — a device receives only the blobs it holds a capability for.

The mechanism maps naturally onto the existing addressed encryption scheme: the recipient key IS the capability. Hold the key, decrypt the blob. Don't hold it, the blob is noise. No identity system, no ACL, no central authority.

The pieces needed:
- **Object capabilities** — a blob addressed to a sub-key rather than a device key. The device holds that sub-key as a capability grant.
- **Topic capabilities** — a key that unlocks a class of blobs (a namespace, a channel, a data type). Devices subscribe to a topic by holding its key.
- **Sub-key distribution** — how does a device receive a new capability without a full pairing ceremony? Needs a composable key distribution mechanism (similar in spirit to UCAN or Macaroons, but without a central issuer).

The hard problem is key distribution at granularity finer than group membership. Pairing solves it coarsely today. Fine-grained capability distribution without identity is unsolved at this layer.

**Why this matters:** selective replication without identity or ACL systems is what turns hush from a sync primitive into an encrypted replication layer beneath applications — approaching secure distributed databases, local-first infrastructure, and encrypted event systems. A very strong position if achieved without compromising the anonymity and zero-trust principles.

---

## LAN Sync

Direct device-to-device sync on the same network, bypassing the relay entirely. No NAT traversal problems on a LAN — direct connections are trivial. The relay remains the fallback for remote sync.

Requires: local device discovery (mDNS or similar) and a direct connection path using the existing hush-noise session infrastructure.

---

## Outbox TTL / Bounded Accumulation

Configurable TTL on outbox entries, or a max outbox size with oldest-first eviction. Prevents indefinite accumulation on the sender's device when a group member goes permanently offline or is lost.

See the open question in the delivery guarantees docs.

---

## Short Authentication String (SAS) for Pairing

A visual confirmation step after the QR-based key exchange: both devices display a short code, the user confirms they match. Closes the interception window that exists in the current explicit-accept-only v0 pairing flow.

---

## PAKE for Keyboard Pairing

For devices without cameras — headless servers, devices in different rooms — a keyboard-entry pairing path using SPAKE2 or similar. Required if a low-entropy shared secret (e.g. a 6-digit code) is ever used as the pairing mechanism. Cannot be bolted on cosmetically — must be implemented correctly or not at all.
