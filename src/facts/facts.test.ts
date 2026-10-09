import { describe, expect, test } from 'bun:test';
import { factTable, factText, type FactValue, type SharedFacts } from './facts.ts';
import { sharedFacts as data } from './shared-facts.ts';

// Read through the declared shape: `satisfies` keeps each entry's own narrow type.
const sharedFacts: SharedFacts = data;

const source = { adr: ['trueseal-sync ADR-0028'] };

function withValue(value: FactValue): SharedFacts {
  return {
    versions: [], relayAddress: [], relayLimits: [], errors: [], events: [], deliveryIssues: [], valueSets: [],
    clientLimits: [{ id: 'fact', name: 'Fact', meaning: 'A fact.', source, value }],
  };
}

const fixture: SharedFacts = {
  versions: [],
  relayAddress: [{ id: 'address', name: 'Address', meaning: 'A format.', source, value: { kind: 'format', value: 'x://y' } }],
  clientLimits: [{ id: 'unset', name: 'Unset', meaning: 'Not fixed.', source, todo: 'TODO: no ADR fixes it.' }],
  relayLimits: [],
  errors: [
    { id: 'groupFull', args: ['max'], meaning: 'Full.', source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0027'], code: ['trueseal-sync src/ffi.rs'] } },
    { id: 'closed', meaning: 'Closed.', source },
  ],
  events: [{ id: 'statusChanged', args: ['status', 'reason'], reasonSet: 'statusReason', meaning: 'Changed.', source }],
  deliveryIssues: [],
  valueSets: [
    { id: 'statusReason', values: ['created', 'joined'], meaning: 'Reasons.', source },
    { id: 'dropped', values: [], meaning: 'Unknown.', source, todo: 'TODO: no ADR names them.' },
  ],
};

describe('factText', () => {
  test.each([
    [{ kind: 'bytes', value: 61440 }, '61,440 bytes (60 KiB)'],
    [{ kind: 'bytes', value: 268435456 }, '268,435,456 bytes (256 MiB)'],
    [{ kind: 'bytes', value: 1000 }, '1,000 bytes'],
    [{ kind: 'duration', seconds: 2592000 }, '30 days'],
    [{ kind: 'duration', seconds: 300 }, '5 minutes'],
    [{ kind: 'duration', seconds: 25 }, '25 seconds'],
    [{ kind: 'duration', seconds: 1 }, '1 second'],
    [{ kind: 'backoff', fromSeconds: 1, toSeconds: 300 }, 'from 1 second to 5 minutes'],
    [{ kind: 'rate', perSecond: 20, burst: 500, noun: 'pushes' }, '20 pushes per second sustained, bursts of 500'],
    [{ kind: 'count', value: 100, noun: 'Blobs', approximate: true }, 'about 100 Blobs'],
    [{ kind: 'count', value: 10000, noun: 'Blobs' }, '10,000 Blobs'],
    [{ kind: 'port', value: 7700 }, '7700'],
    [{ kind: 'version', value: 1 }, '1'],
    [{ kind: 'release', value: '0.6.0' }, '0.6.0'],
  ] as [FactValue, string][])('%o reads %s', (value, text) => {
    expect(factText('fact', withValue(value))).toEqual({ text, code: false });
  });

  test('a format shows as code', () => {
    expect(factText('address', fixture)).toEqual({ text: 'x://y', code: true });
  });

  test('an unknown id, a case id or a fact with no value fails, naming the id', () => {
    expect(() => factText('missing', fixture)).toThrow('Unknown Shared Fact "missing"');
    expect(() => factText('closed', fixture)).toThrow('Unknown Shared Fact "closed"');
    expect(() => factText('unset', fixture)).toThrow('Shared Fact "unset" has no value yet: TODO: no ADR fixes it.');
  });
});

describe('factTable', () => {
  test('errors show their signature with braces and their sources', () => {
    const table = factTable('errors', fixture);
    expect(table.columns).toEqual(['Case', 'Reasons', 'When', 'Source']);
    expect(table.rows).toEqual([
      { name: { text: 'groupFull{max}', code: true }, value: [], meaning: [{ text: 'Full.', code: false }], source: 'trueseal-sync ADR-0028, trueseal-sync ADR-0027; code: trueseal-sync src/ffi.rs' },
      { name: { text: 'closed', code: true }, value: [], meaning: [{ text: 'Closed.', code: false }], source: 'trueseal-sync ADR-0028' },
    ]);
  });

  test('events show their signature with parentheses and the values of their reason set', () => {
    expect(factTable('events', fixture).rows[0]).toMatchObject({
      name: { text: 'statusChanged(status, reason)', code: true },
      value: [{ text: 'created', code: true }, { text: 'joined', code: true }],
    });
  });

  test('a meaning shows its backticked spans as code', () => {
    const data = { ...fixture, errors: [{ id: 'closed', meaning: 'A call after `close()`.', source }] };
    expect(factTable('errors', data).rows[0].meaning).toEqual([
      { text: 'A call after ', code: false },
      { text: 'close()', code: true },
      { text: '.', code: false },
    ]);
  });

  test('a value fact or value set not fixed yet says so', () => {
    expect(factTable('clientLimits', fixture)).toMatchObject({
      columns: ['Fact', 'Value', 'Meaning', 'Source'],
      rows: [{ name: { text: 'Unset', code: false }, value: [{ text: 'Not fixed by an ADR yet.', code: false }] }],
    });
    const sets = factTable('valueSets', fixture);
    expect(sets.columns).toEqual(['Set', 'Values', 'Meaning', 'Source']);
    expect(sets.rows[1].value).toEqual([{ text: 'Not fixed by an ADR yet.', code: false }]);
    expect(sets.rows[0]).toMatchObject({ name: { text: 'statusReason', code: true } });
  });
});

describe('the Shared Facts data', () => {
  const groups = Object.values(sharedFacts) as { id: string; source: { adr: string[] }; todo?: string }[][];
  const entries = groups.flat();

  test('ids are unique across every group', () => {
    const ids = entries.map(entry => entry.id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  });

  test('every entry cites an ADR, and every todo starts with TODO:', () => {
    expect(entries.filter(entry => entry.source.adr.length === 0).map(entry => entry.id)).toEqual([]);
    expect(entries.filter(entry => entry.todo !== undefined && !entry.todo.startsWith('TODO:')).map(entry => entry.id)).toEqual([]);
  });

  test('every value fact has a value or a todo saying why not', () => {
    const valueFacts = [...sharedFacts.versions, ...sharedFacts.relayAddress, ...sharedFacts.clientLimits, ...sharedFacts.relayLimits];
    expect(valueFacts.filter(fact => fact.value === undefined && fact.todo === undefined).map(fact => fact.id)).toEqual([]);
  });

  test('every reasonSet names a value set', () => {
    const sets = new Set(sharedFacts.valueSets.map(set => set.id));
    const cases = [...sharedFacts.errors, ...sharedFacts.events, ...sharedFacts.deliveryIssues];
    expect(cases.filter(c => c.reasonSet !== undefined && !sets.has(c.reasonSet)).map(c => c.id)).toEqual([]);
  });

  test('no value reads with a dash the brandbook bans', () => {
    const valueFacts = [...sharedFacts.versions, ...sharedFacts.relayAddress, ...sharedFacts.clientLimits, ...sharedFacts.relayLimits];
    const texts = valueFacts.filter(fact => fact.value).map(fact => factText(fact.id).text);
    expect(texts.filter(text => /—|–| - /.test(text))).toEqual([]);
  });
});
