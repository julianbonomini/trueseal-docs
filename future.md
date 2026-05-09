# Future Directions

This document captures the long-term vision for hush — where it could go if the primitive proves itself and the hard problems get solved. Not a roadmap. Not promises. A north star.

---

## The End Goal: The Encrypted Replication Layer Beneath Applications

hush starts as a sync primitive. The end goal is something more fundamental.

Every application that needs to share state across devices or users faces the same problem: how do you replicate data to the right places, with the right access, without a central authority that can be compromised, coerced, or captured? Today the answer is always a server with an ACL system and an identity layer. That server is a liability — it knows who you are, what you're doing, and who you're talking to.

The vision for hush is to make that server unnecessary. Not by removing replication — you still need data to move — but by making the replication layer structurally incapable of knowing what it's replicating or who it's replicating to.

**The target:** selective replication without identity, without ACL systems, without a central authority. A device receives exactly the data it holds a capability for. Capabilities are cryptographic — hold the key, decrypt the blob; don't hold it, the blob is noise. No accounts. No permissions database. No server that can be subpoenaed.

This is an unsolved problem. Everyone who has tried has either introduced a central issuer (UCAN, Macaroons), used group keys that break anonymity (Signal Sender Keys), or punted the problem to the application layer. The combination of fine-grained capability distribution, zero-trust relay, and anonymity — all three together — does not exist as a working primitive today.

If hush solves it, it stops being a library. It becomes infrastructure. The encrypted replication layer beneath applications — sitting below databases, event systems, collaborative tools, agent coordination layers. Anything that moves state between parties who should not have to trust each other.

That is the end goal. Build the primitive. Prove it with real applications. Then go after the unsolved problem.

---

## Selective Replication

The architectural step toward the end goal. Today every group member receives every blob — full fan-out. Selective replication means a device receives only the blobs it holds a capability for.

The mechanism maps naturally onto the existing addressed encryption scheme: the recipient key IS the capability. Hold the key, decrypt the blob. Don't hold it, the blob is noise. No identity system, no ACL, no central authority.

What needs to be solved:
- **Object capabilities** — a blob addressed to a sub-key rather than a device key.
- **Topic capabilities** — a key that unlocks a class of blobs (a namespace, a data type, an event stream).
- **Sub-key distribution** — how does a device receive a new capability without a full pairing ceremony, and without a central issuer?

The last point is the hard one. Pairing solves key distribution coarsely. Fine-grained capability distribution without identity is the research problem.

---

## Broadcast Encryption with Selective Decryption

A concrete mechanism toward selective replication that keeps the relay completely blind.

**The idea:** instead of sending blobs to only the devices that have access (selective delivery), send to everyone but encrypt with a topic key — only devices holding that topic's private key can decrypt. Devices without the key receive ciphertext they cannot read.

A topic has its own X25519 keypair. Blobs are encrypted with the topic public key using the existing addressed encryption scheme. Topic key distribution is just another addressed encryption operation — the granting device sends the topic private key encrypted to the recipient's device key. No central server. No ACL. The capability IS the key.

**Why this is elegant:**
- The relay remains completely blind — it routes blobs, has no idea who can decrypt what
- No change to the relay protocol
- Composes naturally with the existing addressed encryption primitive
- Groups-as-capabilities still work — a Sync Group is just a topic where every member holds the key

**The hard parts:**

**Revocation** — removing a device's access to a topic requires rotating the topic key and re-distributing to remaining holders. Cooperative revocation (stop sending new blobs encrypted to the old key) is cheap. Cryptographic revocation (rotate, re-distribute) is the same problem as group Destroy Group, just at topic granularity.

**Compromise blast radius** — with device keys, a compromised device exposes only that device's data. With a shared topic key, any device holding the key can decrypt all blobs ever encrypted to it. Compromise is broader.

**Forward secrecy** — a shared topic key does not provide per-device forward secrecy. Anyone who ever held the key could decrypt everything encrypted to it, including past blobs.

These are known tradeoffs, not blockers. The right time to tackle this is after hush-clip stress-tests the primitive and reveals whether groups-as-capabilities is sufficient for real use cases, or whether topic-level granularity is genuinely needed.
