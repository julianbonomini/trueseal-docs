---
title: Architecture
description: How the trueseal stack fits together — trueseal-noise, trueseal-sync, trueseal-relay, and the trueseal-protocol spec that binds them.
---

# Architecture

trueseal is three independent components bound together by a shared wire protocol specification. Each component can be understood, deployed, and replaced in isolation. Together they form a zero-trust sync stack where no single component is a point of failure — or a point of trust.

## Components at a Glance

**trueseal-noise** is the cryptographic transport layer. It implements the [Noise Protocol Framework](https://noiseprotocol.org/) — the same foundation as WireGuard and Signal. It knows nothing about sync, devices, or groups. It produces encrypted, authenticated, forward-secret channels between two peers. That is its entire job.

**trueseal-sync** is the sync engine. It owns device identity, pairing, group membership, envelope construction, addressed encryption, the operation log, and outbox replay. It uses trueseal-noise for live sessions to the relay. It has no opinion about what the bytes inside a blob mean — that is the caller's domain.

**trueseal-relay** is the infrastructure. It accepts connections from devices, stores ciphertext blobs addressed to offline recipients, and delivers them when those devices reconnect. It never decrypts anything. It has no concept of groups, users, or relationships between devices.

**trueseal-protocol** is the wire protocol specification that governs all communication between sync clients and relays. It is pure documentation — no code, no library. It defines wire framing, message types, push body layout, Ack and Error semantics, and the protocol-level envelope size limit. Any client that implements trueseal-protocol works against any relay that implements trueseal-protocol.

## Responsibilities

| Concern | Owner |
|---|---|
| Noise Protocol handshakes | trueseal-noise |
| Encrypted transport channels | trueseal-noise |
| Device identity (keypair generation, persistence) | trueseal-sync |
| Pairing ceremony | trueseal-sync |
| Group manifest (membership, versioning) | trueseal-sync |
| Envelope construction and addressed encryption | trueseal-sync |
| Operation log and outbox replay | trueseal-sync |
| Blob routing and deferred delivery | trueseal-relay |
| Blob retention and TTL reaping | trueseal-relay |
| Wire protocol specification | trueseal-protocol |

## What the Relay Sees

The relay operates with minimal information by design. It learns exactly two things:

- **Which noise keys have an active Receive Session** — unavoidable, required to deliver blobs to online devices immediately on arrival.
- **The recipient public key per envelope** — required for routing. The relay must know where to deliver a blob.

The relay does **not** learn:
- Who sent any blob — push sessions use a fresh ephemeral keypair per send, making the sender unlinkable.
- Which devices belong to the same group — the relay has no concept of groups.
- Anything about blob content — all payloads are encrypted with the recipient's public key before they leave the sender's device.

An adversary who fully compromises the relay — captures the binary, reads the database, intercepts every packet — learns which public keys received blobs, and nothing else.

## Data Flow: Sending a Blob

<!-- TODO: diagram -->

When a device calls `send()` on `TrueSealSession`:

1. **Read the Group Manifest.** trueseal-sync resolves the current list of member devices — their noise public keys and signing public keys.

2. **Construct one Envelope per recipient.** For each member, trueseal-sync:
   - Encrypts the payload using *addressed encryption*: an ephemeral X25519 key agreement with the recipient's static public key, producing a ChaCha20-Poly1305 ciphertext. The sender's `author_pub` (Ed25519 signing key) is prepended inside the plaintext — invisible to the relay.
   - Signs the envelope over `sequence || parent_hashes || recipient_pub || ciphertext` using the sender's Ed25519 signing key.
   - The result: a self-contained blob the relay can route (it knows `recipient_pub`) but cannot read or tamper with undetected.

3. **Open an anonymous Push Session to the relay.** trueseal-sync opens a Noise NK connection using a *fresh ephemeral X25519 keypair* generated for this push only. Noise NK authenticates the relay to the device — the device verifies the relay's static public key — but transmits no stable client identity. The relay sees an unlinkable ephemeral peer and cannot associate the push with any device or Receive Session.

4. **Send all N envelopes.** All envelopes for this push are sent over the same Push Session, then the session is closed.

5. **Relay stores and delivers.** For each envelope, the relay places it in the recipient's Inbox. If the recipient has an active Receive Session, the blob is delivered immediately. Otherwise it is held until the recipient reconnects.

6. **Outbox tracks delivery.** trueseal-sync marks each envelope in the local Operation Log as undelivered until the relay confirms receipt. If the sender goes offline before confirmation, undelivered envelopes are replayed on reconnect.

## Data Flow: Receiving a Blob

<!-- TODO: diagram -->

When a device connects to the relay:

1. **Open a Receive Session.** trueseal-sync opens a Noise XX connection using the device's stable noise keypair. The relay and device mutually authenticate. The relay registers this device as online and begins delivering blobs immediately on arrival.

2. **Relay delivers Inbox blobs.** All blobs held for this device are delivered over the Receive Session. Blobs are not deleted at this point — deletion is gated on DeliverAck.

3. **Client sends DeliverAck.** After durably persisting each blob, the client sends a DeliverAck with the blob's ID. The relay deletes the blob on receipt. If the session drops before a DeliverAck arrives, the blob survives and is re-delivered on the next Receive Session — clients must handle duplicates.

4. **Decrypt and verify.** For each received envelope, trueseal-sync:
   - Decrypts the payload using the device's private key.
   - Extracts `author_pub` from the first 32 bytes of plaintext.
   - Verifies the envelope signature using the extracted `author_pub`.
   - Checks `author_pub` against the current Group Manifest — blobs from devices not in the manifest are discarded.

5. **Fire the callback.** The decrypted, verified payload is delivered to the caller's `on_message` handler. The caller never handles keys, sessions, or verification.

## Pairing Flow

<!-- TODO: diagram -->

Before any sync can happen, two devices must exchange public keys. This is the Pairing ceremony:

1. The initiating device generates a **Pairing Token** — its noise public key and Ed25519 signing public key, encoded opaquely. It is passed out-of-band to the joining device (QR code, AirDrop, link, etc.).

2. The joining device reads the token and sends a `Pair` message — an envelope addressed to the initiator, encrypted with the initiator's public key, containing the joiner's own keys.

3. The initiating device receives the `Pair` message, fires `on_member_request`, and the caller calls `accept_member()` to admit the device.

4. A new **Group Manifest** is issued, signed by the accepting device, listing both members. It is pushed to all current members.

The relay is in the path for step 2 — the joiner addresses the `Pair` message to the initiator's public key, which the relay routes to the initiator's Inbox. The relay learns only that one blob was addressed to the initiator. It does not know the blob is a pairing request.

## Component Independence

trueseal-noise, trueseal-sync, and trueseal-relay are independently usable:

- **trueseal-noise** can be used as a standalone Noise Protocol library for any application that needs authenticated encrypted channels — with no dependency on the rest of trueseal.
- **trueseal-relay** is a generic encrypted blob router. Any client that implements trueseal-protocol can use it — trueseal-sync is one implementation, not the only one.
- **trueseal-sync** can target any relay that implements trueseal-protocol — a self-hosted instance, a community instance, or any future compatible implementation.
- **trueseal-protocol** is the contract that makes this possible. Relay and client implementations are interchangeable as long as both speak the spec.
