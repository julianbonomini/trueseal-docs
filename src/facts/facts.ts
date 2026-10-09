// Shared Facts: the values both the Human Docs and the Agent Docs state. The values live in shared-facts.ts.
// This module owns how a fact is looked up and how its value is written, so no page formats a fact itself.
import { sharedFacts } from './shared-facts.ts';

/** A Shared Fact's value. Pages never see this shape; they get text from factText or factTable. */
export type FactValue =
  | { kind: 'release'; value: string }
  | { kind: 'version'; value: number }
  | { kind: 'port'; value: number }
  | { kind: 'format'; value: string }
  | { kind: 'bytes'; value: number }
  | { kind: 'count'; value: number; noun: string; approximate?: boolean }
  | { kind: 'duration'; seconds: number }
  | { kind: 'backoff'; fromSeconds: number; toSeconds: number }
  | { kind: 'rate'; perSecond: number; burst: number; noun: string };

/** Where a fact comes from: the ADRs that decide it, and the code that already has it. */
export interface FactSource {
  adr: string[];
  code?: string[];
}

interface FactBase {
  id: string;
  meaning: string;
  source: FactSource;
  /** How today's code differs from the ADR. Never rendered. */
  gap?: string;
  /** What no ADR or code settles yet, starting `TODO:`. Never rendered. */
  todo?: string;
}

/** A fact with one value. `value` is absent only on a fact whose `todo` says why. */
export interface ValueFact extends FactBase {
  name: string;
  value?: FactValue;
}

/** An error, event or delivery-issue case. `reasonSet` names the value set its `reason` argument takes. */
export interface CaseFact extends FactBase {
  args?: string[];
  reasonSet?: string;
  /** What the app does when it sees this case, Markdown backticks for code. Required on every error, event and delivery issue (tested). */
  action?: string;
}

export interface ValueSet extends FactBase {
  values: string[];
}

export interface SharedFacts {
  versions: ValueFact[];
  relayAddress: ValueFact[];
  clientLimits: ValueFact[];
  relayLimits: ValueFact[];
  errors: CaseFact[];
  events: CaseFact[];
  deliveryIssues: CaseFact[];
  valueSets: ValueSet[];
}

/** A piece of displayed text; `code` means it shows as inline code. */
export interface FactPart {
  text: string;
  code: boolean;
}

const valueGroups = ['versions', 'relayAddress', 'clientLimits', 'relayLimits'] as const;
/** The groups FactTable renders: the value groups and the value sets. Cases render through ApiEntries. */
export type TableGroup = (typeof valueGroups)[number] | 'valueSets';
/** The groups that hold error, event and delivery-issue cases. */
export type CaseGroup = 'errors' | 'events' | 'deliveryIssues';
const notFixed: FactPart = { text: 'Not fixed by an ADR yet.', code: false };

const number = new Intl.NumberFormat('en-US');

function plural(count: number, noun: string): string {
  return `${number.format(count)} ${count === 1 ? noun : `${noun}s`}`;
}

function duration(seconds: number): string {
  const units: [string, number][] = [['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
  const [unit, size] = units.find(([, size]) => seconds % size === 0)!;
  return plural(seconds / size, unit);
}

function bytes(value: number): string {
  const units: [string, number][] = [['MiB', 1024 * 1024], ['KiB', 1024]];
  const whole = units.find(([, size]) => value >= size && value % size === 0);
  const exact = `${number.format(value)} bytes`;
  return whole ? `${exact} (${number.format(value / whole[1])} ${whole[0]})` : exact;
}

function written(value: FactValue): FactPart {
  switch (value.kind) {
    case 'release': return { text: value.value, code: false };
    case 'format': return { text: value.value, code: true };
    // Versions and ports are identifiers, never grouped: 7700, not 7,700.
    case 'version':
    case 'port': return { text: String(value.value), code: false };
    case 'bytes': return { text: bytes(value.value), code: false };
    case 'count': return { text: `${value.approximate ? 'about ' : ''}${number.format(value.value)} ${value.noun}`, code: false };
    case 'duration': return { text: duration(value.seconds), code: false };
    case 'backoff': return { text: `from ${duration(value.fromSeconds)} to ${duration(value.toSeconds)}`, code: false };
    case 'rate': return { text: `${number.format(value.perSecond)} ${value.noun} per second sustained, bursts of ${number.format(value.burst)}`, code: false };
  }
}

function valueFact(id: string, data: SharedFacts): ValueFact {
  const fact = valueGroups.flatMap(group => data[group]).find(fact => fact.id === id);
  if (!fact) throw new Error(`Unknown Shared Fact "${id}"`);
  return fact;
}

/** The display text of the value fact `id`, e.g. "61,440 bytes (60 KiB)", "30 days", "7700".
 *  Throws `Unknown Shared Fact "<id>"` when no value fact has that id, and
 *  `Shared Fact "<id>" has no value yet: <todo>` when it has none, so a bad id fails the build. */
export function factText(id: string, data: SharedFacts = sharedFacts): FactPart {
  const fact = valueFact(id, data);
  if (!fact.value) throw new Error(`Shared Fact "${id}" has no value yet: ${fact.todo}`);
  return written(fact.value);
}

/** The display name of the value fact `id`, e.g. "Protocol Size Limit". Throws `Unknown Shared Fact "<id>"` like factText. */
export function factName(id: string, data: SharedFacts = sharedFacts): string {
  return valueFact(id, data).name;
}

function sourceText(source: FactSource): string {
  return source.code ? `${source.adr.join(', ')}; code: ${source.code.join(', ')}` : source.adr.join(', ');
}

// Meanings are written with Markdown backticks around code, so the data file reads like the docs.
/** Markdown backticks as code parts: "A call after `close()`." → text, code, text. Empty text gives no parts. */
export function meaningParts(meaning: string): FactPart[] {
  return meaning.split('`').map((text, index) => ({ text, code: index % 2 === 1 })).filter(part => part.text !== '');
}

/** A case as written in the docs: an error with braces (`groupFull{max}`), an event or delivery issue with
 *  parentheses (`sendFailed(messageId, reason)`), the bare id when it has no arguments. */
export function caseSignature(group: CaseGroup, c: CaseFact): string {
  if (!c.args) return c.id;
  return group === 'errors' ? `${c.id}{${c.args.join(', ')}}` : `${c.id}(${c.args.join(', ')})`;
}

function codeParts(values: string[], todo: string | undefined): FactPart[] {
  return values.length === 0 && todo ? [notFixed] : values.map(text => ({ text, code: true }));
}

/** The HTML id prefix of a FactTable row: a value fact or a value set. */
export const rowAnchorPrefix = { fact: 'fact-', set: 'set-' } as const;

/** Every fact of `group` as table rows, plus the four column labels:
 *  value groups → ['Fact', 'Value', 'Meaning', 'Source'];
 *  valueSets → ['Set', 'Values', 'Meaning', 'Source'].
 *  A value-set row lists its values as code parts. A fact or set with no value and a todo shows the single
 *  part "Not fixed by an ADR yet." A meaning is split into parts, its backticked spans as code.
 *  Source reads "trueseal-sync ADR-0025, trueseal-sync ADR-0028; code: trueseal-relay internal/config/config.go".
 *  A row's anchor is its HTML id, the id lowercased after 'fact-' or 'set-', so plain Markdown can link a
 *  fact as /agents/limits#fact-protocolsizelimit.
 *  Throws on any other group, since cases render through ApiEntries and MDX doesn't type-check the prop. */
export function factTable(group: TableGroup, data: SharedFacts = sharedFacts): {
  columns: [string, string, string, string];
  rows: { anchor: string; name: FactPart; value: FactPart[]; meaning: FactPart[]; source: string }[];
} {
  if (group === 'valueSets') {
    return {
      columns: ['Set', 'Values', 'Meaning', 'Source'],
      rows: data.valueSets.map(set => ({
        anchor: `${rowAnchorPrefix.set}${set.id.toLowerCase()}`,
        name: { text: set.id, code: true },
        value: codeParts(set.values, set.todo),
        meaning: meaningParts(set.meaning),
        source: sourceText(set.source),
      })),
    };
  }
  if (!(valueGroups as readonly string[]).includes(group)) {
    throw new Error(`FactTable renders the value groups and valueSets, not "${group}"; render cases with ApiEntries`);
  }
  return {
    columns: ['Fact', 'Value', 'Meaning', 'Source'],
    rows: data[group].map(fact => ({
      anchor: `${rowAnchorPrefix.fact}${fact.id.toLowerCase()}`,
      name: { text: fact.name, code: false },
      value: [fact.value ? written(fact.value) : notFixed],
      meaning: meaningParts(fact.meaning),
      source: sourceText(fact.source),
    })),
  };
}
