---
title: Build on hush-sync
description: Platform-agnostic integration guide for client authors building on the hush-sync SDK.
---

# Build on hush-sync

hush-sync is a sync primitive. This guide covers everything a client author needs to integrate it correctly — session lifecycle, pairing, publish/receive, member management, and group exit. Platform-specific SDK notes live in the SDK reference pages.

---

## What hush-sync gives you

- A stable device identity (X25519 + Ed25519 keypair, persisted locally)
- Encrypted delivery of arbitrary binary blobs to all group members via a relay
- A pairing ceremony to add devices to a group
- Outbox replay — messages sent while offline are delivered when the relay reconnects
- Deterministic, human-readable device names derived from public keys

It does **not** give you:

- Knowledge of whether a peer device is online
- Message history (the relay is a delivery buffer, not a log)
- Multi-group management (one namespace = one group per session)
- A "leave group" protocol message — see [Group exit](#group-exit)
- Payload ordering beyond FIFO per sender, deduplication, or conflict resolution

---

## Device identity

Every session has a **permanent identity** consisting of two keypairs:

| Keypair | Algorithm | Purpose |
|---|---|---|
| Noise keypair | X25519 | Transport encryption (Noise XX / NK handshakes) |
| Signing keypair | Ed25519 | Message authentication, member identification |

Both keypairs are generated once on first run and persisted to local storage. They survive app restarts and relay reconnections. They are destroyed only by `destroyGroup()` or manual storage deletion.

### Device name

Every device has a human-readable name derived deterministically from the first two bytes of its Ed25519 signing public key:

```
name = ADJECTIVES[signing_pub[0] % len(ADJECTIVES)]
     + NOUNS[signing_pub[1]      % len(NOUNS)]
```

Example outputs: `FreeMap`, `SwiftHorizon`, `AmberFalcon`.

The name is stable for the lifetime of the keypair — it changes only if the keypair is rotated (i.e. after `destroyGroup()`). Do not re-implement this derivation in your app — use the value exposed by the SDK so all clients stay in sync with the word lists.

### Node ID

The stable opaque identifier for a member is `base64url(signing_pub[0..8])` — 11 characters, no padding. Use it to key membership maps and identify remove targets.

The local device's name and node ID are available via `session.localDeviceName` and `session.localNodeId`. For remote members, both come from the member manifest.

---

## The relay

### Ports

The relay listens on two ports for different Noise handshake patterns:

| Port | Pattern | Used for |
|---|---|---|
| `:7700` | XX (mutual auth) | Device ↔ relay sessions |
| `:7701` | NK (server-only auth) | Internal hush-sync push channel |

**Your relay URL should always point to `:7700`.** The `:7701` port is managed internally by the SDK — never reference it in app code.

### Relay public key

The relay's X25519 public key is a **build-time constant** for the client. Obtain it by running the relay binary with `-genkey`:

```
relay public key (share with clients): <64-hex-chars>
```

Decode the 64-character hex string into 32 bytes and pass it to the SDK constructor. It never changes at runtime and should not be user-configurable.

### Relay offline is a no-op

If the relay is unreachable at launch or drops mid-session, the SDK queues outbound messages in the local outbox and reconnects automatically. **Write no reconnect logic.** Show `RELAY: OFFLINE` in the UI and do nothing else.

---

## Session lifecycle

### Initialisation

Construct one session per app lifecycle. Initialisation reads or generates the keypair from storage and begins connecting to the relay in the background. It returns immediately — it does not block on relay connectivity.

**A throw at init time is a developer or deployment error** — bad arguments, corrupt storage, or a missing entitlement. Treat it as fatal. There is no meaningful recovery path.

### The session is a singleton

Instantiate once at app startup and keep it for the app's lifetime. There is no meaningful "restart session" other than `destroyGroup()` + reinit.

### Multiple groups via namespaces

A device can participate in more than one group simultaneously by running multiple sessions with different namespaces. Each session is fully independent — separate keypair, separate storage, separate relay connection, separate member manifest.

```
sessionA = Session(namespace: "work",     storage: .../work/)
sessionB = Session(namespace: "personal",  storage: .../personal/)
```

The SDK does not manage session switching — that is the caller's responsibility. Each session must be initialised, listened to, and torn down independently. If you want the user to switch between groups in the UI, maintain an array of sessions and route publishes and incoming blobs to whichever is active.

Namespace strings are arbitrary. Use something collision-resistant if your app ships to end users who might run multiple copies — e.g. include your app bundle ID as a prefix.

### Startup sequence

On every boot, before the relay connection is established:

1. Seed your member list from `session.members()` — devices already in the group from the previous run
2. Start listening to member events
3. Start listening to connection state
4. Start listening to incoming blobs
5. Start listening to pairing requests (if the app offers pairing)

Seed first — never show an empty member list when you already have members.

---

## Pairing

### The token

The pairing token is a base64url-encoded string containing the device's permanent public keys:

```
base64url(noise_pub[32] || signing_pub[32] || device_name_utf8)
```

It is stable for the lifetime of the keypair. Generate it once, cache it, and display it freely — showing it in a QR code, as text, or copying it to the clipboard has no side effects.

### Roles

| Role | Action |
|---|---|
| **Host (A)** | Generates and shares the token, accepts incoming requests |
| **Joiner (B)** | Receives the token out-of-band, calls `session.join(token)` |

In a macOS + iOS scenario where macOS shows a QR and iOS scans it: macOS is A, iOS is B.

### Ceremony sequence

```
Device A (host)               relay             Device B (joiner)
─────────────────────────────────────────────────────────────────
session.pairingToken()
  → share QR / OOB
                                                session.join(token)
                                                  → Pair message →
← pairingRequest event
acceptRequest(request)
  → manifest update →
← memberJoined(id, name)                       ← memberJoined(id, name)
```

### Acceptance window

The acceptance window is **caller-controlled** — there is no protocol-level timer or auto-expiry.

- `session.pairingToken()` opens the window immediately
- The window stays open until `acceptRequest()` is called (single-use) or the caller calls `session.cancelPairing()`
- Call `cancelPairing()` when the user dismisses the pairing UI

Design guidance from the reference integration:

- **Open on demand** — show an explicit OPEN / CLOSE control. Never auto-open without user intent.
- **No timer auto-close** — auto-expiry causes silent drops where the joiner knocks but the host's window closes before they can respond. Let the user decide when to stop accepting.
- **Single-use** — once a request is accepted, call `cancelPairing()` immediately. The next pairing requires a fresh token call.

---

## Publishing and receiving

### Publishing

```
session.publish(blob)   // raw bytes
session.publish(text)   // convenience: UTF-8 encode then publish
```

Publishing is fire-and-forget. If the relay is offline the message queues in the outbox and delivers automatically on reconnection. There is no per-message delivery confirmation exposed to the caller.

### Receiving

Incoming blobs arrive as events containing:

- `data` — the raw payload bytes
- `senderNoisePub` — the sender's X25519 public key (32 bytes)

**The blob stream may fire for your own messages** depending on relay implementation. Implement deduplication at the app layer — content hash against local storage — rather than relying on the transport to filter self-sent messages.

### Sync semantics: broadcast-each

The recommended pattern for single-value streams (clipboard, presence, settings):

- On every new item, broadcast the full item immediately
- Do not diff — broadcast complete payloads
- Dedup at the receiver — if the content already exists in local storage, drop it
- Outbox replay handles late or out-of-order delivery

This is simpler and more robust than delta-sync or last-write-wins schemes.

---

## Member management

### The manifest

`session.members()` returns a snapshot of current group membership. **It excludes the local device** — you will never see yourself in this list.

On every member event, re-snapshot from `session.members()` rather than maintaining a local delta. This avoids missed events from race conditions.

### Member events

| Event | Meaning |
|---|---|
| `memberJoined(id, name)` | A new device joined the group |
| `memberLeft(id, name)` | A member was removed |
| `removedFromGroup` | **You** were removed by another member |
| `groupDestroyed` | The group was destroyed — see [Group exit](#group-exit) |

`removedFromGroup` and `groupDestroyed` require immediate action in the app — see below.

### Removing a member

```
session.removeMember(memberId)
```

The removed device receives a `removedFromGroup` event. The removal is immediately reflected in `session.members()`.

### Local identity in the UI

Display the local device separately from the member list — label it explicitly as "this device". Use `session.localDeviceName` and `session.localNodeId` from the SDK. Do not re-derive them.

---

## Connection and group state

Model these as **two independent signals**. Never conflate them.

| Signal | Source | UI representation |
|---|---|---|
| Relay connectivity | connection state stream | `RELAY: CONNECTED` / `RELAY: OFFLINE` |
| Group membership | `members()` count | `GROUP: SOLO` / `GROUP: N DEVICES` |

`RELAY: CONNECTED` + `GROUP: SOLO` is a valid steady state — the app is working, just not paired with anyone yet.

`RELAY: OFFLINE` + `GROUP: N DEVICES` is also valid — paired, relay temporarily unreachable, outbox will replay on reconnection.

**Never show "you cannot sync" based on relay state alone.** The relay being offline is transient. The group relationship is persistent.

---

## Group exit

### Destroy group

`session.destroyGroup()` is a first-class protocol primitive:

1. Sends a `Revoke` message to all members via the relay
2. All devices receive a `groupDestroyed` event
3. All sessions wipe their local state
4. The session becomes terminal — all subsequent publish calls fail

When `groupDestroyed` fires on any device:

1. Stop all stream listeners
2. Delete the storage directory
3. Reinitialise the session — fresh keypair, new identity, solo mode

### Leave quietly (no protocol primitive)

There is no "leave quietly" message. To remove yourself without destroying the group for others:

1. Delete local storage and reinitialise — this rotates your keypair
2. Your old node ID becomes a ghost member in other devices' manifests
3. Other devices must manually remove the ghost entry

A graceful leave protocol may be added in a future hush-sync version.

---

## Storage

### Scope to your app

Never use the SDK's default storage path — it may be shared across all hush-sync consumers on the same machine. Two apps sharing a storage path would share a group identity.

Recommended pattern:

```
<platform app support dir> / <your-app-bundle-id> / HushSync /
```

Create the directory before passing it to the SDK constructor.

### Key rotation

Deleting the storage directory and reinitialising gives the device a fresh keypair and a new identity. This is the correct implementation of both "destroy group + rejoin" and "leave quietly" flows.
