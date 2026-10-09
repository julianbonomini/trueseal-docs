import { describe, expect, test } from 'bun:test';
import { typedDuration, typedFacts } from '../../tests/typed-facts.ts';
import { voiceProblems } from '../../tests/html.ts';
import type { SharedFacts } from '../facts/facts.ts';
import { apiNames, apiSection, type ApiEntryData, type ApiReference, type ApiSection } from './api.ts';
import { apiReference as realData } from './api-reference.ts';

// Read through the declared shape: `satisfies` keeps each entry's own narrow type.
const apiReference: ApiReference = realData;

const source = { adr: ['trueseal-sync ADR-0028'] };

const facts: SharedFacts = {
  versions: [],
  relayAddress: [],
  clientLimits: [{ id: 'limit', name: 'Size Limit', meaning: 'A limit.', source, value: { kind: 'bytes', value: 1000 } }],
  relayLimits: [],
  errors: [
    { id: 'groupFull', args: ['max'], meaning: 'Full.', action: 'Remove a member with `remove`.', source },
    { id: 'closed', meaning: 'Closed.', action: 'Open again.', source },
  ],
  events: [{ id: 'statusChanged', args: ['status', 'reason'], meaning: 'Changed.', action: 'Update.', source }],
  deliveryIssues: [{ id: 'sendFailed', args: ['messageId', 'reason'], meaning: 'Failed.', action: 'Mark it.', source }],
  valueSets: [
    { id: 'connection', values: ['connected', 'relayVersionUnsupported{min, max}'], meaning: 'Connection.', source },
    { id: 'status', values: ['notJoined', 'member'], meaning: 'Status.', source },
  ],
};

function entry(overrides: Partial<ApiEntryData>): ApiEntryData {
  return {
    section: 'send', name: 'send', kind: 'method', shared: 'send(body)', meaning: 'Sends.', source,
    platforms: { swift: 'send(body)', kotlin: 'send(body)', typescript: 'send(body)' },
    ...overrides,
  };
}

const api: ApiReference = {
  entries: [
    entry({
      section: 'errors', name: 'TrueSealError', kind: 'type', shared: 'TrueSealError', aliases: ['TrueSealException'],
      platforms: { swift: 'TrueSealError', kotlin: 'TrueSealError', typescript: 'TrueSealError' },
    }),
    entry({
      section: 'state', name: 'Connection', kind: 'type', shared: 'Connection', valueSet: 'connection', tsValues: 'state',
      platforms: { swift: 'enum Connection', kotlin: 'Connection', typescript: 'type Connection' },
    }),
    entry({ section: 'state', name: 'GroupStatus', kind: 'type', shared: 'GroupStatus', valueSet: 'status' }),
    entry({
      name: 'TrueSeal.open', throws: ['closed'], facts: ['limit'], aliases: ['MAX_PAYLOAD_BYTES'],
      platforms: { swift: 'open(_ body)', kotlin: 'send(body)', typescript: 'open(body): Promise' },
    }),
  ],
};

const spelled = (section: ApiSection, index = 0) =>
  Object.fromEntries(apiSection(section, api, facts)[index].spellings.map(s => [s.platform, s.code]));

describe('apiSection', () => {
  test('errors are spelled by the case rule on every platform', () => {
    expect(spelled('errors', 1)).toEqual({
      swift: 'TrueSealError.groupFull(max:)',
      kotlin: 'TrueSealException.GroupFull(max)',
      typescript: 'TrueSealError { code: "GROUP_FULL", max }',
    });
    expect(spelled('errors', 2)).toEqual({
      swift: 'TrueSealError.closed',
      kotlin: 'TrueSealException.Closed',
      typescript: 'TrueSealError { code: "CLOSED" }',
    });
  });

  test('events and delivery issues are spelled by the case rule', () => {
    expect(spelled('events')).toEqual({
      swift: '.statusChanged(status, reason)',
      kotlin: 'TrueSealEvent.StatusChanged(status, reason)',
      typescript: '{ type: "statusChanged", status, reason }',
    });
    expect(spelled('deliveryIssues').kotlin).toBe('DeliveryIssue.SendFailed(messageId, reason)');
  });

  test('a type with a value set lists its values spelled per platform', () => {
    const [connection, status] = apiSection('state', api, facts);
    expect(connection.signature).toBe('Connection: connected | relayVersionUnsupported{min, max}');
    expect(Object.fromEntries(connection.spellings.map(s => [s.platform, s.code]))).toEqual({
      swift: 'enum Connection: .connected | .relayVersionUnsupported(min:max:)',
      kotlin: 'Connection: Connection.Connected | Connection.RelayVersionUnsupported(min, max)',
      typescript: 'type Connection: { state: "connected" } | { state: "relayVersionUnsupported", min, max }',
    });
    expect(status.spellings.find(s => s.platform === 'typescript')?.code).toBe('send(body): "notJoined" | "member"');
  });

  test('only platforms that differ from the shared signature are shown, Swift then Kotlin then TypeScript', () => {
    const [open] = apiSection('send', api, facts);
    expect(open.spellings.map(s => s.label)).toEqual(['Swift', 'TypeScript']);
    expect(apiSection('errors', api, facts)[0].spellings).toEqual([]);
  });

  test('errors start with the TrueSealError type, then every Shared Facts error in order', () => {
    const errors = apiSection('errors', api, facts);
    expect(errors.map(e => e.anchor)).toEqual(['api-truesealerror', 'error-groupfull', 'error-closed']);
    expect(errors[1]).toMatchObject({
      title: 'groupFull',
      signature: 'groupFull{max}',
      meaning: [{ text: 'Full.', code: false }],
      action: [{ text: 'Remove a member with ', code: false }, { text: 'remove', code: true }, { text: '.', code: false }],
    });
    expect(apiSection('deliveryIssues', api, facts)[0]).toMatchObject({ anchor: 'issue-sendfailed', signature: 'sendFailed(messageId, reason)' });
  });

  test('throws link to the error on the errors page, and values read the Shared Fact', () => {
    const [open] = apiSection('send', api, facts);
    expect(open.anchor).toBe('api-trueseal-open');
    expect(open.throws).toEqual([{ name: 'closed', href: '/agents/errors-and-events#error-closed' }]);
    expect(open.values).toEqual([{ name: 'Size Limit', value: { text: '1,000 bytes', code: false } }]);
  });

  test('an unknown error, value set or fact fails, naming it', () => {
    const broken = (overrides: Partial<ApiEntryData>) => () => apiSection('send', { entries: [entry(overrides)] }, facts);
    expect(broken({ throws: ['missing'] })).toThrow('Unknown error case "missing"');
    expect(broken({ valueSet: 'missing' })).toThrow('Unknown value set "missing"');
    expect(broken({ facts: ['missing'] })).toThrow('Unknown Shared Fact "missing"');
  });
});

describe('apiNames', () => {
  test('lists entry names, their segments, aliases, cases, values and case spellings, sorted and unique', () => {
    const names = apiNames(api, facts);
    expect(names).toEqual([...new Set(names)].sort());
    for (const name of [
      'TrueSeal.open', 'TrueSeal', 'open', 'MAX_PAYLOAD_BYTES', 'TrueSealException', 'groupFull', 'statusChanged', 'sendFailed',
      'relayVersionUnsupported', 'notJoined', 'TrueSealException.GroupFull', 'GROUP_FULL', 'TrueSealEvent.StatusChanged',
      'DeliveryIssue.SendFailed',
    ]) {
      expect({ name, listed: names.includes(name) }).toEqual({ name, listed: true });
    }
  });

  test('lists the fields of the real data, bare and on their entry', () => {
    const names = apiNames();
    for (const name of ['sdkVersion', 'TrueSeal.info.sdkVersion', 'cancel', 'Subscription.cancel']) {
      expect({ name, listed: names.includes(name) }).toEqual({ name, listed: true });
    }
  });
});

describe('the API reference data', () => {
  const entries = apiReference.entries;

  test('every public name of trueseal-sync ADR-0028 has an entry', () => {
    const adrNames = [
      'TrueSeal', 'TrueSeal.open', 'close', 'RelayAddress', 'RelayAddress.parse', 'Storage', 'status', 'me', 'members', 'connection',
      'GroupStatus', 'Connection', 'Member', 'onMessage', 'Message', 'MessageId', 'send', 'startPairing', 'accept', 'cancelPairing',
      'JoinRequest', 'join', 'cancelJoin', 'remove', 'leave', 'destroyGroup', 'onEvent', 'onDeliveryIssue', 'Subscription',
      'TrueSeal.info', 'TrueSeal.maxPayloadBytes', 'TrueSeal.maxGroupSize', 'TrueSealError',
    ];
    const names = new Set(entries.map(e => e.name));
    expect(adrNames.filter(name => !names.has(name))).toEqual([]);
  });

  test('names are unique, every entry cites an ADR, and every todo starts with TODO:', () => {
    const names = entries.map(e => e.name);
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
    expect(entries.filter(e => e.source.adr.length === 0).map(e => e.name)).toEqual([]);
    expect(entries.filter(e => e.todo !== undefined && !e.todo.startsWith('TODO:')).map(e => e.name)).toEqual([]);
  });

  test('every section resolves, and each API section has an entry', () => {
    const sections: ApiSection[] = ['open', 'state', 'receive', 'send', 'pairing', 'membership', 'subscribe', 'info', 'errors', 'events', 'deliveryIssues'];
    for (const section of sections) expect({ section, entries: apiSection(section).length > 0 }).toEqual({ section, entries: true });
  });

  test('no Shared Fact value is typed in the data', () => {
    const typed = entries.flatMap(e =>
      [e.meaning, e.action ?? '', e.shared ?? '', ...Object.values(e.platforms)]
        .filter(text => [...typedFacts, typedDuration].some(pattern => pattern.test(text)))
        .map(text => `${e.name}: ${text}`),
    );
    expect(typed).toEqual([]);
  });

  test('every rendered meaning and action follows the brandbook voice', () => {
    const sections: ApiSection[] = ['open', 'state', 'receive', 'send', 'pairing', 'membership', 'subscribe', 'info', 'errors', 'events', 'deliveryIssues'];
    const problems = sections.flatMap(section => apiSection(section)).flatMap(e =>
      [...e.meaning, ...e.action].flatMap(part => voiceProblems(part.text)).map(problem => `${e.anchor}: ${problem}`),
    );
    expect(problems).toEqual([]);
  });
});
