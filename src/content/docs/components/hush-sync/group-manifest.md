# Group Manifest

The Group Manifest is the authoritative membership record for a Sync Group. It defines who belongs, who can send, and whose messages are accepted. Every device holds a copy. Any member can update it.

## Structure

A Group Manifest contains:

| Field | Type | Description |
|---|---|---|
| `group_id` | `[u8; 32]` | Stable random identifier for this group. Never changes. |
| `version` | `u64` | Monotonically increasing. Increments on every membership change. |
| `members` | `Vec<ManifestMember>` | All current members — noise pub + signing pub + display name. |
| `issued_by` | `[u8; 32]` | Signing public key of the member who issued this version. |
| `signature` | `[u8; 64]` | Ed25519 signature over `group_id || version || members`. |

Each member entry holds:
- `noise_pub` — the device's X25519 key. Used to address Envelopes.
- `signing_pub` — the device's Ed25519 key. Used to verify Envelope signatures.
- `name` — a short display name derived deterministically from the signing public key (first 4 bytes as hex). Not user-configurable at this layer.

The manifest is encoded as Protobuf on the wire, and travels as a `GroupManifest` message (tag `0x04`) inside a standard Envelope — encrypted, signed, and relayed identically to `Sync` messages.

## Validity Rules

When a device receives a new manifest, it accepts it if and only if all three conditions hold:

1. **Valid signature** — the Ed25519 signature verifies against `issued_by` over the canonical signing message (`group_id || version || members`).
2. **Known issuer** — `issued_by` is a member in the recipient's *current* manifest. An update from a non-member is rejected, even if the signature is valid.
3. **Higher version** — the incoming `version` is strictly greater than the current version. Same-version and lower-version updates are rejected.

For a genesis manifest (the very first manifest, when the group is created), there is no previous manifest to check against. The issuer check is skipped — the genesis is self-authorising.

## Last-Version-Wins Convergence

Any current member can issue a new manifest at any time. If two members simultaneously issue conflicting updates — for example, device A removes device B while device C adds device D — both manifests propagate through the group. Every recipient applies whichever has the higher version number.

The result is eventual consistency: the group converges to a single agreed membership state without any consensus protocol. The higher version always wins. In the case of a tie (two simultaneous updates with the same version number), neither update is accepted — both are rejected as version regressions against each other. One of the issuers will retry with a higher version.

## Membership Changes

**Adding a member** — after the Pairing ceremony, the admitting device issues a new manifest that includes the new device. It pushes the new manifest to every existing member. The new device receives the current manifest as part of the join flow, giving it an immediate, complete view of the group.

**Soft removal** — the removing device issues a new manifest that excludes the target. Remaining members update their local copy and begin filtering the removed device's messages. The removed device, when it receives the new manifest, fires `onRemovedFromGroup()`.

**Destroy Group** — any member calls `destroyGroup()`. A `Revoke` message is pushed to every known member. Every device wipes its local state and rotates its keypair on next launch. The manifest is gone; the group no longer exists.

See [Revocation](../../concepts/revocation.md) for the full semantics of each operation.

## Inbound Message Filtering

Every inbound Envelope is checked against the current manifest after decryption and signature verification. If `author_pub` (extracted from the decrypted payload) is not a `signing_pub` in the current manifest, the message is silently discarded.

This is how soft removal takes effect at the message level. A removed device's Envelopes pass relay routing (the relay doesn't know about membership), pass decryption (the payload is still valid ciphertext), and pass Ed25519 signature verification (the device's key is still cryptographically valid) — but fail the manifest filter. They are discarded without notifying the caller.

## What the Relay Knows

Nothing. The relay has no concept of Group Manifests, group IDs, or membership. It routes Envelopes by `recipient_pub`. A manifest update is an Envelope like any other — the relay routes it to the recipient's Inbox and deletes it on delivery. The relay cannot distinguish a `GroupManifest` message from a `Sync` message.

<!-- TODO: diagram — manifest structure, version chain, membership change flow -->
