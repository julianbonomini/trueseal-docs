# Inbox & TTL

The Inbox is the relay's storage unit. Every device has one — a set of blobs addressed to its public key that have not yet been delivered. The relay's entire storage model is built around this simple structure.

## The InboxStore Contract

The InboxStore has three operations:

**Put** — store a blob for a recipient. The blob is persisted durably before the relay sends an Ack. A relay that crashes between Put and Ack loses the blob — the client's outbox will replay it on reconnect. A relay that sends an Ack before Put succeeds is lying: the blob is lost with no retry. Put never deduplicates — if the same blob arrives twice (e.g. outbox replay after a crash), both copies are stored. Deduplication is the recipient client's responsibility.

**Flush** — fetch all blobs for a recipient without deleting them. Returns blobs in insertion order (FIFO). Blobs remain in the store until a DeliverAck is received for each.

**Delete** — delete a specific blob by ID, called after a DeliverAck arrives. If the session drops before a DeliverAck is received, the blob survives and is re-delivered on the next Receive Session. Clients must handle duplicate delivery — deduplication is the client's responsibility.

**Reap** — delete all blobs whose TTL has elapsed. Called periodically by the TTL reaper goroutine. Reaping is policy, not data loss — it handles abandoned and permanently offline devices without unbounded storage growth.

## SQLite Backend

The default storage backend is SQLite. Schema:

```sql
CREATE TABLE inbox (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient   BLOB    NOT NULL,  -- 32-byte X25519 public key
    envelope    BLOB    NOT NULL,  -- raw protobuf Envelope bytes
    expires_at  INTEGER NOT NULL   -- Unix timestamp
);
```

SQLite is opened in WAL mode with `synchronous=FULL` — every Put is crash-safe before the Ack is sent. A single connection serialises all writes, avoiding `SQLITE_BUSY` under concurrency.

## TTL and Reaping

Every blob has a TTL set at Put time. When the TTL expires, the blob is eligible for reaping. The TTL reaper runs on a configurable interval (default: 1 hour) and deletes all expired blobs in a single sweep.

The default TTL is 30 days. This is generous — reaping is a last resort for permanently offline or abandoned devices, not routine housekeeping. Operators can configure a shorter TTL for resource-constrained deployments.

A device that reconnects after its blobs have been reaped will miss those blobs permanently. The relay has no way to recover them. This is the one scenario where the delivery guarantee does not hold — documented honestly in [Delivery Guarantees](../../components/trueseal-sync/delivery-guarantees.md).

