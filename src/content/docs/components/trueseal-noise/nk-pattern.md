# NK Pattern

`Noise_NK_25519_ChaChaPoly_BLAKE2s` — two-message handshake where the Initiator knows the Responder's static key before connecting. The Responder never learns the Initiator's static key — the Initiator is anonymous.

TrueSeal uses NK for **Push Sessions** — short-lived anonymous connections a device opens to send blobs to the relay. A fresh ephemeral keypair is generated per push, making the sender unlinkable across pushes.

For a full specification of the NK pattern, see the [Noise Protocol spec](https://noiseprotocol.org/noise.html) and the [official test vectors](https://github.com/noiseprotocol/noise_wiki/wiki/Test-vectors).

## API

```rust
// Initiator — must supply the Responder's known static public key
let session = session_nk::dial(conn, keypair, remote_static)?;

// Responder
let session = session_nk::accept(conn, keypair)?;

// Both sides
session.send(b"hello")?;
let msg = session.receive()?;
session.close()?;
```

`remote_public_key()` is intentionally absent from `session_nk::Session` — the Initiator already knew the Responder's key going in, and the Responder has no Initiator static key by design.
