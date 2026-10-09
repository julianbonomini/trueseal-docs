// Every Shared Fact, with its source. Values follow the accepted ADRs where the code lags (`gap`).
// A fact no ADR settles carries `todo: 'TODO: …'`, never a guess. trueseal-sync SYNC-21 will later
// generate this file from the core.
import type { SharedFacts } from './facts';

const caseSetGap = "today's `ffi.rs` has a different error and callback set; it is reshaped to ADR-0028 under SYNC-15";

export const sharedFacts = {
  versions: [
    {
      id: 'trueSealRelease', name: 'TrueSeal Release', value: { kind: 'release', value: '0.6.0' },
      meaning: 'The lockstep release of trueseal-sync and the three SDKs these docs describe.',
      source: { adr: ['trueseal-sync ADR-0030'] },
    },
    {
      id: 'transportVersion', name: 'Transport Version', value: { kind: 'version', value: 1 },
      meaning: 'Device to Relay: the Noise handshake and frames.',
      source: { adr: ['trueseal-sync ADR-0022'] },
      gap: 'the code sends an unversioned format (SYNC-1, RELAY-5)',
    },
    {
      id: 'endToEndVersion', name: 'End-to-End Version', value: { kind: 'version', value: 1 },
      meaning: 'Device to Device: the Envelope, signatures and Addressed Encryption.',
      source: { adr: ['trueseal-sync ADR-0022'] },
      gap: 'the code sends an unversioned format (SYNC-1)',
    },
    {
      id: 'sessionStoreVersion', name: 'Session State Store Version', value: { kind: 'version', value: 1 },
      meaning: 'The Store Version the first preview release writes to Session State.',
      source: { adr: ['trueseal-sync ADR-0032'] },
      gap: 'the code writes no Store Version (SYNC-13)',
    },
    {
      id: 'relayStoreVersion', name: 'Relay Store Version', value: { kind: 'version', value: 1 },
      meaning: 'The Store Version the first preview relay writes to `inbox.db`.',
      source: { adr: ['trueseal-relay ADR-0013'] },
      gap: 'the relay writes no Store Version (RELAY-13)',
    },
  ],
  relayAddress: [
    {
      id: 'relayAddressFormat', name: 'Relay Address format',
      value: { kind: 'format', value: 'trueseal://<relay public key hex>@host[:receivePort][?push=pushPort]' },
      meaning: 'The single string a client is configured with.',
      source: { adr: ['trueseal-sync ADR-0028'] },
      gap: '`ffi.rs` takes a host and fixed ports, and parses no `trueseal://` string (SYNC-15)',
    },
    {
      id: 'defaultReceivePort', name: 'Default receive port', value: { kind: 'port', value: 7700 },
      meaning: 'The Receive Session listener, Noise XX.',
      source: { adr: ['trueseal-sync ADR-0028'], code: ['trueseal-sync src/ffi.rs', 'trueseal-relay internal/config/config.go'] },
    },
    {
      id: 'defaultPushPort', name: 'Default push port', value: { kind: 'port', value: 7701 },
      meaning: 'The Push Session listener, Noise NK.',
      source: { adr: ['trueseal-sync ADR-0028'], code: ['trueseal-sync src/ffi.rs', 'trueseal-relay internal/config/config.go'] },
    },
  ],
  clientLimits: [
    {
      id: 'protocolSizeLimit', name: 'Protocol Size Limit', value: { kind: 'bytes', value: 61440 },
      meaning: 'The largest `Sync` body `send()` accepts.',
      source: { adr: ['trueseal-sync ADR-0025'] },
      gap: 'trueseal-sync `src/relay.rs` `MAX_ENVELOPE_BYTES` is 1,048,576; trueseal-relay `internal/config/config.go` `DefaultMaxEnvelopeBytes` is 65,482 Envelope bytes',
      todo: "TODO: no ADR fixes the relay's default `max_envelope_bytes` in Envelope bytes; trueseal-relay ADR-0012 says it defaults to the Protocol Size Limit.",
    },
    {
      id: 'maxGroupSize', name: 'Maximum Group Size', value: { kind: 'count', value: 32, noun: 'members' },
      meaning: 'The most devices one Sync Group holds.',
      source: { adr: ['trueseal-sync ADR-0027', 'trueseal-sync ADR-0028'] },
      gap: 'not enforced',
    },
    {
      id: 'heldBlobCap', name: 'Held-Blob cap', value: { kind: 'count', value: 100, noun: 'Blobs per device', approximate: true },
      meaning: 'Newer-version Blobs a device leaves unacked; beyond it the oldest is dropped as `unreadable(droppedWhileHeld)`.',
      source: { adr: ['trueseal-sync ADR-0022', 'trueseal-sync ADR-0034'] },
      gap: 'not implemented',
      todo: 'TODO: the ADRs say about 100; no ADR fixes the exact cap.',
    },
    {
      id: 'handlerAttempts', name: 'Handler attempts', value: { kind: 'count', value: 5, noun: 'attempts' },
      meaning: 'Times the message handler runs for one message before `handlerGaveUp`.',
      source: { adr: ['trueseal-sync ADR-0026'] },
      gap: 'not implemented',
    },
    {
      id: 'retryBackoff', name: 'Push retry backoff', value: { kind: 'backoff', fromSeconds: 1, toSeconds: 300 },
      meaning: 'Exponential backoff for a temporarily refused push while connected.',
      source: { adr: ['trueseal-sync ADR-0026'] },
      gap: 'the code retries only on reconnect, from 1 s to 30 s (trueseal-sync `src/session/reconnect.rs`)',
    },
    {
      id: 'outboxExpiry', name: 'Outbox expiry', value: { kind: 'duration', seconds: 2592000 },
      meaning: 'A `Sync` entry undelivered this long after `send()` is removed with `sendFailed(messageId, expired)`. Control entries never expire.',
      source: { adr: ['trueseal-sync ADR-0026', 'trueseal-sync ADR-0034'] },
      gap: 'not implemented',
    },
    {
      id: 'replayWindow', name: 'Replay Window', value: { kind: 'duration', seconds: 5184000 },
      meaning: 'A message whose Sender Timestamp is older than this is dropped as `unreadable(expired)`.',
      source: { adr: ['trueseal-sync ADR-0031', 'trueseal-sync ADR-0034'] },
      gap: 'not implemented',
    },
  ],
  relayLimits: [
    {
      id: 'relayTtlDefault', name: 'Relay TTL default', value: { kind: 'duration', seconds: 2592000 },
      meaning: 'How long an undelivered Blob stays in an Inbox.',
      source: { adr: ['trueseal-relay ADR-0012'], code: ['trueseal-relay internal/config/config.go'] },
    },
    {
      id: 'relayTtlMax', name: 'Relay TTL ceiling', value: { kind: 'duration', seconds: 2592000 },
      meaning: 'The longest TTL the relay starts with.',
      source: { adr: ['trueseal-sync ADR-0034', 'trueseal-relay ADR-0012'] },
      gap: 'no ceiling enforced',
    },
    {
      id: 'heartbeatInterval', name: 'Heartbeat interval', value: { kind: 'duration', seconds: 25 },
      meaning: 'The client sends a Heartbeat on its Receive Session this often.',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'heartbeats are relay-initiated today',
    },
    {
      id: 'receiveIdleTimeout', name: 'Receive idle timeout', value: { kind: 'duration', seconds: 75 },
      meaning: 'The relay closes a Receive Session with no frame for this long.',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
    {
      id: 'handshakeDeadline', name: 'Handshake deadline', value: { kind: 'duration', seconds: 10 },
      meaning: 'The Noise handshake limit on both listeners.',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
    {
      id: 'pushSessionDeadline', name: 'Push Session deadline', value: { kind: 'duration', seconds: 30 },
      meaning: "A Push Session's total life, from accept to close.",
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
    {
      id: 'shutdownDrain', name: 'Shutdown drain', value: { kind: 'duration', seconds: 10 },
      meaning: 'On SIGTERM, how long in-progress pushes get to commit and Ack.',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'trueseal-relay `cmd/trueseal-relay/main.go` waits 30 s',
    },
    {
      id: 'inboxMaxBlobs', name: 'Blobs per Inbox', value: { kind: 'count', value: 10000, noun: 'Blobs' },
      meaning: 'Over it, a push is refused `inbox full` (temporary).',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
    {
      id: 'inboxMaxBytes', name: 'Bytes per Inbox', value: { kind: 'bytes', value: 268435456 },
      meaning: 'Over it, a push is refused `inbox full` (temporary).',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
    {
      id: 'pushRate', name: 'Push rate per recipient', value: { kind: 'rate', perSecond: 20, burst: 500, noun: 'pushes' },
      meaning: 'A token bucket; over it, a push is refused `rate limited` (temporary).',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
    {
      id: 'maxConnectionsPerListener', name: 'Connections per listener', value: { kind: 'count', value: 1000, noun: 'connections' },
      meaning: 'Over it, new connections are closed.',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
    {
      id: 'maxReceiveSessionsPerDevice', name: 'Receive Sessions per device', value: { kind: 'count', value: 4, noun: 'Receive Sessions' },
      meaning: 'Over it, a new session is refused.',
      source: { adr: ['trueseal-relay ADR-0012'] },
      gap: 'none in code',
    },
  ],
  errors: [
    { id: 'invalidRelayAddress', meaning: "`open()` was given a Relay Address it can't parse.", source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap },
    {
      id: 'invalidNamespace', meaning: '`open()` was given a namespace it refuses.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap,
      todo: 'TODO: no ADR says which namespaces are invalid.',
    },
    {
      id: 'storage', meaning: "Session State can't be read or written, or a migration failed; the old store is left intact.",
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0032'] }, gap: caseSetGap,
    },
    { id: 'closed', meaning: 'A call on a `TrueSeal` object after `close()`.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap },
    { id: 'notMember', args: ['status'], meaning: '`send()` while the status is not `member`.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap },
    {
      id: 'alreadyInGroup', meaning: '`join(token)` on a device that already has a Sync Group in this namespace.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0023'] }, gap: caseSetGap,
    },
    { id: 'invalidPairingToken', meaning: '`join(token)` with a string that is not a valid Pairing Token.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap },
    { id: 'pairingClosed', meaning: '`accept(request)` after the pairing window closed.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap },
    {
      id: 'groupFull', args: ['max'], meaning: '`accept(request)` when admitting would exceed the Maximum Group Size; `max` is that size.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0027'] }, gap: caseSetGap,
    },
    {
      id: 'memberNotFound', meaning: 'A member id that names no current member.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap,
      todo: 'TODO: no ADR says which calls raise it.',
    },
    {
      id: 'payloadTooLarge', args: ['max'], meaning: '`send()` with a body over `maxPayloadBytes`; `max` is the limit in force. Nothing enters the outbox.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0025'] }, gap: caseSetGap,
    },
    { id: 'messageHandlerAlreadySet', meaning: 'A second `onMessage(handler)`.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap },
    {
      id: 'storeTooNew', meaning: '`open()` found Session State written by a newer release; the store is left unchanged.',
      source: { adr: ['trueseal-sync ADR-0032'] }, gap: caseSetGap,
    },
  ],
  events: [
    {
      id: 'statusChanged', args: ['status', 'reason'], reasonSet: 'statusReason', meaning: "The device's status changed.",
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0032'] }, gap: caseSetGap,
    },
    {
      id: 'membersChanged', args: ['members'],
      meaning: 'The whole current member list, never a delta. It can briefly show a member leave and rejoin while a concurrent change is re-applied.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0027'] }, gap: caseSetGap,
    },
    {
      id: 'joinRequest', args: ['request'], meaning: 'A device asks to join while the pairing window is open; `request` is `JoinRequest{id, name}`.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0023'] }, gap: caseSetGap,
    },
    { id: 'connectionChanged', args: ['connection'], meaning: 'The relay connection changed.', source: { adr: ['trueseal-sync ADR-0028'] }, gap: caseSetGap },
    {
      id: 'admissionDropped', args: ['name', 'reason'], reasonSet: 'admissionDroppedReason',
      meaning: 'An admission this device issued was dropped, for example because re-applying it would exceed the Maximum Group Size. The joiner stays in Pending Join.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0027'] }, gap: caseSetGap,
    },
  ],
  deliveryIssues: [
    {
      id: 'unreadable', args: ['reason'], reasonSet: 'unreadableReason', meaning: "A Blob the library can't use was acked and dropped.",
      source: { adr: ['trueseal-sync ADR-0034'] }, gap: caseSetGap,
    },
    {
      id: 'unauthorized', meaning: 'A Blob failed the pairing or membership rules and was acked and dropped.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0026'] }, gap: caseSetGap,
    },
    {
      id: 'heldForUpgrade', args: ['version'], meaning: 'A Blob in a newer End-to-End Version stays unacked on the relay until this device upgrades.',
      source: { adr: ['trueseal-sync ADR-0022', 'trueseal-sync ADR-0028'] }, gap: caseSetGap,
    },
    {
      id: 'handlerGaveUp', args: ['messageId', 'error'], meaning: 'The message handler threw on every attempt; the Blob was acked and dropped.',
      source: { adr: ['trueseal-sync ADR-0026'] }, gap: caseSetGap,
    },
    {
      id: 'sendFailed', args: ['messageId', 'reason'], reasonSet: 'sendFailedReason',
      meaning: 'An outbox entry was removed: a permanent relay refusal, or a `Sync` entry past the outbox expiry.',
      source: { adr: ['trueseal-sync ADR-0026', 'trueseal-sync ADR-0028', 'trueseal-sync ADR-0034'] }, gap: caseSetGap,
    },
  ],
  valueSets: [
    { id: 'status', values: ['notJoined', 'pendingJoin', 'member', 'leaving'], meaning: "The device's `status`.", source: { adr: ['trueseal-sync ADR-0028'] } },
    {
      id: 'statusReason', values: ['created', 'joined', 'left', 'removed', 'destroyed', 'storeReset'], meaning: 'The reason in `statusChanged`.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0032'] },
    },
    {
      id: 'connection', values: ['connecting', 'connected', 'disconnected', 'relayVersionUnsupported{min, max}'], meaning: "The device's `connection`.",
      source: { adr: ['trueseal-sync ADR-0028'] },
    },
    {
      id: 'unreadableReason', values: ['malformed', 'senderOutdated', 'expired', 'droppedWhileHeld'], meaning: 'The reason in `unreadable`.',
      source: { adr: ['trueseal-sync ADR-0034'] },
    },
    {
      id: 'sendFailedReason', values: ['tooLarge', 'malformed', 'expired'], meaning: 'The reason in `sendFailed`.',
      source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0034'] },
    },
    {
      id: 'admissionDroppedReason', values: [], meaning: 'The reason in `admissionDropped`.',
      source: { adr: ['trueseal-sync ADR-0028'] },
      todo: 'TODO: no ADR names the reasons; trueseal-sync ADR-0027 gives one cause, a re-applied admission that would exceed the Maximum Group Size.',
    },
  ],
} satisfies SharedFacts;
