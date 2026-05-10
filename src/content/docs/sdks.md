# SDKs

hush-sync is the reference implementation of hush-protocol, written in Rust. For hush to be usable by any developer — not just Rust developers — the sync primitive needs to be importable in the languages developers actually build with.

## Planned SDKs

### Swift

Generated from the hush-sync Rust core via [UniFFI](https://github.com/mozilla/uniffi-rs). Distributed as a Swift package. Targets iOS and macOS apps.

### Kotlin

Generated from the hush-sync Rust core via UniFFI. Distributed as a Gradle artifact. Targets Android apps.

### TypeScript

The hush-sync Rust core compiled to WebAssembly, consumed as a TypeScript package. Targets web, Electron, Node, and React Native.

**Why WASM and not a native TypeScript reimplementation:**
A native TypeScript reimplementation would need to stay in sync with the Rust core indefinitely. Protocol divergence is a maintenance risk and a correctness risk. Compiling to WASM guarantees protocol correctness by construction — the same code runs everywhere. Bundle size and startup overhead are acceptable for desktop and server targets.

## Hosted Relay

SDKs are only half the story. Developers who don't want to run their own relay need a hosted instance they can point at during development. A publicly hosted relay with a published public key removes the last barrier to "import and go" adoption.

Self-hosting remains the default for production deployments — the hosted relay is for development, prototyping, and low-stakes experimentation. The security model is identical regardless of who runs the relay.
