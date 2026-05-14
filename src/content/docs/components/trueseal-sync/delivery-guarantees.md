# Delivery Guarantees

trueseal-sync guarantees that every blob sent will reach every current group member — eventually, unconditionally. This is not best-effort. It is the contract.

This page explains exactly how that guarantee is achieved, and where its limits are.

## The Two-Sided Mechanism

Guaranteed delivery is the result of two independent mechanisms working together:

**Sender-side: the Outbox.** Every blob is written to the local Operation Log before being pushed to the relay. It is marked undelivered until the relay confirms receipt. If the sender goes offline before the push succeeds, the blob stays in the Outbox. On reconnect, the session replays every undelivered Outbox entry to the relay in global sequence order. The sender never loses a blob — it lives locally until delivery is confirmed.

**Relay-side: deferred delivery.** When the relay receives a blob addressed to a recipient that is currently offline, it stores it in that recipient's Inbox. When the recipient reconnects, the relay flushes the Inbox immediately and deletes each blob on confirmed delivery. The relay holds blobs for offline recipients so the sender doesn't have to wait.

Together: the sender guarantees it will keep trying until the relay confirms receipt. The relay guarantees it will hold the blob until the recipient collects it.

## What "Eventually" Means

"Eventually" has one limit: the relay's TTL. Blobs held in the relay's Inbox for longer than the TTL are reaped, regardless of delivery status. A device that is offline longer than the TTL will miss those blobs — they will not be in the relay when it reconnects.

The sender's Outbox is not subject to TTL. Undelivered entries persist in the local Operation Log indefinitely. If a sender has been offline for months and reconnects, the Outbox is replayed in full. But the relay will only accept and deliver those blobs to recipients who are online or reconnect within their own TTL window.

The practical consequence: if both sender and recipient are offline for longer than the relay TTL, delivery is not guaranteed. Within the TTL, it is.

## Delivery Order

Blobs are delivered to `on_message` in arrival order — the order in which the relay delivers them to the recipient's active Receive Session. This may differ from send order if the sender was offline and pushed a batch of Outbox entries on reconnect.

Causal ordering is preserved through parent hashes. Each Envelope references the hash of its predecessor. A recipient can detect whether a received blob is causally dependent on one they haven't seen yet — regardless of arrival order.

trueseal-sync does not buffer or reorder Envelopes on the recipient side. Arrival order is what the caller receives. If the caller needs strict causal ordering, they use the parent hashes.

## Fan-Out Delivery

When a device calls `send()`, trueseal-sync produces one Envelope per current group member and pushes all of them in a single Push Session. Each Envelope is independently addressed and encrypted. The relay routes each to the appropriate Inbox.

Delivery to each recipient is tracked independently. A blob is not "delivered" until every current member has confirmed receipt. The Outbox tracks delivery per `(object_id, sequence)` entry — not per recipient. In v0, an entry is marked delivered when the relay confirms the push succeeded, which means all N Envelopes for that send were accepted by the relay.

## What Delivery Does Not Cover

**Newly added members.** A device that joins the group after a blob was sent will not receive that blob — the relay does not retroactively route past blobs to new recipients. If the caller wants new members to receive history, they must send it explicitly after `onMemberJoined` fires.

**Removed members.** A device removed from the group will not receive blobs sent after the manifest update that excludes them. They may still receive blobs that were in-flight at the time of removal — already addressed to their key and in the relay's Inbox.

**Relay TTL expiry.** As noted above, blobs held past the relay TTL are reaped. This is the only scenario where a blob can be permanently lost without the sender knowing.

<!-- TODO: diagram — sender outbox → relay inbox → recipient, TTL boundary, fan-out per member -->
