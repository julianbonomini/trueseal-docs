# hush-sync — Overview

hush-sync is a Rust library for E2EE, local-first sync between devices. It is the protocol authority of the hush stack — it owns the Envelope format, addressed encryption, pairing, group membership, and delivery guarantees. Drop it into any application and your data is encrypted before it leaves the device.

## What It Does

hush-sync manages the full lifecycle of syncing encrypted data between a group of devices:

- **Device identity** — generates and persists an X25519 noise keypair and an Ed25519 signing keypair on first launch. The caller never handles key bytes directly.
- **Pairing** — key exchange ceremony that establishes mutual trust between two devices. The library handles the cryptography; the caller handles the UX (QR code, AirDrop, etc.).
- **Group membership** — tracks which devices belong to the sync group via a signed, versioned Group Manifest. Any member can add or remove other members.
- **Addressed encryption** — encrypts every blob individually for each recipient device before sending. Only the intended recipient can decrypt.
- **Delivery** — pushes blobs to the relay, defers undelivered blobs in a local outbox, and replays them on reconnect.
- **Session state** — persists identity, manifest, and outbox in an embedded SQLite database. Survives process restarts, crashes, and OS kills.

## What It Does Not Do

hush-sync is a transport primitive. It does not:

- Interpret the bytes inside a blob — that is the caller's data model.
- Resolve conflicts — delivery and ordering are guaranteed, divergence handling is the caller's concern.
- Backfill history for newly joined devices — the caller decides what to send after `onMemberJoined` fires.
- Enforce permission hierarchies — any member can do anything any other member can do.

## Two API Layers

hush-sync exposes two layers:

**Session (`HushSession`)** — the opinionated facade. Wires all the primitives together, owns the relay connection, reconnection, group manifest, message dispatch, soft removal, and destroy group. This is what most callers use. UniFFI exposes it to Swift and Kotlin.

**Primitives** — `DeviceKeypair`, `Envelope`, `GroupManifest`, `OperationLog`, `Message`. Pure Rust, no lifecycle. For advanced callers: Go via C FFI, custom transports, testing.

## Session State

All durable state for a given namespace is stored in an embedded SQLite database managed entirely by the library. The caller never reads, writes, or migrates it. It comprises:

- **Device identity** — the device's two keypairs
- **Group Manifest** — the current, authoritative membership record
- **Operation Log** — all sent blobs and their delivery status (the outbox)

State is scoped by **namespace** — a string passed to `create()`. Most callers use the default namespace and never think about it. Multiple independent sessions can coexist in the same process by using different namespaces.

## Platforms

hush-sync is implemented in Rust. UniFFI generates Swift and Kotlin bindings automatically, enabling native iOS and Android integration without hand-written FFI glue. Go consumers use C FFI against the compiled static library.
