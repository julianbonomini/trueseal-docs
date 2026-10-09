// The Compatibility Table module: compatibility.json passes its checks, a data edit alone changes the
// printed table, and malformed data fails with the release and field named. No dist/ needed.
import { describe, expect, test } from 'bun:test';
import { compatibilityColumns, compatibilityTable } from '../src/config/compatibility.ts';

const released = {
  truesealRelease: '0.6.0',
  relay: '0.2.0',
  noise: '0.2.0',
  transportVersion: 1,
  endToEndVersion: 1,
  sessionStateStoreVersion: 1,
  relayStoreVersion: 1,
  migrationFloor: '0.6.0',
  status: 'released',
};

test('compatibility.json passes, and every row has a cell per column', () => {
  const { rows } = compatibilityTable();
  expect(rows.filter(row => row.length !== compatibilityColumns.length)).toEqual([]);
});

test('the columns cover release spec section 5', () => {
  expect(compatibilityColumns).toEqual([
    'TrueSeal Release',
    'Relay',
    'Noise',
    'Transport Version',
    'End-to-End Version',
    'Session State Store Version',
    'Relay Store Version',
    'Migration floor',
  ]);
});

test('a data edit alone changes the table, newest release first', () => {
  const before = compatibilityTable({ releases: [released] });
  const after = compatibilityTable({
    releases: [{ ...released, relay: '0.2.1' }, { ...released, truesealRelease: '0.10.0', relay: '0.3.0' }],
  });
  expect(after).not.toEqual(before);
  expect(after.rows.map(row => row[0])).toEqual(['0.10.0', '0.6.0']);
  expect(after.rows[1][1]).toBe('0.2.1');
  expect(before.rows).toEqual([['0.6.0', '0.2.0', '0.2.0', '1', '1', '1', '1', '0.6.0']]);
});

test("a planned release's first cell says so", () => {
  expect(compatibilityTable({ releases: [{ ...released, status: 'planned' }] }).rows[0][0]).toBe('0.6.0 (planned)');
});

test('no releases gives no rows and still the columns', () => {
  expect(compatibilityTable({ releases: [] })).toEqual({ columns: compatibilityColumns, rows: [] });
});

describe('malformed data fails, naming the release and the field', () => {
  const { relay: _, ...withoutRelay } = released;
  test.each([
    ['a missing key', [withoutRelay], /release 1 \(0\.6\.0\).*relay/],
    ['an unknown key', [{ ...released, kotlin: '1.0.0' }], /release 1 \(0\.6\.0\).*kotlin/],
    ['a version that is not X.Y.Z', [{ ...released, noise: '0.2' }], /release 1 \(0\.6\.0\).*noise/],
    ['a bad release version', [{ ...released, truesealRelease: 'v0.6.0' }], /release 1: truesealRelease/],
    ['a protocol version of 0', [{ ...released, transportVersion: 0 }], /release 1 \(0\.6\.0\).*transportVersion/],
    ['an unknown status', [{ ...released, status: 'beta' }], /release 1 \(0\.6\.0\).*status/],
    ['a floor newer than its release', [{ ...released, migrationFloor: '0.7.0' }], /release 1 \(0\.6\.0\): migrationFloor "0\.7\.0" is newer than the release/],
    ['a release listed twice', [released, released], /release 2 \(0\.6\.0\).*truesealRelease.*twice/],
  ])('%s', (_name, releases, message) => {
    expect(() => compatibilityTable({ releases })).toThrow(message);
  });

  test('data with no releases array', () => {
    expect(() => compatibilityTable({})).toThrow(/Compatibility Table.*releases/);
  });
});
