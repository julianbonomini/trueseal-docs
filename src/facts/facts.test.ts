import { describe, expect, test } from 'bun:test';
import { typedDuration, typedFacts } from '../../tests/typed-facts.ts';
import { factParts, factTable, factText, type CaseFact, type FactValue, type SharedFacts } from './facts.ts';
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
  versions: [{ id: 'transport', name: 'Transport Version', meaning: 'Wire.', source: { adr: ['trueseal-sync ADR-0028', 'trueseal-sync ADR-0027'], code: ['trueseal-sync src/ffi.rs'] }, value: { kind: 'version', value: 1 } }],
  relayAddress: [{ id: 'address', name: 'Address', meaning: 'A format.', source, value: { kind: 'format', value: 'x://y' } }],
  clientLimits: [{ id: 'unset', name: 'Unset', meaning: 'Not fixed.', source, todo: 'TODO: no ADR fixes it.' }],
  relayLimits: [],
  errors: [{ id: 'closed', meaning: 'Closed.', source }],
  events: [],
  deliveryIssues: [],
  valueSets: [
    { id: 'statusReason', values: ['created', 'joined'], meaning: 'Reasons.', source },
    { id: 'connection', values: ['connecting', 'connected', 'disconnected'], meaning: 'Connection.', source },
    { id: 'one', values: ['only'], meaning: 'One.', source },
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

describe('factParts', () => {
  test('a value fact is its written value', () => {
    expect(factParts('transport', fixture)).toEqual([factText('transport', fixture)]);
  });

  test('a value set is its values as code, joined "a, b or c"', () => {
    expect(factParts('connection', fixture)).toEqual([
      { text: 'connecting', code: true },
      { text: ', ', code: false },
      { text: 'connected', code: true },
      { text: ' or ', code: false },
      { text: 'disconnected', code: true },
    ]);
    expect(factParts('one', fixture)).toEqual([{ text: 'only', code: true }]);
  });

  test('an unknown id, a case id or a set with no values fails, naming the id', () => {
    expect(() => factParts('missing', fixture)).toThrow('Unknown Shared Fact "missing"');
    expect(() => factParts('closed', fixture)).toThrow('Unknown Shared Fact "closed"');
    expect(() => factParts('dropped', fixture)).toThrow('Value set "dropped" has no values yet: TODO: no ADR names them.');
  });
});

describe('factTable', () => {
  test('a value fact shows its name, written value and sources', () => {
    const table = factTable('versions', fixture);
    expect(table.columns).toEqual(['Fact', 'Value', 'Meaning', 'Source']);
    expect(table.rows).toEqual([
      { anchor: 'fact-transport', name: { text: 'Transport Version', code: false }, value: [{ text: '1', code: false }], meaning: [{ text: 'Wire.', code: false }], source: 'trueseal-sync ADR-0028, trueseal-sync ADR-0027; code: trueseal-sync src/ffi.rs' },
    ]);
  });

  test('each row carries its anchor: fact- or set- and the id lowercased', () => {
    expect(factTable('clientLimits', fixture).rows[0].anchor).toBe('fact-unset');
    expect(factTable('valueSets', fixture).rows[0].anchor).toBe('set-statusreason');
  });

  test('a meaning shows its backticked spans as code', () => {
    const data: SharedFacts = { ...fixture, relayLimits: [{ id: 'r', name: 'R', meaning: 'A call after `close()`.', source, value: { kind: 'port', value: 1 } }] };
    expect(factTable('relayLimits', data).rows[0].meaning).toEqual([
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
    expect(sets.rows[3].value).toEqual([{ text: 'Not fixed by an ADR yet.', code: false }]);
    expect(sets.rows[0]).toMatchObject({ name: { text: 'statusReason', code: true } });
  });

  test.each(['errors', 'events', 'deliveryIssues'])('the case group %s fails, pointing at ApiEntries', group => {
    expect(() => factTable(group as never, fixture)).toThrow('render cases with ApiEntries');
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

describe('the Shared Facts cases', () => {
  test('there are 13 errors, 5 events and 5 delivery issues, each with what the app should do', () => {
    expect([sharedFacts.errors.length, sharedFacts.events.length, sharedFacts.deliveryIssues.length]).toEqual([13, 5, 5]);
    const cases = [...sharedFacts.errors, ...sharedFacts.events, ...sharedFacts.deliveryIssues];
    expect(cases.filter(c => !c.action?.trim()).map(c => c.id)).toEqual([]);
  });

  const cases: CaseFact[] = [...sharedFacts.errors, ...sharedFacts.events, ...sharedFacts.deliveryIssues];
  const reasons = cases.flatMap(c => (c.reasons ?? []).map(reason => ({ ...reason, id: `${c.id}(${reason.value})` })));

  test('a case with reasons has one per value of its reasonSet, in order', () => {
    const mismatched = cases.filter(c => c.reasons).filter(c => {
      const set = sharedFacts.valueSets.find(set => set.id === c.reasonSet);
      return JSON.stringify(c.reasons!.map(r => r.value)) !== JSON.stringify(set?.values);
    });
    expect(mismatched.map(c => c.id)).toEqual([]);
  });

  test('every reason says what to do, cites an ADR, and its todo starts with TODO:', () => {
    expect(reasons.filter(r => !r.action.trim() || r.source.adr.length === 0).map(r => r.id)).toEqual([]);
    expect(reasons.filter(r => r.todo !== undefined && !r.todo.startsWith('TODO:')).map(r => r.id)).toEqual([]);
  });

  test('every fact a case or reason cites has a value', () => {
    const cited = [...cases, ...reasons].flatMap(c => (c.facts ?? []).map(id => ({ owner: c.id, id })));
    const broken = cited.filter(({ id }) => {
      try {
        factText(id);
        return false;
      } catch {
        return true;
      }
    });
    expect(broken).toEqual([]);
  });

  test('no case or reason types a Shared Fact value', () => {
    const typed = [...cases, ...reasons].flatMap(c =>
      [c.meaning, c.action ?? ''].filter(text => [...typedFacts, typedDuration].some(pattern => pattern.test(text))).map(text => `${c.id}: ${text}`),
    );
    expect(typed).toEqual([]);
  });

  test('the status value set includes destroying (trueseal-sync ADR-0029)', () => {
    expect(sharedFacts.valueSets.find(set => set.id === 'status')?.values).toEqual(['notJoined', 'pendingJoin', 'member', 'leaving', 'destroying']);
  });
});
