---
title: Noise Protocol Primer
description: A from-scratch primer on the Noise Protocol Framework — DH chains, static and ephemeral keys, forward secrecy, and the handshake hash.
---

# Noise Protocol Primer

The Noise Protocol Framework is a specification for building secure channel protocols. WireGuard is built on it. Signal uses it. trueseal-noise wraps [snow](https://github.com/mcginty/snow), a Rust implementation of the spec.

This page explains what Noise is and how it works — without assuming prior knowledge of cryptographic protocols.

## Why Not TLS?

TLS is the standard answer for encrypted transport. It works. But it comes with significant baggage:

- A certificate authority hierarchy — trust is rooted in a set of organisations that sign certificates on behalf of domain names. This works for the web but is meaningless for two devices communicating directly.
- A complex negotiation phase — TLS 1.3 is simpler than its predecessors, but still supports dozens of cipher suite combinations and extension mechanisms.
- Identity tied to domain names — not public keys.

Noise takes a different approach. There are no certificate authorities. Identity is a keypair — you generate it, you own it. The cipher suite is fixed — no negotiation, no downgrade attacks. The protocol is defined in 50 pages and is entirely readable.

For a system where identity is a keypair and trust is established out-of-band (pairing), Noise is a significantly better fit than TLS.

## The Core Idea: Layered DH Operations

A Noise handshake is a sequence of Diffie-Hellman (DH) operations interleaved with message exchanges. Each DH operation mixes new key material into a running shared secret. By the end of the handshake, both peers have derived the same shared secret — without ever transmitting it — and that secret is used to key the encrypted channel.

**Diffie-Hellman** works like this: if Alice has keypair `(a_priv, a_pub)` and Bob has keypair `(b_priv, b_pub)`, then:

```
DH(a_priv, b_pub) == DH(b_priv, a_pub)
```

Both sides compute the same value from their own private key and the other side's public key. An observer who sees both public keys cannot compute this value — the private keys are required.

In Noise, multiple DH operations are chained together using HKDF (a key derivation function). Each operation mixes the DH output into the current chaining key, producing a new chaining key. By the end, the chaining key is a function of every DH operation that happened — meaning both peers must have contributed the correct keys at every step, or the derived keys won't match.

## Three Internal Objects

The Noise spec defines three objects that work together during a handshake:

**CipherState** — wraps a symmetric encryption key and a nonce counter. Encrypts and decrypts messages using ChaCha20-Poly1305. The nonce increments on every operation, ensuring that encrypting the same plaintext twice produces different ciphertext. If the nonce overflows, the implementation panics — silently continuing with a broken nonce would be catastrophic.

**SymmetricState** — maintains two values: a chaining key (`ck`) and a handshake hash (`h`). Every DH output is mixed into `ck` via HKDF, producing a new `ck` and a fresh `CipherState`. Every message sent or received is mixed into `h` via BLAKE2s. By the end of the handshake, `h` is a hash of every byte exchanged — a transcript that both sides must agree on. This is what binds the handshake messages together and prevents any message from being substituted or reordered.

**HandshakeState** — orchestrates the handshake. Holds the local static keypair, the local ephemeral keypair, and the remote peers' public keys as they are revealed during the exchange. Drives `SymmetricState` through the correct sequence of DH operations and message reads/writes for the chosen pattern.

## Static and Ephemeral Keys

Every Noise peer uses two kinds of keypairs during a handshake:

**Static keypair** — the peer's long-term identity. Generated once, reused across all sessions. In trueseal, this is the device's noise keypair — the one stored in local Session State.

**Ephemeral keypair** — generated fresh for each handshake, discarded afterwards. The ephemeral key is what gives Noise its forward secrecy property: even if the static private key is later compromised, past session keys cannot be reconstructed because the ephemeral keys are gone.

## Forward Secrecy

Forward secrecy means that compromising a long-term key today does not decrypt traffic from the past.

In Noise, the session keys are derived from a combination of static and ephemeral DH operations. The ephemeral keys are generated per-handshake and thrown away. An attacker who steals a device's static private key can impersonate that device in future sessions — but cannot recompute the session keys from past sessions, because those depended on ephemeral keys that no longer exist.

## The Handshake Hash

At the end of every Noise handshake, both sides produce a `handshake_hash` — a BLAKE2s digest of the entire transcript. Both sides must arrive at the same value. This hash is what makes the handshake tamper-evident: if any message was modified, reordered, or injected, the hashes won't match and decryption of the first post-handshake message will fail.

The handshake hash is also used as the associated data for post-handshake encryption — it is mixed into every subsequent message, binding the encrypted session to the specific handshake that created it.

## After the Handshake: Split

When the handshake completes, `SymmetricState.split()` derives two independent `CipherStates` from the final chaining key:

- `fromInitiator` — used to encrypt messages sent by the Initiator, decrypted by the Responder.
- `fromResponder` — used to encrypt messages sent by the Responder, decrypted by the Initiator.

Two separate cipher states means the nonce counters are independent — the Initiator and Responder can send simultaneously without coordinating. Each state is keyed differently, so a message sent in one direction cannot be replayed in the other.

## Patterns

The Noise spec defines a small grammar of handshake patterns. A pattern specifies:

- Which keys each side has before the handshake begins (pre-shared knowledge)
- The sequence of messages exchanged
- Which DH operations happen at each step

trueseal-noise implements two patterns:

- **XX** — no pre-shared knowledge, mutual authentication, three messages
- **NK** — Initiator knows Responder's static key, Initiator is anonymous, two messages

See [XX Pattern](./xx-pattern.md) and [NK Pattern](./nk-pattern.md) for a step-by-step walkthrough of each.

<!-- TODO: diagram — DH key mixing chain, SymmetricState → CipherState → split -->
