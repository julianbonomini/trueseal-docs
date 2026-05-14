# trueseal-relay — Overview

trueseal-relay is the infrastructure layer of the TrueSeal stack — a zero-knowledge delivery buffer that stores and forwards encrypted blobs between devices. It implements [trueseal-protocol](../trueseal-protocol/overview.md) on the server side.

## What It Does

trueseal-relay accepts two types of connections from devices:

- **Push Sessions** — a device opens a short-lived anonymous connection to deliver one or more blobs addressed to recipient public keys. The relay stores each blob durably and acknowledges receipt. The connection is closed when the device is done sending.
- **Receive Sessions** — a device opens a long-lived authenticated connection to receive blobs addressed to it. The relay delivers any pending blobs immediately on connection, then pushes new blobs as they arrive.

Blobs for offline recipients are held in the recipient's Inbox until they reconnect. On delivery, blobs are deleted immediately. Blobs that exceed the TTL without delivery are reaped.

## What It Does Not Do

trueseal-relay never decrypts anything, never learns group membership, and never knows who sent what to whom. It routes by recipient public key only. Blob content is never parsed, logged, or examined.

It is not a durable log. It is not a database. It is a delivery buffer — data lives in it only until it reaches the recipient.

## Storage

The relay persists accepted blobs durably across crashes and restarts until delivery or TTL expiry. The default storage backend is SQLite — zero external dependencies, suitable for single-node self-hosted deployments. A Postgres backend is planned for clustered deployments.

## Relay Identity

The relay has a long-term X25519 keypair. Connecting devices use this key to verify they are talking to the correct relay before any data is exchanged. The relay public key must be distributed to clients out-of-band — trueseal-relay does not handle key discovery. Operators distribute it however makes sense for their deployment: baked into a client binary, published on a landing page, shared as a QR code.

## Platforms

trueseal-relay is implemented in Go. It ships as a single binary with no runtime dependencies beyond its storage backend. It runs on Linux and macOS.
