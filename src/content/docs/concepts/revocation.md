# Revocation

Membership in a Sync Group is never permanent. Any current member can remove another member. Any current member can destroy the group entirely.

TrueSeal provides two distinct removal operations with different semantics, different costs, and different threat models. Choosing the right one depends on why you are removing a device.

## Soft Removal

Soft removal is the routine operation. Use it when a device is no longer wanted in the group — a decommissioned laptop, a departing team member, a phone upgrade.

Any current member calls `removeMember()` with the target device's noise public key. trueseal-sync issues a new Group Manifest version that excludes the target and pushes it to every remaining member.

**What happens:**
- Remaining members receive the updated manifest and begin discarding blobs from the removed device — if the sender is not in the manifest, the blob is silently filtered.
- Remaining members stop addressing future blobs to the removed device.
- The removed device, when it receives the new manifest, fires `onRemovedFromGroup()`.

**What does not happen:**
- No keypairs are rotated.
- No reconnection is required.
- The removed device's keypair remains valid — it can still push blobs to the relay. The relay accepts them. But every remaining member discards them on receipt, because the sender is no longer in their manifest.

**The honest limit:** Soft removal is cooperative, not cryptographic. It works because legitimate devices on the group respect the manifest. A compromised or adversarial client on the removed device could bypass filtering. For routine group maintenance, this is the right tradeoff. For security incidents, it is not enough.

## Destroy Group

Destroy Group is the nuclear option. Use it when a device is stolen, compromised, or otherwise untrusted — when you need a cryptographic guarantee that the device can never receive future data, regardless of what software it runs.

Any current member calls `destroyGroup()`. trueseal-sync pushes a `Revoke` message to every known member, then every device — including the one that initiated the destroy — wipes its local state entirely and rotates its keypair. The next `create()` call generates a fresh identity.

**What happens:**
- Every device fires `onGroupDestroyed()` and wipes its local database — identity, manifest, outbox.
- Every device auto-generates a new keypair on next launch.
- No legitimate device ever addresses a blob to any old keypair again. The compromised device's old address becomes a dead end.

**The cryptographic guarantee:** Exclusion in TrueSeal works by key rotation, not key blocking. The relay never blocks any key — it remains zero-knowledge. A compromised device stops receiving blobs because no legitimate device encrypts to its old public key anymore. The relay is irrelevant to this guarantee.

**The cost:** Every member must re-pair. The group is torn down completely. This is intentional — it is the price of a cryptographic guarantee.

## What Revocation Cannot Do

**Past blobs are not recoverable.** A device that already received and decrypted blobs before being removed retains that data. Revocation stops future leakage — it cannot reach back in time. This is a fundamental constraint of any system without a central authority to enforce deletion.

**Soft removal cannot be made cryptographic without key rotation.** In a zero-trust system with no key revocation server, the only way to cryptographically exclude a device is to rotate keypairs so it has no valid recipient addresses. Without rotation, enforcement is cooperative. This is documented explicitly — not hidden.

A future version may implement targeted key rotation: rotate everyone except the removed device, without destroying the full group. This would provide cryptographic single-device removal without forcing a full re-pair. It is explicitly deferred — it requires a distributed key agreement sub-protocol that would significantly increase the complexity of this primitive.

## No Permission Hierarchy

Any current member can remove any other member. Any current member can destroy the group. There is no admin, no owner, no device with elevated authority.

If your application requires a permission hierarchy — only admins can remove members, or only the group creator can destroy the group — implement that policy above this primitive. TrueSeal enforces only that the issuer of a manifest update was a member at the time of issuance.

<!-- TODO: diagram — soft removal flow vs destroy group flow, what each operation touches -->
