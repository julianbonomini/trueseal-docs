# Evidence for brandbook section 10 and the Landing comparison table

Each claim from [section 10](90_SYNTHESIS.md#10-claims-that-need-evidence-before-launch) and each cell of the Landing comparison table (`src/components/landing/Overview.astro`) has one of three verdicts:

- **verified**: the evidence below backs it, and Landing copy may use it;
- **pending human check**: it needs a step an unattended run can't take, and it stays out of Landing copy until someone does it and changes the verdict here;
- **removed**: nothing backs it, and it isn't in any copy.

Sibling-repo paths are relative to the folder that holds `trueseal-docs`. Line numbers are as of the commit named.

## Section 10 claims

| Claim | Verdict | Evidence | Date |
|---|---|---|---|
| "About ten lines" | removed | The SDKs as they stand take 18 lines of Swift, 16 of Kotlin and 10 of TypeScript ([counts below](#about-ten-lines)). Two of three are over ten, so the Landing states the counts instead. The 0.6 API the Landing shows isn't released, so it can't be counted yet. | 2026-10-08 |
| "About ten lines" for the 0.6 SDKs | pending human check | Count the [0.6 snippets](#the-06-snippets-on-the-landing) against the released 0.6 packages, with the accept step written out, and compile each one. | 2026-10-08 |
| "Three screens" | removed | Never in Landing copy. Nothing counts the screens an app needs, and it depends on the app's own pairing UI. | 2026-10-08 |
| "A relay in one container" | pending human check | The Operate pages as written run it as one container: `src/content/docs/operate/running-a-relay.mdx` has one compose service, `relay`, with its data on one volume. Relay ADR-0012 line 5 makes that the one supported deployment. Still to do: follow that page on a clean machine with the released image. Until then the Landing doesn't say "one container". | 2026-10-08 |
| Life360 data-broker report (The Markup, December 2021) | removed | Not cited anywhere on the site. No primary source was checked. | 2026-10-08 |
| Etebase's current status | removed | Not named anywhere on the site. No primary source was checked. | 2026-10-08 |
| The IP sentence, wording | verified | `src/components/landing/Trust.astro` and `running-a-relay.mdx` quote it verbatim from `trueseal-relay/docs/adr/0012-self-hosted-preview-baseline.md`, section "IP addresses", "Public wording". `tests/landing.test.ts` checks the Landing text. | 2026-10-08 |
| The IP sentence, relay behaviour | pending human check | Relay ADR-0012 is accepted but not yet implemented. `trueseal-relay` at `0170fce` still logs the client address when a listener hits its connection limit and when a long push session closes (`cmd/trueseal-relay/main.go:138`, :156, :171). ADR-0012's release gate (an e2e run that fails if a client address appears in the log or in `inbox.db`) has to pass on the released relay before the sentence is true of it. The Landing keeps the sentence because the ticket requires ADR-0012's wording there. | 2026-10-08 |

## About ten lines

A minimal integration is one device's code for all four steps: open the client, handle incoming messages, pair (make a token, accept the request, and join on the other device) and send. The count is every line except blank lines and comment-only lines, with the code laid out the way each language's usual formatter lays it out. Imports count. App code the snippet calls (`store`, `repository`, `db`, `location`, `scannedToken`, `relayPublicKey`, `scope`, `context`) doesn't.

### Swift: 18 lines

`trueseal-sync-swift` at `61ff921`. API: `TruesealSyncClient(relayURL:relayPublicKey:)` (`Sources/TruesealSync/TruesealSyncClient.swift:89`), `blobs` (:51), `pairingRequests` (:63), `generatePairingToken()` (:147), `joinGroup(token:)` (:159), `acceptPairingRequest(_:)` (:173), `publish(_:)` (:193), `ReceivedBlob.messageId` and `.data` (`Sources/TruesealSync/Models.swift:19`, :11).

```swift
import TruesealSync

let client = try TruesealSyncClient(
    relayURL: URL(string: "tcp://relay.example.com")!,
    relayPublicKey: relayPublicKey
)

Task {
    for await blob in client.blobs {
        try await store.save(blob.messageId, blob.data)
    }
}
Task {
    for await request in client.pairingRequests {
        client.acceptPairingRequest(request)
    }
}

let token = client.generatePairingToken() // show it as a QR code
try client.joinGroup(token: scannedToken) // on the other device
try await client.publish(location)
```

### Kotlin: 16 lines

`trueseal-sync-kotlin` at `9670a4a`. API: `TruesealSyncClient(context, relayHost, relayPublicKey)` (`lib/src/main/kotlin/dev/trueseal/sync/TruesealSyncClient.kt:52`), `blobs` (:79), `pairingRequests` (:95), `generatePairingToken()` (:161), `joinGroup(token)` (:174), `acceptPairingRequest(request)` (:190), `publish(data)` (:223), `ReceivedBlob.messageId` and `.data` (`lib/src/main/kotlin/dev/trueseal/sync/Models.kt:20`, :13).

```kotlin
import dev.trueseal.sync.TruesealSyncClient
import kotlinx.coroutines.launch

val client = TruesealSyncClient(
    context = context,
    relayHost = "relay.example.com",
    relayPublicKey = relayPublicKey,
)

scope.launch {
    client.blobs.collect { blob -> repository.save(blob.messageId, blob.data) }
}
scope.launch {
    client.pairingRequests.collect { request -> client.acceptPairingRequest(request) }
}

val token = client.generatePairingToken() // show it as a QR code
client.joinGroup(scannedToken) // on the other device
client.publish(location)
```

### TypeScript: 10 lines

`trueseal-sync-ts` at `76b008f`, package `trueseal-sync-ts` (`package.json:2`). API: `TruesealSyncClient.create(config)` (`src/index.ts:133`) with `relayHost` and `relayPublicKey` (:49, :51), the `message` event (:92), `onMemberRequest` (:229), `acceptPairingRequest` (:234), `pairingToken()` (:201), `joinGroup(token)` (:209), `send(blob)` (:263).

```ts
import { TruesealSyncClient } from 'trueseal-sync-ts'

const client = await TruesealSyncClient.create({
  relayHost: 'relay.example.com',
  relayPublicKey,
})

client.on('message', (blob, senderId, messageId) => db.put(messageId, blob))
client.onMemberRequest((request) => client.acceptPairingRequest(request))

const token = client.pairingToken() // show it as a QR code
client.joinGroup(scannedToken) // on the other device
await client.send(location)
```

None of the three was compiled. The counts are of the source as written here.

### The 0.6 snippets on the Landing

`src/components/landing/Integrate.astro` shows the 0.6 API from trueseal-sync ADR-0028 and the package names from ADR-0030. Without comments they are 10 lines of Swift, 11 of Kotlin and 10 of TypeScript. They leave the accept step as a comment, because ADR-0028 names the `joinRequest(request)` event but doesn't settle how each language matches on it. Those counts aren't evidence for "about ten lines" until the step is written out and the code runs against the released packages.

## Comparison table

The table compares TrueSeal with libsodium plus your own pairing, and with CloudKit encrypted fields. It had a "Your own backend" column. That column describes code the reader writes, so it has no primary source, and it was removed. The "ordering" half of "Offline outbox and ordering" was removed too: Apple's docs don't state an order for CKSyncEngine.

Sources, all read on 2026-10-08:

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
| Offline outbox | TrueSeal | Included | verified | sync ADR-0026 line 5; `trueseal-sync-swift` at `61ff921`, `publish(_:)` queues the blob in a durable local outbox when the relay is unreachable (`Sources/TruesealSync/TruesealSyncClient.swift:186`). |
| Platforms | libsodium | Any | verified | L1. |
| Platforms | CloudKit | Apple platforms | verified | A1 availability list. Was "Apple". |
| Platforms | TrueSeal | Swift, Kotlin, TypeScript | verified | sync ADR-0030 lines 9 to 11; the three SDK repos. |
| Runs on your own server | libsodium | Yes, you write the server | verified | L1: a library, so the server is the app's own. Was "Yes". |
| Runs on your own server | CloudKit | No | verified | A4. |
| Runs on your own server | TrueSeal | Yes | verified | relay ADR-0012 line 5. |
| Ready for production | libsodium | The library is stable. Your protocol is yours to judge. | verified | L1 (1.0.22-stable). Was "Yours to judge". |
| Ready for production | CloudKit | Yes | verified | A1: a released API since iOS 15. |
| Ready for production | TrueSeal | Not yet. It's a preview. | verified | sync ADR-0033 lines 5 to 10. |
