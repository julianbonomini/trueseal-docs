# Evidence for brandbook section 10 and the Landing comparison table

Each claim from [section 10](90_SYNTHESIS.md#10-claims-that-need-evidence-before-launch) and each cell of the Landing comparison table (`src/components/landing/Overview.astro`) has one of three verdicts:

- **verified**: the evidence below backs it, and Landing copy may use it;
- **pending human check**: it needs a step an unattended run can't take, and it stays out of Landing copy until someone does it and changes the verdict here;
- **removed**: nothing backs it, and it isn't in any copy.

Sibling-repo paths are relative to the folder that holds `trueseal-docs`. Line numbers are as of the commit named.

## Section 10 claims

| Claim | Verdict | Evidence | Date |
|---|---|---|---|
| "About ten lines" | removed | With the canonical API as it ships in the SDK repos, the same four steps take 18 lines of Swift, 19 of Kotlin and 16 of TypeScript ([counts below](#the-snippets-on-the-landing)). All three are over ten, so the claim is out and the Landing states the counts instead. (Earlier counts — 18/16/10 — were of the pre-canonical `TruesealSyncClient` API, which no longer exists.) | 2026-10-14 |
| Line counts on the Landing (18 Swift / 19 Kotlin / 16 TypeScript) | verified | The [snippets](#the-snippets-on-the-landing) use the real canonical API, symbol-for-symbol against the SDK READMEs and sources — Swift at `1480349`, Kotlin at `c7baeca`, TypeScript at `db88816` — with the accept step written out (`accept(requestId:)` / `accept(event.request.id)`). Counted by the rule below. Still open: compile each snippet against the *published* 0.6 packages once OPS-4 publishes them. | 2026-10-14 |
| "Three screens" | removed | Never in Landing copy. Nothing counts the screens an app needs, and it depends on the app's own pairing UI. | 2026-10-08 |
| "A relay in one container" | pending human check | Verified on a maintainer machine on 2026-10-14 by following `src/content/docs/operate/running-a-relay.mdx` against `trueseal-relay` at `e0db41d`: `docker compose up -d --build` starts exactly one container (`relay`, one `relay-data` volume); first start auto-generated the keypair (logged, mode 0600); `/healthz` returned `{"status":"ok","dev_mode":false,"transport_version":1}`; `pubkey` and `address --host` printed the documented values; `docker compose ps` reported `healthy`. Still to do: the same steps on a genuinely clean machine with the *released* image (the run above built from source). Until then the Landing doesn't say "one container". | 2026-10-14 |
| Life360 data-broker report (The Markup, December 2021) | removed | Not cited anywhere on the site. No primary source was checked. | 2026-10-08 |
| Etebase's current status | removed | Not named anywhere on the site. No primary source was checked. | 2026-10-08 |
| The IP sentence, wording | verified | `src/components/landing/Trust.astro` and `running-a-relay.mdx` quote it verbatim from `trueseal-relay/docs/adr/0012-self-hosted-preview-baseline.md`, section "IP addresses", "Public wording". `tests/landing.test.ts` checks the Landing text. | 2026-10-08 |
| The IP sentence, relay behaviour | verified | The behaviour the sentence claims is implemented and gate-checked: RELAY-4 (`trueseal-relay` `9790244`) removed every IP, key-prefix, size and per-client log (zero `RemoteAddr` in non-test code, source-scanned by `TestNoRemoteAddrInNonTestCode`); RELAY-9 (`d8c4a24`) keeps dev mode address-free with a real-TCP binary-level test; and the G7 release gate (E2E-7, `trueseal-e2e` `dab8861` and later) runs full sessions over real TCP in both modes and fails if a client address appears in the log or in `inbox.db`. Verified at relay `e0db41d`. | 2026-10-14 |

## The snippets on the Landing

`src/components/landing/Integrate.astro` shows the canonical API (trueseal-sync ADR-0028; package names ADR-0030), verified symbol-for-symbol on 2026-10-14 against the SDK repos — Swift at `1480349`, Kotlin at `c7baeca`, TypeScript at `db88816` — including the accept step, which ADR-0028 settles as `accept(requestId)` on the join-request event. The earlier "0.6 snippets" (accept left as a comment, 10/11/10 lines) are gone; so are the counts of the pre-canonical `TruesealSyncClient` API (18/16/10), which no longer exists in any SDK repo.

A minimal integration is one device's code for all four steps: open the client, handle incoming messages, pair (make a token, accept the request, and join on the other device) and send. The count is every line except blank lines and comment-only lines, with the code laid out the way each language's usual formatter lays it out. Imports count. App code the snippet calls (`store`, `repository`, `db`, `location`, `scannedToken`, `relayPublicKey`, `scope`, `context`) doesn't.

### Swift: 18 lines

Matches `trueseal-sync-swift/README.md` at `1480349` ("Open", "Pair two devices", "Send & receive"): `TrueSeal.open(relay:storage:)` takes a storage `URL`, `startPairing()` and `join(token:)` throw, the event case is `.joinRequest(let request)`, and `accept(requestId:)` throws.

### Kotlin: 19 lines

Matches `trueseal-sync-kotlin/README.md` at `c7baeca`: `TrueSeal.open` is suspend with `storage = Storage.android(context)`, the event is `TrueSealEvent.JoinRequestReceived`, and `accept(event.request.id)` is suspend — the listener dispatches it with `scope.launch` (listeners must never call back into the object synchronously). The two extra lines over Swift are the `TrueSealEvent`/`kotlinx.coroutines` imports.

### TypeScript: 16 lines

Matches `trueseal-sync-ts/README.md` at `db88816`: `TrueSeal.open(address, { storageDir })` takes an options object, events are matched on `event.type === 'joinRequest'`, and `startPairing()`, `join(token)` and `accept(id)` are synchronous while `send` returns the Message ID.

None of the three was compiled — the 0.6 packages aren't published yet (OPS-4). The counts are of the source as written on the Landing, verified against the repos named above. Compiling all three against the published packages is the last open step of this claim.

## Comparison table

The table compares TrueSeal with libsodium plus your own pairing, and with CloudKit encrypted fields. It had a "Your own backend" column. That column describes code the reader writes, so it has no primary source, and it was removed. The "ordering" half of "Offline outbox and ordering" was removed too: Apple's docs don't state an order for CKSyncEngine.

Sources, all read on 2026-10-08. The 2026-10-14 pass re-verified the TrueSeal column against the current ADRs and code (pins updated where the cited code moved) and re-checked every cell against the Landing copy in `src/components/landing/Overview.astro` (identical). The external pages (libsodium, Apple) were not re-fetched in this pass; their dated citations below are the bound of those cells — re-read them if a row changes or before a major launch push:

- [L1] libsodium documentation, Introduction, https://libsodium.gitbook.io/doc (latest version 1.0.22-stable). "Sodium is a modern, easy-to-use software library for encryption, decryption, signatures, password hashing, and more." It runs on Windows, iOS and Android, has JavaScript and WebAssembly versions, and "bindings for all common programming languages". Its table of contents has key exchange and no pairing, membership, networking or storage.
- [A1] Apple, `CKRecord.encryptedValues`, https://developer.apple.com/documentation/cloudkit/ckrecord/encryptedvalues. "CloudKit encrypts the fields' values on-device before saving them to iCloud ... When you enable Advanced Data Protection, the encryption keys are available exclusively to the record's owner and, if the user shares the record, that share's participants." `CKAsset` is encrypted by default, references aren't encrypted, and encryption isn't allowed in the public database. Available on iOS 15, iPadOS 15, Mac Catalyst 15, macOS 12, tvOS 15, visionOS 1 and watchOS 8.
- [A2] Apple, `CKShare`, https://developer.apple.com/documentation/cloudkit/ckshare. "CloudKit limits the number of participants in a share to 100, and each participant must have an active iCloud account."
- [A3] Apple, `CKSyncEngine`, https://developer.apple.com/documentation/cloudkit/cksyncengine-5sie5. The app registers pending changes with `add(pendingRecordZoneChanges:)`, and "the engine automatically schedules" a sync. iOS 17 and macOS 14 or later.
- [A4] Apple, CloudKit framework overview, https://developer.apple.com/documentation/cloudkit. "Store structured app and user data in iCloud containers", and CloudKit manages "the transfer of data to and from iCloud servers".
- TrueSeal cells trace to the accepted ADRs in `trueseal-sync/docs/adr` and `trueseal-relay/docs/adr`, and to `trueseal-roadmap/spec/developer-preview.md`.

| Row | Column | Cell | Verdict | Evidence |
|---|---|---|---|---|
| Server can read the data | libsodium | No | verified | L1: the app encrypts on the device before anything reaches its server. |
| Server can read the data | CloudKit | Not those fields, if the user turned on Advanced Data Protection | verified | A1. Was "No, for those fields", which A1 doesn't support without Advanced Data Protection. |
| Server can read the data | TrueSeal | No | verified | sync ADR-0031 line 5 (the relay-readable part of an Envelope is the version, the recipient key and the sealed payload); spec section 4 standard wording. |
| Pairing and membership | libsodium | You build it | verified | L1: key exchange, no pairing or membership. |
| Pairing and membership | CloudKit | iCloud sharing, an iCloud account each | verified | A2. Was "Apple ID". |
| Pairing and membership | TrueSeal | Included | verified | sync ADR-0023 (pairing), ADR-0027 (membership). |
| Offline outbox | libsodium | You build it | verified | L1: no networking or storage. |
| Offline outbox | CloudKit | Included, with CKSyncEngine | verified | A3. |
| Offline outbox | TrueSeal | Included | verified | sync ADR-0026 (the durable outbox, line 11); `trueseal-sync` at `af16c4e` and later — `send()` returns once the entry is durably queued and one background pump per session drains the outbox while connected, replaying after reconnect (`src/session/sender.rs:1-5`). (The 2026-10-08 citation named the pre-canonical Swift client, which no longer exists.) |
| Platforms | libsodium | Any | verified | L1. |
| Platforms | CloudKit | Apple platforms | verified | A1 availability list. Was "Apple". |
| Platforms | TrueSeal | Swift, Kotlin, TypeScript | verified | sync ADR-0030 lines 9 to 11; the three SDK repos. |
| Runs on your own server | libsodium | Yes, you write the server | verified | L1: a library, so the server is the app's own. Was "Yes". |
| Runs on your own server | CloudKit | No | verified | A4. |
| Runs on your own server | TrueSeal | Yes | verified | relay ADR-0012 line 5. |
| Ready for production | libsodium | The library is stable. Your protocol is yours to judge. | verified | L1 (1.0.22-stable). Was "Yours to judge". |
| Ready for production | CloudKit | Yes | verified | A1: a released API since iOS 15. |
| Ready for production | TrueSeal | Not yet. It's a preview. | verified | sync ADR-0033 lines 5 to 10. |
