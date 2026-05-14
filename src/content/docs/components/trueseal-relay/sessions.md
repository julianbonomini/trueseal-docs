# Sessions

trueseal-relay handles two distinct session types. Each uses a different Noise handshake pattern and serves a different purpose. They run on separate TCP listeners.

## Push Sessions

A Push Session is short-lived and anonymous. A device opens one to deliver blobs to the relay, then closes it.

**Handshake:** Noise NK. The device verifies the relay's static public key — confirming it is talking to the correct relay. The relay never learns the device's identity. A fresh ephemeral X25519 keypair is generated for each Push Session and discarded immediately after. The relay cannot link a Push Session to any device or Receive Session.

**Flow:**
1. Device opens TCP connection to the push listener (default `:7701`)
2. Noise NK handshake completes — relay authenticated, device anonymous
3. Device sends one or more `Push` frames, one per recipient blob
4. For each Push: relay persists to Inbox, sends `Ack`
5. If a blob is rejected (e.g. oversized), relay sends `Error` — device must not retry that blob
6. Device closes the connection when done

Multiple blobs can be sent in a single Push Session. One Ack per blob, in order.

## Receive Sessions

A Receive Session is long-lived and authenticated. A device opens one and keeps it open to receive blobs in real time.

**Handshake:** Noise XX. Mutual authentication — the device and relay verify each other's static public keys. The relay learns the device's stable noise public key and registers it as online.

**Flow:**
1. Device opens TCP connection to the receive listener (default `:7700`)
2. Noise XX handshake completes — both sides authenticated
3. Relay flushes any blobs already in the device's Inbox — delivers them without deleting
4. Relay delivers new blobs as they arrive — immediately, without polling
5. For each Deliver frame received, the client durably persists the blob then sends a **DeliverAck** with the blob's ID
6. On receiving a DeliverAck, the relay deletes the blob from the Inbox. If the session drops before a DeliverAck arrives, the blob is re-delivered on the next Receive Session — clients must handle duplicates
7. Either side sends `Heartbeat` on idle to prevent NAT/firewall timeout; the other side echoes it
8. Session stays open until the device disconnects or the connection drops

Only one Receive Session per device is expected at a time. The relay allows concurrent sessions for the same key — this can happen briefly during reconnect. Atomic Inbox flushing prevents double-delivery: only one session wins the flush race.

## Heartbeat

Idle TCP connections are silently killed by NAT tables and firewalls, typically after 30–300 seconds. trueseal-relay sends `Heartbeat` frames on idle Receive Sessions to keep the connection alive. The client echoes back a Heartbeat. Either side may initiate.

The heartbeat interval is configurable. If a device stops responding to heartbeats, the relay closes the connection and the device reconnects.

<!-- TODO: diagram — Push Session message exchange (NK), Receive Session message exchange (XX) -->
