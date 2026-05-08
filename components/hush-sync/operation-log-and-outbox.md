# Operation Log & Outbox

The Operation Log is the durable record of everything a device has sent. The Outbox is a view over that log — the subset of entries not yet confirmed delivered to the relay. Together they are what makes guaranteed delivery possible.

## The Operation Log

Every blob a device sends is appended to the Operation Log before it is pushed to the relay. Each entry records:

- `object_id` — a 32-byte identifier for the logical object this blob belongs to (a clipboard entry, a secret, a document). Defined by the caller, never seen by the relay — it lives inside the encrypted payload.
- `sequence` — the device's global send counter at the time of this entry. Increments once per Envelope, across all objects.
- `blob` — the raw bytes of the blob.
- `delivered` — whether the relay has confirmed receipt.

Appending is idempotent: a second write with the same `(object_id, sequence)` pair is silently ignored. First write wins. Conflict resolution is the caller's concern.

## Global Sequence, Not Per-Object

The `sequence` field is a global counter — it increments once per Envelope sent, regardless of which object the payload belongs to. If a device sends a clipboard entry (sequence 5), then a group manifest update (sequence 6), then another clipboard entry (sequence 7), the log records sequences 5, 6, and 7 — across different object IDs.

This is intentional. Object IDs are caller-defined data that must stay inside the encrypted payload — the relay must never see them. A per-object counter would require object context in the Envelope header, leaking structure to the relay. A global counter keeps the header minimal.

The consequence: sequences are not contiguous within a single object. An object's entries may have sequences 3, 7, 11 — with gaps where other objects were sent in between. Callers must not assume per-object sequence continuity.

## The Outbox

The Outbox is not a separate data structure. It is a view over the Operation Log: all entries where `delivered = false`, sorted by global sequence ascending.

When a device pushes blobs to the relay and the relay confirms receipt, `mark_delivered()` is called for each entry. That entry leaves the Outbox. If the push fails — network error, process crash, relay unreachable — the entry stays in the Outbox.

On reconnect, the session replays the entire Outbox to the relay in global sequence order. This is the outbox replay mechanism that makes delivery reliable: blobs are never silently lost, even if the sender was offline when it first tried to send.

## What the Relay Holds vs What the Device Holds

There is a clear separation of responsibility:

**The relay** holds undelivered Envelopes for offline *recipients* — blobs addressed to a device that is currently offline. Once the recipient connects, the relay delivers and deletes them.

**The device** holds undelivered entries in the Outbox for itself as the *sender* — blobs it has not yet confirmed pushed to the relay. The relay is not the sender's outbox.

These are two independent problems. A blob may be:
- In the sender's Outbox (not yet pushed to relay) — relay doesn't have it yet
- In the relay's Inbox for the recipient (pushed but recipient offline) — relay has it, recipient hasn't received it
- Delivered — recipient has it, relay deleted it

## Sequence Counter Persistence

The sequence counter must never go backwards or repeat. On process restart, the session reads `max_sequence()` from the Operation Log and resumes from there. If the log is empty, the counter starts at zero.

This is why Session State persistence matters: if the local database is wiped, the sequence counter resets to zero. A recipient seeing a lower sequence number from a known device is not currently treated as an error in v0 — but it is a signal that the sender's state was reset.

## Object History

The Operation Log is queryable by `object_id`: `entries_from(object_id, sequence)` returns all entries for that object with sequence >= the given value, in ascending order. This is how a caller can reconstruct the history of a specific object — for example, all clipboard entries sent in this session.

<!-- TODO: diagram — operation log structure, outbox as a view, sender/relay/recipient state transitions -->
