# Zero Trust & Encryption

Zero trust is not a policy. It is a structural property.

In most sync systems, the server is trusted implicitly — it receives your data, stores it, and forwards it. The promise is that it won't look. hush is designed so that promise is never needed. The relay receives ciphertext. It has no keys. It cannot read the data it routes, regardless of the intentions of whoever operates it.

This page explains how that property is achieved and maintained throughout the stack.

## Two Layers of Encryption

hush encrypts data at two distinct layers, for two distinct purposes.

### Layer 1 — Addressed Encryption (at rest)

Before a blob leaves the sender's device, it is encrypted for each recipient individually. This is called *addressed encryption* — the blob is addressed to a specific recipient's public key, and only the holder of the corresponding private key can decrypt it.

The encryption uses X25519 key agreement combined with ChaCha20-Poly1305 authenticated encryption. The sender performs a Diffie-Hellman exchange with the recipient's static public key to derive a shared secret, then encrypts the payload with that secret. The result is a ciphertext that:

- Only the intended recipient can decrypt
- Cannot be read by the relay, any intermediary, or any other device
- Is authenticated — any tampering renders it undecryptable

The sender's identity (`author_pub`) is not a visible header on the envelope. It is prepended inside the plaintext before encryption. The relay never sees who sent a blob — only who it is addressed to.

This encryption is independent of any live network connection. A blob encrypted this way can be stored on the relay and decrypted later by the recipient, with no session active at the time of encryption.

### Layer 2 — Noise Protocol Sessions (in transit)

The transport channel between a device and the relay is protected by the [Noise Protocol Framework](https://noiseprotocol.org/). Two session types are used:

**Receive Sessions** use the `Noise XX` handshake pattern — mutual authentication. Both the device and the relay verify each other's static public keys. The result is a forward-secret, authenticated channel. If session keys are compromised after the fact, past traffic cannot be decrypted.

**Push Sessions** use the `Noise NK` handshake pattern — the device verifies the relay's static public key, but the relay never learns the device's identity. A fresh ephemeral keypair is generated for each push. The relay authenticates the infrastructure (you are connected to the correct relay) without learning who is sending. Push sessions are closed immediately after the blobs are sent.

These two layers are independent and complementary. Layer 1 protects the blob at rest — even if someone intercepts the relay's database. Layer 2 protects the channel in transit — even if someone intercepts the network traffic.

## Signatures

Every envelope is signed by the sender's Ed25519 signing key. The signature covers the sequence number, parent hashes, recipient public key, and the ciphertext. This provides two guarantees:

**Tamper detection.** Any modification to the envelope after signing — changing the recipient, altering the ciphertext, replaying an old sequence number — invalidates the signature. The recipient discards the envelope silently.

**Sender binding.** The sender's identity (`author_pub`) is inside the encrypted payload. When the recipient decrypts the envelope, they extract `author_pub` and verify that the signature matches. A device cannot impersonate another device — if device B encrypts a payload claiming to be from device A, the signature check fails because the signature was made with B's key, not A's.

Senders not present in the current Group Manifest are discarded after signature verification. The manifest is the authoritative list of trusted devices. See [Sync Groups](./sync-groups.md) for how membership is managed.

## What the Relay Knows

After a blob reaches the relay, the relay observes:

- The recipient's public key — required for routing, unavoidable
- That some device sent a blob to that recipient — but not which device, because push sessions are anonymous

The relay does not observe:
- The content of any blob
- The sender's identity
- Which devices belong to the same group
- Any relationship between two recipient keys

An adversary who compromises the relay entirely — binary, database, network — learns which public keys received blobs, and nothing else.

## What Zero Trust Does Not Cover

Zero trust protects against a compromised or malicious relay. It does not protect against:

- **A compromised device.** If an attacker has access to a device's private key, they can decrypt any blob addressed to that device and impersonate it as a sender. Device security is out of scope for hush — it is the caller's and the platform's responsibility.
- **Traffic analysis at the network level.** The relay knows which IPs connect and when. An adversary with network-level access can observe connection patterns even without reading content. hush does not route through a mix network or provide timing anonymity.
- **Blobs sent before a compromised device is removed.** If a device is removed from a group, it cannot decrypt future blobs. It retains the private key to decrypt any blobs it received before removal. See [Revocation](./revocation.md).

<!-- TODO: diagram — two encryption layers, blob lifecycle from plaintext to relay to recipient -->
