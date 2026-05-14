# The Dumb Relay

The relay is infrastructure, not a service. It moves encrypted blobs from senders to recipients. It does not understand what it moves, who sent it, or why. This is not a limitation — it is the design.

## What "Dumb" Means

A traditional sync server is smart: it knows your account, your devices, your data model. It can enforce permissions, resolve conflicts, and answer queries. It can also read your data, hand it to a third party, or be compelled to produce it under legal pressure.

The TrueSeal relay is deliberately stripped of all of that. It has no concept of users, groups, or relationships between devices. It receives blobs addressed to a public key, stores them if the recipient is offline, and delivers them when the recipient connects. That is the entirety of its function.

This is the zero-trust property made concrete. The relay is not trusted because it is not capable of betraying that trust. There is nothing to betray.

## What the Relay Holds

The relay holds exactly one thing per device: an **Inbox** — a set of undelivered blobs addressed to that device's public key. The inbox exists only as long as there are undelivered blobs. When a blob is delivered, it is deleted immediately. When a device reconnects, its inbox is flushed and cleared.

Blobs that are never delivered — because the recipient device is permanently offline, lost, or abandoned — are reaped after a TTL. The relay is a delivery buffer, not a durable log.

## What the Relay Knows

Relay knowledge is minimal by design:

- **Which noise keys have active connections** — unavoidable. The relay needs this to deliver blobs immediately to online devices without polling.
- **The recipient public key per blob** — unavoidable. The relay needs this to know which inbox to place a blob into.

That is all. The relay does not know:
- Who sent any blob. Push connections use anonymous ephemeral keypairs — the sender is unlinkable.
- Which devices belong to the same group. The relay has no concept of groups.
- What any blob contains. Every blob is encrypted before it reaches the relay.

An operator running the relay can observe which public keys are receiving blobs and when. They cannot observe what is in those blobs, who is sending them, or which keys are communicating with each other.

## Self-Hosting and Operator Trust

Because the relay is zero-knowledge, the question of who operates it is irrelevant to the security model. You can use a public instance, run your own on a $5 VPS, or point trueseal-sync at any compatible relay. The security guarantees are identical in all three cases.

The relay has a long-term keypair of its own. Connecting devices verify the relay's identity via the Noise XX handshake — the device confirms it is talking to the correct relay before sending anything. How the relay's public key reaches users is the operator's responsibility: it can be baked into a client binary, published on a landing page, or distributed as a QR code. The relay does not manage its own discovery.

## The Relay Is Always in the Path

For remote sync, the relay is always in the path. There is no peer-to-peer mode, no NAT traversal, no STUN or TURN. Devices connect outbound to the relay, and the relay bridges them.

This is a deliberate design decision. P2P remote sync requires NAT traversal to reach devices behind home routers, corporate firewalls, and mobile carrier networks — and when hole-punching fails, a TURN fallback relay is required anyway. P2P also requires both devices to be online simultaneously, which eliminates store-and-forward delivery. And device discovery requires a signalling server — which is a relay by another name.

The TrueSeal relay solves all three problems in one component. Because it is zero-knowledge, the privacy cost is minimal: the operator learns which public keys are active, nothing else. The security model is identical whether the relay is run by a trusted friend or an active adversary.

<!-- TODO: diagram — relay inbox model, what operator sees vs what is hidden, self-host deployment -->
