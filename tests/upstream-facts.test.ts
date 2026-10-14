// The vendored Shared Facts and API surface (docs ADR-0003): the committed files match their pinned
// sha256 digests, and the values Shared Facts derive from them really come from the vendored source.
import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { factText } from '../src/facts/facts.ts';
import { sharedFacts } from '../src/facts/shared-facts.ts';

const repo = join(import.meta.dir, '..');
const pin = JSON.parse(readFileSync(join(repo, 'src/facts/upstream/pin.json'), 'utf8'));
const upstream = JSON.parse(readFileSync(join(repo, 'src/facts/upstream/shared-facts.json'), 'utf8'));

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

describe('the vendored core export', () => {
  test('every vendored file matches its pinned sha256 (G8)', () => {
    for (const entry of Object.values(pin.files) as { sha256: string; vendoredAs: string }[]) {
      const actual = sha256(readFileSync(join(repo, entry.vendoredAs), 'utf8'));
      expect({ file: entry.vendoredAs, actual }).toEqual({ file: entry.vendoredAs, actual: entry.sha256 });
    }
  });

  test('the pin names an exact trueseal-sync commit', () => {
    expect(pin.repo).toBe('julianbonomini/trueseal-sync');
    expect(pin.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  test('Shared Facts values come from the vendored export, not literals', () => {
    expect(factText('protocolSizeLimit').text).toContain(upstream.limits.maxPayloadBytes.toLocaleString('en-US'));
    expect(factText('maxGroupSize').text).toContain(String(upstream.limits.maxGroupSize));
    expect(factText('transportVersion').text).toContain(String(upstream.versions.transportVersion));
    expect(factText('endToEndVersion').text).toContain(String(upstream.versions.endToEndVersion));
    expect(factText('defaultReceivePort').text).toContain(String(upstream.relayAddress.defaultReceivePort));
    expect(factText('defaultPushPort').text).toContain(String(upstream.relayAddress.defaultPushPort));
    expect(factText('relayAddressFormat').text).toContain(upstream.relayAddress.format);
  });

  test('every generated case set is represented exactly (the module-scope assertions load)', () => {
    // Importing shared-facts.ts runs the drift assertions; reaching here means they passed. These
    // spot-checks make the coverage explicit.
    expect(sharedFacts.errors.map(c => c.id)).toEqual(upstream.errors);
    expect(sharedFacts.events.map(c => c.id)).toEqual(upstream.events);
    expect(sharedFacts.deliveryIssues.map(c => c.id)).toEqual(upstream.deliveryIssues);
  });
});
