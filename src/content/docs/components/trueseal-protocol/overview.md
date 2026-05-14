# trueseal-protocol — Overview

trueseal-protocol is the wire protocol specification for the TrueSeal ecosystem. It defines how any sync client communicates with any relay. It is pure documentation — no code, no library, no repository dependency.

Any relay that implements trueseal-protocol accepts any client that implements trueseal-protocol. Any client that implements trueseal-protocol works against any relay. The spec is the contract. The implementations are interchangeable.

## What trueseal-protocol Defines

- **Wire framing** — the byte layout of every message on the wire
- **Message types** — Push, Deliver, Heartbeat, Ack, Error — their byte tags and semantics
- **Push body layout** — how a sender addresses a blob to a recipient
- **Ack semantics** — what Ack means and what it guarantees
- **Error semantics** — permanent rejection, non-retryable
- **Protocol-level envelope size maximum** — enforced by both client and relay

## What trueseal-protocol Does Not Define

- Relay storage policy — TTL, reap interval, infrastructure choices
- Noise handshake patterns — defined by the [Noise Protocol spec](https://noiseprotocol.org/), used by implementors
- Envelope format and sync semantics — defined by trueseal-sync
- Client-side delivery guarantees — outbox, replay, ordering

## Current Implementors

**trueseal-sync** — client-side implementation. Opens Push Sessions to send blobs, Receive Sessions to receive them.

**trueseal-relay** — server-side implementation. Accepts Push and Receive Sessions, routes blobs between devices.

See [Wire Format](./wire-format.md) for the full specification.
