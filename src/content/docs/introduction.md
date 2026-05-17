---
title: Introduction
description: trueseal is a free, composable ecosystem of primitives for zero-trust, end-to-end encrypted sync between devices.
---

# Introduction

trueseal is a free, composable ecosystem of primitives for building zero-trust, end-to-end encrypted sync between devices — without trusting any server, without accounts, and without lock-in to any platform or operator.

## The Problem

Sync infrastructure exists. iCloud, Firebase, Dropbox — they all work. But they own your users' data. The relay is in the middle, and it can read everything.

The privacy-preserving alternatives are either closed systems (Anytype, Signal, and many more) where the sync engine is either internal infrastructure not designed to be reused, or the product that locks you in into an ecosystem.

Every developer who wants private-by-default sync either has to build the entire stack from scratch, or gives up and trusts a platform (or worse, no privacy).

trueseal exists to close that gap.

## What trueseal Is

trueseal is a stack of three independent components that together give any developer zero-trust sync as a drop-in primitive:


![intro-diagram](/assets/introduction_diagram.png)

**trueseal-noise** implements the [Noise Protocol Framework](https://noiseprotocol.org/) in Rust — the same foundation WireGuard and Signal are built on. It provides authenticated, forward-secret encrypted channels between devices. Standalone, spec-verified, no dependencies on the rest of the trueseal stack.

**trueseal-sync** is the sync engine. It handles device identity, pairing, group membership, encrypted delivery to every group member, and guaranteed outbox replay on reconnect. Drop it into any Go, Swift, or Kotlin app and your data is encrypted before it leaves the device. Always.

**trueseal-relay** is a deployable Go binary — a dumb router for encrypted blobs. It holds ciphertext for offline devices and delivers it when they reconnect. It has no concept of users, groups, or content. It can be self-hosted on any server, or you can use any existing public instance. The security model does not change regardless of who runs it.

## The Core Guarantee

Data is encrypted on device before it moves anywhere. The relay is structurally incapable of reading it — not because it promises to behave, but because it never receives the keys. An adversary who fully compromises the relay gains a pile of ciphertext.

This is not a configuration option. It is a constraint baked into the design.

## What trueseal Is Not

trueseal is a sync primitive, not an application. It does not do conflict resolution, real-time streaming, identity management, or permission hierarchies. Those belong in the layer above.

See [Principles & Boundaries](./principles-and-boundaries.md) for the full picture.

## Where to Go Next

- Understand the design decisions → [Principles & Boundaries](./principles-and-boundaries.md)
- Understand how the components fit together → [Architecture](./architecture.md)
- Understand the mental models before you build → [Concepts](./concepts/)
- Jump straight to building → [Build on trueseal-sync](./guides/build-on-trueseal-sync.md)
