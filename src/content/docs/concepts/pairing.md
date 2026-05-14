# Pairing

Before two devices can sync, they must trust each other. Pairing is the ceremony that establishes that trust — the moment where two devices exchange public keys and agree to communicate.

There is no central authority that brokers this. No server vouches for either device. The trust is established directly, between the two devices, with the relay blind to what is happening.

## What Pairing Establishes

After pairing, each device holds the other's public keys — both the noise public key (for addressing blobs) and the signing public key (for verifying envelopes). These keys are recorded in the Group Manifest, making the new device an official member of the Sync Group.

From this point on, the group fans out every blob to both devices. The new device can send and receive. The relay still knows nothing about their relationship — it sees two independent public keys and routes blobs between them.

## How It Works

Pairing is a three-step ceremony:

**Step 1 — The initiating device generates a Pairing Token.**
The token encodes the initiator's noise public key and signing public key. It is opaque to the caller — trueseal-sync produces the raw bytes and the caller is responsible for presenting them out-of-band. In practice, this means a QR code, AirDrop, a link, or any channel the caller chooses. TrueSeal never touches the presentation layer.

**Step 2 — The joining device reads the token and sends a `Pair` message.**
The joining device decodes the token, extracts the initiator's public keys, and pushes a `Pair` message to the relay addressed to the initiator's noise public key. The message is encrypted using addressed encryption — only the initiator can decrypt it. It contains the joiner's own noise and signing public keys.

The relay routes the blob to the initiator's Inbox. It sees only that a blob was addressed to the initiator's public key. It does not know this is a pairing request.

**Step 3 — The initiating device accepts.**
The initiator receives the `Pair` message, decrypts it, and fires the `on_member_request` callback. The caller receives a Member Request Token — an opaque handle to the pending join request. The caller passes it to `accept_member()` to admit the device.

On acceptance, trueseal-sync issues a new Group Manifest that includes both devices. The manifest is signed by the accepting device and pushed to all current members.

## The Pairing Window

The initiating device opens a pairing window when it calls `start_pairing()`. The window defines the period during which a `Pair` message will be accepted. It closes on:

- A successful `accept_member()` call
- An explicit `cancel_pairing()` call
- A timeout

`accept_member()` is only valid inside an open pairing window. A `Pair` message received outside a window is silently discarded. This closes a residual attack surface: an attacker who intercepts the Pairing Token can push a `Pair` message, but the initiator must be in an active pairing window and explicitly accept it. The caller should open a pairing window only when the user has deliberately initiated a pairing flow.

## Out-of-Band Key Exchange

The security of pairing rests on the Pairing Token being transmitted out-of-band — through a channel the relay cannot intercept. The token encodes a 256-bit public key, so brute-forcing is not a concern. The threat is interception: if an attacker captures the QR code, they can attempt to pair as the joiner before the legitimate device does.

The pairing window and explicit `accept_member()` step mitigate this. The initiator sees an incoming pairing request and must accept it. If the initiator is physically present with the joiner, they can confirm the request is legitimate before accepting.

A future version will add a Short Authentication String (SAS) — both devices display a short code after the key exchange, and the user confirms they match. This adds a visual confirmation step that closes the interception window entirely.

## What the Caller Handles

trueseal-sync handles the cryptography, the relay communication, and the manifest update. The caller is responsible for:

- **Presenting the Pairing Token** — encoding it as a QR code, sharing it via AirDrop, copying it to a text field. TrueSeal produces bytes, the caller handles UX.
- **Deciding when to accept** — the `on_member_request` callback fires with a Member Request Token. The caller decides whether to present a confirmation UI or accept automatically.
- **Bootstrapping history** — once `on_member_joined` fires, the new device is in the group but has no history. If the caller needs the new device to have past blobs, it must send them. TrueSeal does not backfill history automatically.

<!-- TODO: diagram — pairing flow, three steps, what relay sees vs what devices exchange -->
