---
title: Device Identity
description: In trueseal, identity is a keypair — generated locally, never registered, never linked to a human.
---

# Device Identity

In trueseal, identity is a keypair. Nothing more.

There are no accounts, no registration, no server that issued your credentials. A device generates its own identity locally, on first launch, without communicating with anyone. That identity is two keypairs — and those keypairs are the device, as far as the protocol is concerned.

## Two Keypairs, Two Roles

Every device holds two long-term keypairs:

**Noise keypair (X25519)** — used for encrypted sessions with the relay and for addressed encryption of blobs. The noise public key is the device's routing address: the relay uses it to identify active connections, and senders use it to address blobs.

**Signing keypair (Ed25519)** — used to sign every envelope the device sends. Recipients use the signing public key to verify that a blob genuinely came from a known device and has not been tampered with. The signing public key is what the Group Manifest tracks as the authoritative identity of a member.

Both keypairs are generated locally on first launch and never leave the device. The private keys are never transmitted, never stored on the relay, and never known to trueseal infrastructure.

## No Registration

There is no step where a device announces itself to a central authority. No server assigns an ID. No account links multiple devices to a person.

A device simply generates its keypairs. Until it pairs with another device, it exists only locally. The relay has no record of it. The protocol has no concept of it.

This is not a simplification — it is the design. Any registration system would require a server to know about your device, which reintroduces the trust problem the entire stack is built to eliminate.

## Identity Persistence

A device's keypairs are its persistent identity. They are stored in the local Session State managed by trueseal-sync — an embedded SQLite database on the device. They survive process restarts, crashes, and OS kills.

If the Session State is wiped — intentionally or due to data loss — the device loses its identity. From the group's perspective, it is a new, unknown device. It must pair again to rejoin any group it was a member of.

## What Identity Is Not

**Identity is not a human.** One person may have multiple devices, each with its own keypair. The protocol treats them as independent participants. Linking multiple devices to a single person is the caller's responsibility — trueseal has no concept of it.

**Identity is not portable.** Private keys never leave the device. You cannot "log in" to a device from another. If you get a new phone, you pair it as a new device. Your old device's identity stays on your old phone.

**Identity is not recoverable.** There is no password reset, no backup seed phrase, no recovery mechanism in the protocol. If a device's private key is lost, that identity is gone. The device can be re-added to a group as a new member, but it cannot reclaim its previous identity.

## The Public Key as an Address

The noise public key is the only address a sender needs to reach a device. It is freely shareable — it is published as part of the Group Manifest to every group member, and it is visible to the relay as the routing target for blobs.

Knowing a device's public key does not grant access to anything. It allows a sender to address an encrypted blob to that device. Only the holder of the corresponding private key can decrypt it.

<!-- TODO: diagram — keypair generation, two roles (noise vs signing), relationship to group manifest -->
