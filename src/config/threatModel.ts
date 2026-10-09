// The Threat Model: what TrueSeal claims about security, the tests that prove each claim, and what it
// doesn't defend against (trueseal-roadmap#16). Both surfaces and scripts/check-threat-model.ts read it.
import { factText } from '../facts/facts';
import pins from './threatModelPins.json';

const protocolSizeLimit = factText('protocolSizeLimit');
const relayTtlDefault = factText('relayTtlDefault');
const relayTtlMax = factText('relayTtlMax');
const replayWindow = factText('replayWindow');

export type Repo = 'trueseal-sync' | 'trueseal-noise' | 'trueseal-relay' | 'trueseal-e2e';

/** One test by the repo it lives in, its file path in that repo, and its name: a Rust or Go test function,
 *  or a node:test `test()` / `t.test()` name. */
export interface TestRef {
  repo: Repo;
  path: string;
  name: string;
}

export const properties = ['Confidentiality', 'Integrity', 'Availability', 'Metadata privacy', 'Forward secrecy'] as const;

export type Property = (typeof properties)[number];

/** A claim and the tests that prove it. A numeric limit also names a test inside it and one past it. */
export interface Claim {
  property: Property;
  claim: string;
  /** The ADR that decides it, e.g. "sync ADR-0031". */
  decision: string;
  tests: [TestRef, ...TestRef[]];
  limit?: { value: string; inside: TestRef; outside: TestRef };
}

/** One of the ten limitations in release spec section 4. */
export type LimitationId =
  | 'forward-secrecy'
  | 'data-at-rest'
  | 'what-the-relay-sees'
  | 'availability'
  | 'membership'
  | 'destroy-group'
  | 'pairing'
  | 'relay-key'
  | 'message-handler'
  | 'audit';

/** Something TrueSeal doesn't do. `id` is its anchor on the page. */
export interface Limitation {
  id: LimitationId;
  title: string;
  points: string[];
  note?: string;
}

/** Returns `rows` unchanged. Throws an Error naming the claim when a row has no test, an unknown property,
 *  or a limit without both an inside and an outside test. The site build fails on it. */
export function defineClaims(rows: Claim[]): readonly Claim[] {
  for (const row of rows) {
    const problem = problemWith(row);
    if (problem) throw new Error(`Threat Model claim "${row.claim}" ${problem}. Untested claims belong in Limitations.`);
  }
  return rows;
}

function problemWith(row: Claim): string | undefined {
  if (!properties.includes(row.property)) return `has an unknown property "${row.property}"`;
  if (row.tests.length === 0) return 'names no test';
  if (row.limit && !(row.limit.inside && row.limit.outside)) return 'is a limit without a test on each side of it';
  return undefined;
}

const sync = (path: string, name: string): TestRef => ({ repo: 'trueseal-sync', path, name });
const noise = (path: string, name: string): TestRef => ({ repo: 'trueseal-noise', path, name });
const relay = (path: string, name: string): TestRef => ({ repo: 'trueseal-relay', path, name });
const e2e = (name: string): TestRef => ({ repo: 'trueseal-e2e', path: 'test/system.test.mjs', name });

export const claims: readonly Claim[] = defineClaims([
  {
    property: 'Confidentiality',
    claim: 'Only the device a message is addressed to can decrypt its body.',
    decision: 'sync ADR-0031',
    tests: [
      sync('src/crypto.rs', 'wrong_key_decrypt_returns_error'),
      sync('src/session/tests/push.rs', 'envelope_addressed_to_wrong_key_is_silently_dropped'),
      sync('src/session/tests/sealed_envelope.rs', 'seal_binds_version_recipient_and_ephemeral_key'),
      e2e('relay store holds only sealed payloads'),
    ],
  },
  {
    property: 'Confidentiality',
    claim: "After a device sees a member's removal, it sends that member nothing more and discards what the member sends.",
    decision: 'sync ADR-0027',
    tests: [
      sync('src/session/tests/remove_member.rs', 'removed_member_no_longer_receives_fanout_blobs'),
      sync('src/session/tests/remove_member.rs', 'removed_member_messages_are_discarded'),
      e2e('member removal reaches removed device'),
    ],
  },
  {
    property: 'Confidentiality',
    claim:
      'Destroy Group ends the group for every device that receives it. Each device that receives it passes the Destroy on to the members it knows about, deletes all group state, and starts over with a new identity. After that, no device that received it sends anything to any old device address, the stolen one included.',
    decision: 'sync ADR-0029',
    tests: [
      sync('src/session/tests/destroy_group.rs', 'destroy_group_fires_on_group_destroyed_on_all_members'),
      sync('src/session/tests/destroy_group.rs', 'store_wipe_clears_keypair_and_manifest'),
      sync('src/session/tests/destroy_group.rs', 'push_sync_after_destroy_returns_group_destroyed'),
      sync('src/session/tests/destroy_group.rs', 'receiver_forwards_revoke_to_known_members'),
      e2e('Destroy Group reaches every current member'),
      e2e('nothing is addressed to old keys after Destroy Group'),
    ],
  },
  {
    property: 'Integrity',
    claim: "A message is accepted only if a current member signed it. The relay can't modify, re-address or forge it.",
    decision: 'sync ADR-0031',
    tests: [
      sync('src/envelope.rs', 'tampered_payload_fails_verification'),
      sync('src/envelope.rs', 'tampered_sequence_fails_verification'),
      sync('src/envelope.rs', 'wrong_author_key_fails_verification'),
      sync('src/envelope.rs', 'attribution_forgery_is_rejected'),
      sync('src/session/tests/manifest_filter.rs', 'message_from_non_member_is_discarded'),
      sync('src/session/tests/sealed_envelope.rs', 'readdressed_blob_is_rejected'),
      sync('src/session/tests/sealed_envelope.rs', 'swapped_ephemeral_key_is_rejected'),
      sync('src/session/tests/manifest_hijack.rs', 'manifestless_device_drops_sync_from_non_member'),
    ],
  },
  {
    property: 'Integrity',
    claim:
      "A joining device trusts only the group whose Pairing Token it scanned, and never accepts a Group Manifest it didn't ask for.",
    decision: 'sync ADR-0023',
    tests: [
      sync('src/session/tests/manifest_hijack.rs', 'joiner_accepts_only_initiator_manifest'),
      sync('src/session/tests/manifest_hijack.rs', 'device_that_never_joined_rejects_unsolicited_manifest'),
      sync('src/session/tests/manifest_hijack.rs', 'relay_cannot_inject_manifest'),
      sync('src/session/tests/manifest_hijack.rs', 'pair_signing_pub_must_match_envelope_signer'),
    ],
  },
  {
    property: 'Integrity',
    claim: 'A message reaches the handler at most once, even when a malicious relay delivers it again.',
    decision: 'sync ADR-0031, ADR-0034',
    tests: [
      e2e('byte-identical replay reaches the handler once'),
      sync('src/session/tests/replay_window.rs', 'future_dated_message_deduplicated_past_handling_window'),
    ],
    limit: {
      value: `the Replay Window, ${replayWindow.text}`,
      inside: sync('src/session/tests/replay_window.rs', 'blob_59_days_old_is_accepted'),
      outside: sync('src/session/tests/replay_window.rs', 'blob_61_days_old_is_rejected'),
    },
  },
  {
    property: 'Availability',
    claim:
      "Each addressed device gets every message at least once, in the order its sender sent it, while the relay is honest and the message's lifetime hasn't passed.",
    decision: 'sync ADR-0026',
    tests: [
      e2e('offline recipient drains durable relay inbox after process restart'),
      e2e('sender outbox replays after relay restart'),
      e2e('messages from one sender arrive in send order'),
      sync('src/session/tests/outbox.rs', 'outbox_survives_crash_and_replays_on_reconnect'),
      sync('src/session/tests/outbox.rs', 'undelivered_entries_replayed_after_reconnect'),
      relay('internal/relay/e2e_test.go', 'TestE2E_TCPDropBeforeAck_Redelivers'),
    ],
    limit: {
      value: `the relay message lifetime, at most ${relayTtlMax.text}`,
      inside: e2e('message delivered just inside the relay TTL'),
      outside: e2e('message dropped just past the relay TTL'),
    },
  },
  {
    property: 'Metadata privacy',
    claim:
      'Stored messages carry no sender identity and no lasting sender pseudonym. Two sends from one device share no value the relay can read, except the End-to-End Version, and the recipient key when both go to the same device.',
    decision: 'sync ADR-0031',
    tests: [
      sync('src/session/tests/push.rs', 'push_does_not_expose_stable_noise_key_to_relay'),
      sync('src/session/tests/sealed_envelope.rs', 'two_sends_share_only_version_and_recipient'),
    ],
  },
  {
    property: 'Metadata privacy',
    claim: 'The relay never logs, stores or uses your IP address.',
    decision: 'relay ADR-0012',
    tests: [e2e('relay log and store hold no client address in normal and dev mode')],
  },
  {
    property: 'Metadata privacy',
    claim: 'Outside dev mode the relay logs no client metadata, and it ships no log viewer and no metrics endpoint.',
    decision: 'relay ADR-0012',
    tests: [
      e2e('normal-mode relay log holds no client metadata'),
      relay('cmd/trueseal-relay/main_test.go', 'TestServer_NoMetricsEndpoint'),
    ],
  },
  {
    property: 'Forward secrecy',
    claim:
      'Traffic between a device and the relay is encrypted, authenticates the relay, and is forward-secret against network observers.',
    decision: 'relay ADR-0002',
    tests: [
      noise('tests/cacophony.rs', 'cacophony_noise_nk_and_xx_spec_vectors'),
      sync('src/relay.rs', 'wrong_relay_key_is_rejected'),
      relay('internal/session/push_test.go', 'TestAcceptPush_WrongRelayKeyRejected'),
      relay('internal/session/receive_test.go', 'TestAcceptReceive_TamperedHandshakeRejected'),
    ],
  },
]);

/** The IP sentence, verbatim from relay ADR-0012 and brandbook section 10. */
export const ipWording =
  'The relay never logs, stores or uses your IP address. The server it runs on still sees the connection, as with any internet service. To hide your IP from the server too, use a VPN or Tor.';

/** The standard security wording from trueseal-roadmap#16. */
export const standardWording =
  "TrueSeal is end-to-end encrypted. The relay can't read or forge messages, and here is exactly what it does see.";

export const limitations: readonly Limitation[] = [
  {
    id: 'forward-secrecy',
    title: 'No forward secrecy end to end',
    points: [
      'There is no end-to-end forward secrecy and no post-compromise security.',
      'A stolen device key decrypts every message ever addressed to that device, including any a malicious relay kept.',
      'Transport forward secrecy protects only against network observers.',
    ],
  },
  {
    id: 'data-at-rest',
    title: 'Data at rest',
    points: [
      "Keys and pending plaintext sit in the app's sandbox, protected only by the operating system.",
      "A thief with access to an unlocked device's files, or malware, gets them.",
      'Moving keys into Keychain or Keystore is planned after the preview.',
    ],
  },
  {
    id: 'what-the-relay-sees',
    title: 'What the relay sees',
    points: [
      "Each device's key, and when it is online.",
      `Who receives a message, its size (up to ${protocolSizeLimit.text} of Sync body) and its time.`,
      "Which devices receive the same messages. A single send fans out to every group member in one connection, with matching sizes and timing, from the sender's network address, so a relay operator can infer which devices likely share a group (sync ADR-0024).",
      'Which End-to-End Version a device runs, from which messages it leaves unacknowledged (sync ADR-0022).',
      'Often, which device sent a message, by IP address or timing.',
    ],
    note: ipWording,
  },
  {
    id: 'availability',
    title: 'Availability',
    points: [
      'A relay can drop or delay any message.',
      "Anyone who knows a device's public key can use up that device's Inbox quota and delay its delivery. Quotas are kept per recipient, and the relay doesn't prevent this (relay ADR-0012).",
      'Any current or former member can trigger Destroy Group.',
    ],
  },
  {
    id: 'membership',
    title: 'Membership',
    points: [
      'Every current member is fully trusted for membership.',
      'A hostile current member can remove everyone else.',
      'A removed device that does not cooperate can still rewrite membership on devices that have not yet seen its removal.',
      'Neither is defended against. The response to a hostile or compromised device is Destroy Group.',
    ],
  },
  {
    id: 'destroy-group',
    title: 'What Destroy Group does not do',
    points: [
      "It can't recover or erase anything the stolen device already received or stored.",
      "It can't force the stolen device to wipe itself.",
      `It doesn't reach a device that stays offline longer than the relay's message lifetime (${relayTtlDefault.text} by default). That device keeps its old group until the user destroys or leaves it there too.`,
      'It doesn\'t complete while your device can\'t reach the relay. Your device shows "destroying" until it can.',
      'Any current or former member can trigger it. That includes a stolen device, which can end your group, though that cuts it off from the group as well.',
    ],
  },
  {
    id: 'pairing',
    title: 'Pairing',
    points: [
      "There is no SAS or fingerprint check (sync ADR-0023). The inviter's explicit admission is the only check.",
      'Anyone who photographs a Pairing Token can use it while the pairing window is open.',
    ],
  },
  {
    id: 'relay-key',
    title: 'Relay key',
    points: ["The relay key can't be rotated in the preview. Changing it breaks every client configuration (relay ADR-0012)."],
  },
  {
    id: 'message-handler',
    title: 'Message handler',
    points: [
      'The library acknowledges a message only after the handler finishes, so the relay sees how long the handler takes.',
      'A handler that never finishes stalls delivery (sync ADR-0026).',
    ],
  },
  {
    id: 'audit',
    title: 'Not independently audited',
    points: ['TrueSeal is not independently audited. Every claim on this page names the tests that prove it instead (sync ADR-0033).'],
  },
];

export const adversaries: readonly { name: string; can: string }[] = [
  { name: 'A malicious relay', can: 'Drops, delays, reorders, replays and injects messages, and reads everything it stores.' },
  { name: 'A network observer', can: 'Watches traffic between devices and the relay, passively or actively.' },
  { name: "An outsider who knows a device's public key", can: "Can push messages to that device's Inbox." },
  {
    name: 'A current member',
    can: 'Fully trusted for membership changes. What a hostile one can do is listed under Not defended against.',
  },
  { name: 'A removed or former member', can: 'Still holds its old keys and everything it already received.' },
  { name: 'A device thief', can: 'Holds the device, and the keys and data on it.' },
];

export const notDefendedAgainst: readonly string[] = [
  'Malware on a device, or a compromised operating system.',
  'A global passive adversary that watches the whole network.',
  'Network-level identity. Anyone who sees the connections can correlate IP addresses and timing.',
  'A hostile current member. Every current member is fully trusted for membership changes (sync ADR-0027).',
];

export const vocabulary: readonly { term: string; meaning: string }[] = [
  {
    term: 'End-to-end encrypted',
    meaning: 'A message is encrypted on the sending device for the device it is addressed to, and only that device can decrypt it.',
  },
  {
    term: 'Relay',
    meaning:
      "The server that holds sealed messages in each device's Inbox until the device collects them. It is untrusted for confidentiality and integrity, and trusted only for availability.",
  },
  { term: 'Member', meaning: 'A device in the Group Manifest of a Sync Group.' },
  { term: 'Former member', meaning: 'A device that was removed or left, or whose group was destroyed.' },
  {
    term: 'Replay Window',
    meaning: `The age, ${replayWindow.text}, past which a device rejects a message as too old (sync ADR-0031).`,
  },
  { term: 'Destroy Group', meaning: 'Ending a group on every device that receives the Destroy (sync ADR-0029).' },
];

/** A claim's tests in the order the page lists them: its own, then the one inside its limit and the one past it. */
export function evidenceOf(claim: Claim): { ref: TestRef; side?: 'inside' | 'outside' }[] {
  const evidence: { ref: TestRef; side?: 'inside' | 'outside' }[] = claim.tests.map(ref => ({ ref }));
  if (claim.limit) evidence.push({ ref: claim.limit.inside, side: 'inside' }, { ref: claim.limit.outside, side: 'outside' });
  return evidence;
}

/** Every test the claims name, inside and outside tests included, once each, in claims order. */
export function testRefs(rows: readonly Claim[] = claims): TestRef[] {
  const all = rows.flatMap(row => evidenceOf(row).map(({ ref }) => ref));
  return all.filter(
    (ref, index) => all.findIndex(other => other.repo === ref.repo && other.path === ref.path && other.name === ref.name) === index,
  );
}

/** Each repo's pinned commit SHA, from threatModelPins.json. */
export const pinnedCommits: Readonly<Record<Repo, string>> = pins;

/** Where a test lives at its repo's pinned commit (threatModelPins.json). `url` is the GitHub blob page. */
export function testLocation(ref: TestRef): { owner: 'julianbonomini'; repo: Repo; sha: string; path: string; url: string } {
  const sha = pinnedCommits[ref.repo];
  return { owner, repo: ref.repo, sha, path: ref.path, url: `${repoUrl(ref.repo)}/blob/${sha}/${ref.path}` };
}

/** The GitHub page of a repo's pinned commit. */
export function pinnedCommitUrl(repo: Repo): string {
  return `${repoUrl(repo)}/commit/${pinnedCommits[repo]}`;
}

const owner = 'julianbonomini';
const repoUrl = (repo: Repo) => `https://github.com/${owner}/${repo}`;
