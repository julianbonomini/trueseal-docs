# XX Pattern

`Noise_XX_25519_ChaChaPoly_BLAKE2s` — three-message mutual authentication handshake. Neither peer has prior knowledge of the other's static key. Both end up authenticated and share a pair of forward-secret session keys.

TrueSeal uses XX for **Receive Sessions** — the long-lived authenticated connections between devices and the relay.

For a full specification of the XX pattern, see the [Noise Protocol spec](https://noiseprotocol.org/noise.html) and the [official test vectors](https://github.com/noiseprotocol/noise_wiki/wiki/Test-vectors).

## API

```rust
// Initiator
let session = session_xx::dial(conn, keypair)?;
let remote_pub = session.remote_public_key();

// Responder
let session = session_xx::accept(conn, keypair)?;
let remote_pub = session.remote_public_key();

// Both sides
session.send(b"hello")?;
let msg = session.receive()?;
session.close()?;
```

`remote_public_key()` is available unconditionally — mutual authentication is a guarantee of the XX pattern. Trust policy is the caller's responsibility.
