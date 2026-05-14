---
title: Swift SDK
description: Integration reference for trueseal-sync-swift — the Swift SDK for iOS and macOS.
---

# Swift SDK

`trueseal-sync-swift` wraps the trueseal-sync Rust core via UniFFI. It targets iOS and macOS and is distributed as a Swift package.

---

## Structure

The SDK exposes one public module: `TrueSealSync`. All FFI types are hidden behind the internal `TrueSealSyncBindings` module. **Never import `TrueSealSyncBindings` directly from app code** — use `TrueSealSync` only.

---

## Construction

```swift
import TrueSealSync

let client = try TrueSealSyncClient(
    relayURL: URL(string: "tcp://relay-host:7700")!,
    relayPublicKey: Data([/* 32-byte X25519 key — see relay setup */]),
    storageDirectory: appScopedStorageURL,
    namespace: "default"
)
```

`relayPublicKey` is a build-time constant. Decode the 64-char hex string from `relay -genkey` into 32 bytes:

```swift
func hexToData(_ hex: String) -> Data {
    var data = Data()
    var index = hex.startIndex
    while index < hex.endIndex {
        let next = hex.index(index, offsetBy: 2)
        data.append(UInt8(hex[index..<next], radix: 16)!)
        index = next
    }
    return data
}

let relayPublicKey = hexToData("your64charhexstring...")
```

---

## Async streams

All event streams are `AsyncStream` values. Consume them on `Task` instances. Bridge to `@MainActor` / `@Published` for UI updates.

```swift
// Connection state
Task {
    for await state in client.connectionState {
        await MainActor.run {
            self.isRelayConnected = (state == .connected)
        }
    }
}

// Incoming blobs
Task {
    for await blob in client.blobs {
        await MainActor.run {
            self.handleIncoming(blob.data, from: blob.senderNoisePub)
        }
    }
}

// Member events
Task {
    for await event in client.memberEvents {
        await MainActor.run { self.handleMemberEvent(event) }
    }
}

// Pairing requests
Task {
    for await request in client.pairingRequests {
        await MainActor.run { self.showPairingRequest(request) }
    }
}
```

---

## Key methods

```swift
// Identity
client.localDeviceName          // String — e.g. "FreeMap"
client.localNodeId              // String — e.g. "aB3xK9qR2mN"

// Members
client.members                  // [SyncMember] — current manifest snapshot (excludes local device)

// Pairing
client.generatePairingToken()   // String — stable base64url token
client.joinGroup(token: String) throws
client.acceptPairingRequest(_ r: PairingRequest)
client.cancelPairing()

// Sync
client.publish(text: String) async throws
client.publish(blob: Data) async throws

// Group management
client.removeMember(_ member: SyncMember) throws
client.destroyGroup()
```

`localDeviceName` and `localNodeId` are synchronous computed properties — safe to call on any thread.

---

## Entitlements

Outbound TCP connections require the network client entitlement on both macOS and iOS. Without it the relay connection silently fails.

```xml
<!-- YourApp.entitlements -->
<key>com.apple.security.network.client</key>
<true/>
```

---

## iOS: background connectivity

On iOS, TCP connections are suspended when the app backgrounds:

- `connectionState` will emit `.disconnected` on background
- The outbox replays automatically on next foreground + reconnection
- Do not surface `RELAY: OFFLINE` as a user-facing error while the app is backgrounded

If you need a short window to finish an in-flight publish before suspension:

```swift
var backgroundTask: UIBackgroundTaskIdentifier = .invalid

func applicationDidEnterBackground(_ application: UIApplication) {
    backgroundTask = application.beginBackgroundTask {
        application.endBackgroundTask(self.backgroundTask)
    }
}
```

---

## macOS: menu bar apps

For `LSUIElement = YES` menu bar apps that also show a main window:

```swift
// When the main window opens
NSApp.setActivationPolicy(.regular)

// When the main window closes
NSApp.setActivationPolicy(.accessory)
```

This gives a Dock icon only while the window is visible — correct behaviour for a menu bar utility.

---

## Non-blocking sockets

If building trueseal-sync from source, ensure the Rust TCP transport factories have non-blocking mode enabled. With blocking sockets the connection mutex is held during `read()`, starving concurrent sends — this manifests as pairing messages that are ack'd by the relay but never received by the host.

The fix is `set_nonblocking(true)` on both transport factory implementations in `ffi.rs`. The distributed xcframework has this applied.
