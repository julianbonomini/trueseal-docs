---
title: Principles & Boundaries
description: The non-negotiable principles that drive every design decision in trueseal — and the deliberate boundaries that keep the primitive sharp.
---

# Principles & Boundaries

trueseal is opinionated by design. Every decision in the stack traces back to a small set of non-negotiable principles. Understanding them is the fastest way to know whether trueseal is the right primitive for what you are building — and exactly what you are getting when you use it.

## Principles

### Zero Trust

The relay cannot read your data. Not because it promises not to — because it is structurally incapable of doing so.

Data is encrypted on device before it moves anywhere. The relay receives ciphertext addressed to a recipient's public key. It has no decryption keys, no access to plaintext, and no knowledge of what it is routing. An adversary who fully compromises the relay — captures the binary, reads the database, intercepts every packet — gains nothing but encrypted blobs.

This is not a configuration option. It is the only mode of operation.

### Anonymity

trueseal has no concept of human identity. There are no accounts, no registration, no email addresses, no usernames, no phone numbers.

A device is identified by a keypair — a long-term X25519 public/private key pair generated locally on first launch. The public key is the device's identity. Who owns that device is never part of the protocol. trueseal is designed so that it cannot know who you are, not just that it chooses not to.

This extends to communication metadata. Every push to the relay is made over a short-lived, anonymous connection established with a fresh ephemeral keypair — the relay authenticates itself to the sender, but never learns the sender's identity. The relay knows a blob is addressed to a recipient, but not who sent it. No communication graph can be constructed, even by an operator watching every packet.

### Fault Tolerance

The primitive must survive the environment it runs in.

Devices go offline. Networks drop. Processes crash. Batteries die. trueseal treats all of this as normal operating conditions, not exceptional cases. Any device can be absent for an indefinite period and return fully current — no human intervention, no manual reconciliation, no data loss.

Undelivered blobs are held by the relay until the recipient reconnects, and stored in the sender's local outbox until confirmed delivered. The system heals itself.

### Guaranteed Delivery

A blob sent will reach every group member. Eventually, unconditionally.

This is not best-effort. It is a contract. Without it, sync is not sync — it is a pipe that sometimes works. trueseal combines relay-side deferred delivery with sender-side outbox replay to ensure that no blob is silently lost, regardless of which devices are online at the time of sending.

### Revocability

No device has permanent access. Any current member can remove another member from the group at any time. When the threat is routine — a new phone, a decommissioned device — removal is cooperative: the device is excluded from the Group Manifest and its future blobs are filtered. When the threat is a security incident — a stolen or compromised device — removal is cryptographic: every device rotates its keypair, and the compromised device's old address becomes a permanent dead end.

The mechanism must match the threat. Cooperative removal is fast and cheap. Cryptographic removal is the nuclear option — it costs a full re-pair, and that cost is the honest price of a hard guarantee.

### No Lock-In

Any deployed relay instance works. You can run your own. You can use someone else's. You can switch between them.

The security model does not change based on who operates the relay — because the relay's trustworthiness is irrelevant by design (see Zero Trust above). There is no hosted-only feature, no proprietary protocol, no dependency on a specific operator. The relay is a commodity piece of infrastructure.

---

## Boundaries

### Not Peer-to-Peer

Devices never connect directly to each other — not for remote sync, not for LAN sync. The relay is always in the path.

This is a deliberate decision, not a limitation. P2P remote sync requires NAT traversal (STUN, TURN) to punch through home routers, corporate firewalls, and mobile carrier networks — and when NAT traversal fails, TURN is a relay anyway. And it requires a signalling server for discovery, which is a relay with less honesty about what it is.

The trueseal relay solves those problems cleanly. Always-in-path eliminates NAT complexity. And because the relay is zero-knowledge, the privacy tradeoff is minimal — the operator learns which public keys are online, nothing else. LAN sync may bypass the relay in a future version. Remote sync will not.

### Not Real-Time

trueseal is not a streaming primitive. There are no WebSockets, no sub-second delivery guarantees, no presence signals, no typing indicators.

This is background sync with strong delivery guarantees. The design optimises for correctness and privacy, not latency. If you need a live channel, trueseal is the wrong layer.

### Not Conflict Resolution

trueseal guarantees that every device receives every blob, in order, eventually. What you do when two devices send conflicting data while offline is your responsibility.

trueseal does not pick a winner. It does not merge. It does not have opinions about your data model. Delivery and ordering are the contract. Divergence handling belongs in the layer above.

### Not an Identity System

trueseal has no accounts, no human-readable names, no notion of a user across devices. A device is a keypair. That is the entirety of its identity in the protocol.

Associating a human to a device — display names, multi-device accounts, social graphs — is the caller's problem. trueseal provides the transport. Identity is yours to build.

### Not a Durable Log

The relay is a delivery buffer, not storage. Blobs are deleted on delivery.

If your application needs a full history of all blobs ever sent, that is the caller's responsibility to maintain locally after receiving.

### Not a Platform

There are no permission hierarchies, no admin roles, no moderation primitives, and no hosted-only features. Any current group member can do anything any other member can do. No device has elevated authority.

If you need an admin who can remove members but cannot themselves be removed, build that above this primitive. trueseal is the floor, not the ceiling.
