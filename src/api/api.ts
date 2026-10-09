// The SDK API reference: every public name of the TrueSeal API (trueseal-sync ADR-0028), ready to render.
// The names live in api-reference.ts; the error, event and delivery-issue cases come from Shared Facts.
// This module owns how a name is spelled on each platform, the anchors, and the name list the checks read.
import { caseSignature, factName, factText, meaningParts, type CaseFact, type CaseGroup, type FactPart, type SharedFacts } from '../facts/facts.ts';
import { sharedFacts } from '../facts/shared-facts.ts';
import { apiReference } from './api-reference.ts';

/** A platform an SDK ships on, in display order. */
export type Platform = 'swift' | 'kotlin' | 'typescript';

/** The sections of the API reference: the eight on /agents/api, then the three case sections on /agents/errors-and-events. */
export type ApiSection =
  | 'open' | 'state' | 'receive' | 'send' | 'pairing' | 'membership' | 'subscribe' | 'info'
  | 'errors' | 'events' | 'deliveryIssues';

/** One public type, method, property or constant, as written in api-reference.ts. */
export interface ApiEntryData {
  section: Exclude<ApiSection, 'events' | 'deliveryIssues'>;
  /** The name an agent writes, e.g. 'TrueSeal.open', 'send', 'GroupStatus'. Unique. */
  name: string;
  kind: 'module' | 'type' | 'method' | 'property' | 'constant';
  /** The neutral signature (ADR-0028 notation). Absent only on the import entry. */
  shared?: string;
  /** Each platform's spelling, always all three. */
  platforms: Record<Platform, string>;
  /** Markdown backticks for code, as in Shared Facts. */
  meaning: string;
  action?: string;
  /** Error case ids from Shared Facts. */
  throws?: string[];
  /** Value fact ids from Shared Facts, shown as "Name: value". */
  facts?: string[];
  /** A Shared Facts value set the type's values come from; `tsValues: 'state'` spells TS values as `{ state: "v" }`. */
  valueSet?: string;
  tsValues?: 'string' | 'state';
  /** Platform-only identifiers the reference check must accept, e.g. 'MAX_PAYLOAD_BYTES'. */
  aliases?: string[];
  /** `sketch` marks a spelling taken from the ADR-0028 sketch rather than an ADR. */
  source: { adr: string[]; sketch?: boolean };
  /** How today's SDKs differ from the ADR. Never rendered. */
  gap?: string;
  /** What no ADR or the sketch settles, starting `TODO:`. Never rendered. */
  todo?: string;
}

export interface ApiReference {
  entries: ApiEntryData[];
}

/** One entry ready to render. */
export interface ApiEntry {
  /** The HTML id: 'api-' + name lowercased with '.' → '-' ('api-trueseal-open'); cases 'error-', 'event-', 'issue-' + id lowercased. */
  anchor: string;
  /** The heading when there is no signature (the import entry: 'Import'). */
  title: string;
  /** The shared signature as code; for a case its Shared Facts signature (`groupFull{max}`, `sendFailed(messageId, reason)`). Empty for the import entry. */
  signature: string;
  meaning: FactPart[];
  action: FactPart[];
  /** "Name: value" for each fact id, the value from factText. */
  values: { name: string; value: FactPart }[];
  /** Each thrown error, with its link on /agents/errors-and-events. */
  throws: { name: string; href: string }[];
  /** Only the platforms whose spelling differs from `signature`, in Platform order. */
  spellings: { platform: Platform; label: string; code: string }[];
}

const platformLabels: Record<Platform, string> = { swift: 'Swift', kotlin: 'Kotlin', typescript: 'TypeScript' };

const anchorPrefix: Record<CaseGroup, string> = { errors: 'error-', events: 'event-', deliveryIssues: 'issue-' };
// The Kotlin type each case kind is nested in. Swift events and issues use the bare case (`.statusChanged`).
const kotlinType: Record<CaseGroup, string> = { errors: 'TrueSealException', events: 'TrueSealEvent', deliveryIssues: 'DeliveryIssue' };

const pascal = (name: string) => name[0].toUpperCase() + name.slice(1);
const screamingSnake = (name: string) => name.replace(/([A-Z])/g, '_$1').toUpperCase();
// Swift spells argument labels in a case name: `groupFull(max:)`.
const swiftLabels = (args: string[]) => (args.length ? `(${args.map(arg => `${arg}:`).join('')})` : '');
// Kotlin and Swift events pass arguments positionally: `(status, reason)`.
const argList = (args: string[]) => (args.length ? `(${args.join(', ')})` : '');
// TypeScript cases are objects, the arguments as fields after the tag: `, status, reason`.
const tsFields = (args: string[]) => args.map(arg => `, ${arg}`).join('');

function caseSpellings(kind: CaseGroup, c: CaseFact): Record<Platform, string> {
  const args = c.args ?? [];
  if (kind === 'errors') {
    return {
      swift: `TrueSealError.${c.id}${swiftLabels(args)}`,
      kotlin: `TrueSealException.${pascal(c.id)}${argList(args)}`,
      typescript: `TrueSealError { code: "${screamingSnake(c.id)}"${tsFields(args)} }`,
    };
  }
  return {
    swift: `.${c.id}${argList(args)}`,
    kotlin: `${kotlinType[kind]}.${pascal(c.id)}${argList(args)}`,
    typescript: `{ type: "${c.id}"${tsFields(args)} }`,
  };
}

// A value-set value is written `name` or `name{a, b}` in Shared Facts.
function parseValue(value: string): { name: string; args: string[] } {
  const [, name, args] = value.match(/^(\w+)(?:\{(.*)\})?$/)!;
  return { name, args: args ? args.split(',').map(arg => arg.trim()) : [] };
}

function valueSpellings(type: string, tsValues: 'string' | 'state', value: string): Record<Platform, string> {
  const { name, args } = parseValue(value);
  return {
    swift: `.${name}${swiftLabels(args)}`,
    kotlin: `${type}.${pascal(name)}${argList(args)}`,
    typescript: tsValues === 'state' ? `{ state: "${name}"${tsFields(args)} }` : `"${name}"`,
  };
}

function valueSetOf(id: string, facts: SharedFacts): string[] {
  const set = facts.valueSets.find(set => set.id === id);
  if (!set) throw new Error(`Unknown value set "${id}"`);
  return set.values;
}

function errorHref(id: string, facts: SharedFacts): string {
  if (!facts.errors.some(error => error.id === id)) throw new Error(`Unknown error case "${id}"`);
  return `/agents/errors-and-events#${anchorPrefix.errors}${id.toLowerCase()}`;
}

function onlyDiffering(signature: string, platforms: Record<Platform, string>): ApiEntry['spellings'] {
  return (Object.keys(platformLabels) as Platform[])
    .filter(platform => platforms[platform] !== signature)
    .map(platform => ({ platform, label: platformLabels[platform], code: platforms[platform] }));
}

function entryOf(data: ApiEntryData, facts: SharedFacts): ApiEntry {
  let signature = data.shared ?? '';
  let platforms = data.platforms;
  if (data.valueSet) {
    const values = valueSetOf(data.valueSet, facts);
    const spelled = values.map(value => valueSpellings(data.name, data.tsValues ?? 'string', value));
    signature = `${signature}: ${values.join(' | ')}`;
    platforms = {
      swift: `${platforms.swift}: ${spelled.map(s => s.swift).join(' | ')}`,
      kotlin: `${platforms.kotlin}: ${spelled.map(s => s.kotlin).join(' | ')}`,
      typescript: `${platforms.typescript}: ${spelled.map(s => s.typescript).join(' | ')}`,
    };
  }
  return {
    anchor: `api-${data.name.toLowerCase().replace(/\./g, '-')}`,
    title: data.kind === 'module' ? pascal(data.name) : data.name,
    signature,
    meaning: meaningParts(data.meaning),
    action: meaningParts(data.action ?? ''),
    values: (data.facts ?? []).map(id => ({ name: factName(id, facts), value: factText(id, facts) })),
    throws: (data.throws ?? []).map(id => ({ name: id, href: errorHref(id, facts) })),
    spellings: onlyDiffering(signature, platforms),
  };
}

function caseEntryOf(kind: CaseGroup, c: CaseFact): ApiEntry {
  const signature = caseSignature(kind, c);
  return {
    anchor: `${anchorPrefix[kind]}${c.id.toLowerCase()}`,
    title: c.id,
    signature,
    meaning: meaningParts(c.meaning),
    action: meaningParts(c.action ?? ''),
    values: [],
    throws: [],
    spellings: onlyDiffering(signature, caseSpellings(kind, c)),
  };
}

/** The entries of a section, in data order. 'errors' is the TrueSealError type entry, then every
 *  Shared Facts error in its order; 'events' and 'deliveryIssues' are every Shared Facts case of
 *  that group, spelled by the case rule. A case's meaning and action come from Shared Facts.
 *  Throws `Unknown error case "<id>"`, `Unknown value set "<id>"` or the factText error when the data
 *  names something missing, so a bad name fails the build. */
export function apiSection(section: ApiSection, api: ApiReference = apiReference, facts: SharedFacts = sharedFacts): ApiEntry[] {
  const entries = api.entries.filter(entry => entry.section === section).map(entry => entryOf(entry, facts));
  if (section === 'errors' || section === 'events' || section === 'deliveryIssues') {
    return [...entries, ...facts[section].map(c => caseEntryOf(section, c))];
  }
  return entries;
}

/** Every API name, sorted and unique: each entry name and each dotted segment of it, every alias,
 *  every error/event/delivery-issue id, every value of the value sets (braces dropped:
 *  'relayVersionUnsupported'), and every case's Kotlin and TS spelling head ('TrueSealException.GroupFull',
 *  'TrueSealEvent.StatusChanged', 'DeliveryIssue.Unreadable', 'GROUP_FULL'). The reference-existence check reads this. */
export function apiNames(api: ApiReference = apiReference, facts: SharedFacts = sharedFacts): string[] {
  const entryNames = api.entries.flatMap(entry => [entry.name, ...entry.name.split('.'), ...(entry.aliases ?? [])]);
  const cases = (['errors', 'events', 'deliveryIssues'] as const).flatMap(kind =>
    facts[kind].flatMap(c => {
      const heads = [`${kotlinType[kind]}.${pascal(c.id)}`];
      if (kind === 'errors') heads.push(screamingSnake(c.id));
      return [c.id, ...heads];
    }),
  );
  const values = facts.valueSets.flatMap(set => set.values.map(value => parseValue(value).name));
  return [...new Set([...entryNames, ...cases, ...values])].sort();
}
