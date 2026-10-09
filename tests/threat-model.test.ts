// The Threat Model data in src/config/threatModel.ts: every claim names its tests, the limitations cover
// release spec section 4, and the ADR wording is verbatim.
import { describe, expect, test } from 'bun:test';
import { relayTtl } from '../src/config/sharedFacts.ts';
import {
  adversaries,
  claims,
  defineClaims,
  ipWording,
  limitations,
  notDefendedAgainst,
  pinnedCommits,
  properties,
  standardWording,
  testLocation,
  testRefs,
  vocabulary,
  type Claim,
  type TestRef,
} from '../src/config/threatModel.ts';
import { findBannedTerms } from './banned-terms.ts';

const someTest: TestRef = { repo: 'trueseal-sync', path: 'src/crypto.rs', name: 'wrong_key_decrypt_returns_error' };
const valid: Claim = { property: 'Integrity', claim: 'A claim.', decision: 'sync ADR-0031', tests: [someTest] };

describe('defineClaims', () => {
  test('returns valid rows unchanged', () => {
    const rows = [valid, { ...valid, limit: { value: '1 day', inside: someTest, outside: someTest } }];
    expect(defineClaims(rows)).toEqual(rows);
  });

  test('throws on a row with no test', () => {
    expect(() => defineClaims([{ ...valid, tests: [] as unknown as Claim['tests'] }])).toThrow('A claim.');
  });

  test('throws on a limit without a test past it', () => {
    const limit = { value: '1 day', inside: someTest } as Claim['limit'];
    expect(() => defineClaims([{ ...valid, limit }])).toThrow('A claim.');
  });

  test('throws on an unknown property', () => {
    expect(() => defineClaims([{ ...valid, property: 'Authenticity' as Claim['property'] }])).toThrow('A claim.');
  });
});

describe('the Threat Model', () => {
  test('every property has at least one claim', () => {
    expect(properties.filter(property => !claims.some(claim => claim.property === property))).toEqual([]);
  });

  test('the limitations are the ten in release spec section 4, in order', () => {
    expect(limitations.map(limitation => limitation.id)).toEqual([
      'forward-secrecy',
      'data-at-rest',
      'what-the-relay-sees',
      'availability',
      'membership',
      'destroy-group',
      'pairing',
      'relay-key',
      'message-handler',
      'audit',
    ]);
  });

  test('the IP sentence is relay ADR-0012 verbatim', () => {
    expect(ipWording).toBe(
      'The relay never logs, stores or uses your IP address. The server it runs on still sees the connection, as with any internet service. To hide your IP from the server too, use a VPN or Tor.',
    );
  });

  test('the Destroy Group limitation is sync ADR-0029 verbatim', () => {
    expect(limitations.find(limitation => limitation.id === 'destroy-group')!.points).toEqual([
      "It can't recover or erase anything the stolen device already received or stored.",
      "It can't force the stolen device to wipe itself.",
      `It doesn't reach a device that stays offline longer than the relay's message lifetime (${relayTtl.text} by default). That device keeps its old group until the user destroys or leaves it there too.`,
      'It doesn\'t complete while your device can\'t reach the relay. Your device shows "destroying" until it can.',
      'Any current or former member can trigger it. That includes a stolen device, which can end your group, though that cuts it off from the group as well.',
    ]);
  });

  test('the membership limitation is sync ADR-0027 verbatim', () => {
    expect(limitations.find(limitation => limitation.id === 'membership')!.points).toEqual([
      'Every current member is fully trusted for membership.',
      'A hostile current member can remove everyone else.',
      'A removed device that does not cooperate can still rewrite membership on devices that have not yet seen its removal.',
      'Neither is defended against. The response to a hostile or compromised device is Destroy Group.',
    ]);
  });

  test('testRefs names each test once, inside and past every limit included', () => {
    const refs = testRefs();
    const keys = refs.map(ref => `${ref.repo} ${ref.path} ${ref.name}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const { limit } of claims.filter(claim => claim.limit)) {
      expect(refs).toContainEqual(limit!.inside);
      expect(refs).toContainEqual(limit!.outside);
    }
  });

  test('a test links to its file at the pinned commit', () => {
    const sha = pinnedCommits['trueseal-sync'];
    expect(testLocation(someTest).url).toBe(`https://github.com/julianbonomini/trueseal-sync/blob/${sha}/src/crypto.rs`);
  });

  test('every pin is a full commit SHA', () => {
    expect(Object.values(pinnedCommits).filter(sha => !/^[0-9a-f]{40}$/.test(sha))).toEqual([]);
  });

  test('no claim, limitation or vocabulary entry uses a banned term', () => {
    const text = [
      standardWording,
      ipWording,
      ...claims.flatMap(claim => [claim.claim, claim.limit?.value ?? '']),
      ...limitations.flatMap(limitation => [limitation.title, ...limitation.points, limitation.note ?? '']),
      ...adversaries.flatMap(adversary => [adversary.name, adversary.can]),
      ...notDefendedAgainst,
      ...vocabulary.flatMap(entry => [entry.term, entry.meaning]),
    ].join('\n');
    expect(findBannedTerms(text)).toEqual([]);
  });
});
