# Envelopes & Blobs

Every piece of data that moves through trueseal-sync travels as an **Envelope** — a self-contained unit that the relay can route without reading, and that only the intended recipient can decrypt.

## Anatomy of an Envelope

An Envelope has five fields:

| Field | Type | Visible to relay |
|---|---|---|
| `sequence` | u64 | ✓ |
| `parents` | `[[u8; 32]]` | ✓ |
| `recipient_pub` | `[u8; 32]` | ✓ |
| `signature` | `[u8; 64]` | ✓ |
| `payload` | `Vec<u8>` | ✗ (encrypted) |

**`sequence`** — the sender's global per-device counter. Increments once per Envelope sent, across all objects. Not scoped per object. See [Operation Log & Outbox](./operation-log-and-outbox.md) for why.

**`parents`** — SHA-256 hashes of preceding Envelopes. In v0, every Envelope has exactly one parent (or zero for the root). The parent hash field exists in v0 to allow the wire format to remain unchanged when v1 introduces DAG merges with multiple parents.

**`recipient_pub`** — the recipient device's X25519 noise public key. The relay uses this to route the Envelope to the correct Inbox. It is the only routing information the relay has.

**`signature`** — an Ed25519 signature over the canonical signing message: `sequence (8 LE) || parent_hashes || recipient_pub || ciphertext`. The signature is verified by the recipient after decryption. The relay never verifies it.

**`payload`** — the encrypted blob. The relay sees opaque bytes. What is inside is described below.

Envelopes are encoded as Protobuf on the wire.

## Addressed Encryption

The `payload` field is produced by **addressed encryption** — a scheme that encrypts a blob for a specific recipient using only their public key, with no prior session required.

The wire layout of the encrypted payload is:

```
[ephemeral_pub (32 bytes)] [nonce (12 bytes)] [ciphertext + tag]
```

**Encryption (sender side):**

1. Generate a fresh ephemeral X25519 keypair for this payload only.
2. Perform X25519 DH between the ephemeral private key and the recipient's static noise public key — producing a shared secret.
3. Derive a 32-byte symmetric key from the shared secret via HKDF-SHA256 with the info string `"trueseal-sync addressed encryption v0"`.
4. Encrypt `author_pub (32 bytes) || message_bytes` with ChaCha20-Poly1305 using the derived key and a zero nonce.

The zero nonce is safe here because the symmetric key is derived from an ephemeral DH — it is unique by construction. Nonce reuse is only dangerous when the same key is reused, which it never is.

5. Output: `ephemeral_pub || nonce || ciphertext+tag`.

**Decryption (recipient side):**

1. Extract `ephemeral_pub` from the first 32 bytes.
2. Perform X25519 DH between the recipient's static private key and `ephemeral_pub` — recovering the same shared secret.
3. Derive the symmetric key via HKDF-SHA256 with the same info string.
4. Decrypt with ChaCha20-Poly1305 — producing `author_pub || message_bytes`.
5. Extract `author_pub` from the first 32 bytes of plaintext.

## The Hidden Sender

`author_pub` — the sender's Ed25519 signing key — is prepended inside the encrypted payload, not in the clear Envelope header. This is a deliberate design decision.

If `author_pub` were in the header, the relay would observe `(author_pub → recipient_pub)` pairs for every Envelope it routes — a complete communication graph. With `author_pub` inside the ciphertext, the relay sees only `recipient_pub`. It cannot determine who sent anything.

Recipients extract `author_pub` after decryption, then verify the Envelope signature using that key. If the claimed `author_pub` does not match the actual signer, verification fails — a device cannot impersonate another.

## Signature Verification

After decrypting and extracting `author_pub`, the recipient verifies the Envelope signature:

1. Recompute the signing message: `sequence || parents || recipient_pub || ciphertext`.
2. Verify the Ed25519 signature using the extracted `author_pub`.
3. If verification passes, check `author_pub` against the current Group Manifest — if the signer is not a current member, discard silently.

This two-step process — decrypt to learn the author, then verify using that author — prevents attribution forgery. A device B cannot claim that device A sent a message: if B encrypts a payload with `author_pub = A` but signs the Envelope with B's key, the signature check against A's key fails.

## Message Types

Inside the encrypted payload, after the 32-byte `author_pub`, is a 1-byte type tag followed by the message body. Four types exist:

| Tag | Type | Body |
|---|---|---|
| `0x01` | `Pair` | sender's `noise_pub (32)` + `signing_pub (32)` |
| `0x02` | `Sync` | opaque caller blob — clipboard entry, secret, any data |
| `0x03` | `Revoke` | empty — triggers Destroy Group on receipt |
| `0x04` | `GroupManifest` | encoded manifest update |

The relay never sees these type tags. They are a private convention of trueseal-sync, decoded only by recipients after decryption.

`Sync` is the only message type the caller interacts with directly — it is the opaque bytes the caller passes to `send()` and receives in `on_message()`. The other three are managed internally by trueseal-sync.

<!-- TODO: diagram — Envelope wire layout, addressed encryption flow, payload internals -->
