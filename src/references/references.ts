// The reference check (docs ADR-0003): which links and code spans in Markdown/MDX name a page, an API
// name, a case or a Shared Fact, and whether a docs build holds each one. This module owns how a reference is
// recognised, how each kind resolves, and where the known sets come from.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { anchorPrefix, apiNames, entryAnchorPrefix } from '../api/api.ts';
import { builtSite } from '../built-site/built-site.ts';
import { siteUrl } from '../config/site.ts';
import { rowAnchorPrefix } from '../facts/facts.ts';
import { sharedFacts } from '../facts/shared-facts.ts';

/** What a docs ref offers to be referenced, read from its build. */
export interface KnownReferences {
  /** Site path of every built page ('/agents/api', '/' for the Landing; no trailing slash) → the ids on it. Redirects are left out. */
  pages: Map<string, Set<string>>;
  /** Site path of every built file that is not an index.html: '/llms.txt', '/agents/api.md', '/404.html'. */
  files: Set<string>;
  /** Code spans the check accepts: apiNames(), case argument names, notApiNames. */
  names: Set<string>;
}

export interface MissingReference {
  /** The path as given in the input. */
  file: string;
  /** 1-based line in the original file. */
  line: number;
  /** The link target or code span as written: '/agents/limitz', 'TrueSeal.opne', 'groupFul{max}'. */
  reference: string;
  kind: 'page' | 'api' | 'error' | 'event' | 'fact';
}

// Spans that look like API names but are not TrueSeal's: the Noise specification's names and the word camelCase.
const notApiNames = ['camelCase', 'SymmetricState.split', 'fromInitiator', 'fromResponder'];

const labels: Record<MissingReference['kind'], string> = {
  page: 'page', api: 'API name', error: 'error case', event: 'event case', fact: 'Shared Fact',
};

// The kind a missing anchor reports, by the prefix the API reference or FactTable writes. A missing case- row is a page miss,
// since the id alone doesn't say whether it was an error or an event.
const fragmentKinds: [string, MissingReference['kind']][] = [
  [entryAnchorPrefix, 'api'], [anchorPrefix.errors, 'error'], [anchorPrefix.events, 'event'], [anchorPrefix.deliveryIssues, 'event'],
  [rowAnchorPrefix.fact, 'fact'], [rowAnchorPrefix.set, 'fact'],
];

function walk(dir: string, keep: (name: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) return entry.name.startsWith('.') || entry.name === 'node_modules' ? [] : walk(join(dir, entry.name), keep);
    return keep(entry.name) ? [join(dir, entry.name)] : [];
  });
}

/** The page, file, id and name sets of the site built in `dist`, plus the API names and Shared Facts.
 *  Run `bun run build` first; throws when `dist` has no index.html. */
export function knownReferences(dist: string): KnownReferences {
  const site = builtSite(dist);
  const pages = new Map(
    [...site.pages].flatMap(([path, page]) =>
      page.kind === 'page' ? [[path, new Set([...page.html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id))] as const] : [],
    ),
  );
  const caseArgs = [...sharedFacts.errors, ...sharedFacts.events, ...sharedFacts.deliveryIssues].flatMap(c => c.args ?? []);
  return { pages, files: site.files, names: new Set([...apiNames(), ...caseArgs, ...notApiNames]) };
}

const blank = (text: string) => text.replace(/[^\n]/g, ' ');

// The text with everything that isn't prose blanked out, character for character, so line and column stay true.
function proseOnly(text: string): string {
  const frontmatter = text.match(/^---\n[\s\S]*?\n---(?=\n|$)/)?.[0] ?? '';
  const uncommented = (blank(frontmatter) + text.slice(frontmatter.length))
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank);
  let fence = false;
  let tag = false;
  return uncommented.split('\n').map(line => {
    const trimmed = line.trim();
    const fenceLine = /^\s*(```|~~~)/.test(line);
    if (fence || fenceLine) {
      if (fenceLine) fence = !fence;
      return blank(line);
    }
    // Component props hold code (CodeBlock template literals), not prose; the children between tags are read.
    if (tag || /^<[A-Z]/.test(trimmed)) {
      tag = !(trimmed.endsWith('/>') || trimmed.endsWith('>'));
      return blank(line);
    }
    if (/^(import|export) /.test(line)) return blank(line);
    return line;
  }).join('\n');
}

// Matched in one pass so a URL inside a Markdown target or an href is read once: Markdown target, href, bare site URL.
const linkPattern = new RegExp(`\\]\\(([^\\s)]+)|href=(?:"([^"]*)"|'([^']*)')|(${siteUrl.replace(/\./g, '\\.')}[^\\s)"'<>\\]]*)`, 'g');

// A fragment with a stray % can't be decoded; it is then compared as written.
function decoded(fragment: string): string {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function missingLink(target: string, known: KnownReferences): MissingReference['kind'] | undefined {
  const [path, fragment = ''] = target.slice(target.startsWith(siteUrl) ? siteUrl.length : 0).replace(/\?[^#]*/, '').split('#');
  const site = path.replace(/(.)\/$/, '$1') || '/';
  if (site.split('/').pop()!.includes('.')) return known.files.has(site) ? undefined : 'page';
  const ids = known.pages.get(site);
  if (!ids) return 'page';
  const id = decoded(fragment);
  if (!id || ids.has(id)) return undefined;
  return fragmentKinds.find(([prefix]) => id.startsWith(prefix))?.[1] ?? 'page';
}

function missingSpan(span: string, known: KnownReferences): MissingReference['kind'] | undefined {
  // A call on an instance (`session.join`, `trueSeal.send`) resolves by the name after the first dot.
  const resolves = (head: string) =>
    known.names.has(head) || (/^[a-z][^.]*\./.test(head) && known.names.has(head.slice(head.indexOf('.') + 1)));
  const braced = span.match(/^([a-z][A-Za-z0-9]*)\{[^{}]*\}$/);
  if (braced) return known.names.has(braced[1]) ? undefined : 'error';
  const called = span.match(/^((?:[A-Za-z][A-Za-z0-9]*\.)*[A-Za-z][A-Za-z0-9]*)\([^()]*\)$/);
  if (called) return resolves(called[1]) ? undefined : 'api';
  if (/^[A-Z][a-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)+$/.test(span)) return resolves(span) ? undefined : 'api';
  if (/^[a-z][a-z0-9]*[A-Z][A-Za-z0-9]*$/.test(span)) return known.names.has(span) ? undefined : 'api';
  // Bare PascalCase words are left alone: they collide with protocol message names such as `Sync` and `Pair`.
  return undefined;
}

/** Every link to a site path that isn't built, every fragment that isn't an id on its page, and every code span shaped
 *  like a TrueSeal API name, case or field that `known` doesn't hold, in input file order, then by line and column.
 *  Frontmatter, comments, import/export lines, fenced code and MDX component tags are not read. Pure: reads no files. */
export function findMissingReferences(files: { path: string; text: string }[], known: KnownReferences): MissingReference[] {
  return files.flatMap(({ path, text }) =>
    proseOnly(text).split('\n').flatMap((line, index) => {
      const found: (MissingReference & { column: number })[] = [];
      const add = (column: number, reference: string, kind: MissingReference['kind'] | undefined) => {
        if (kind) found.push({ file: path, line: index + 1, reference, kind, column });
      };
      for (const match of line.matchAll(linkPattern)) {
        const markdown = match[1] ?? match[2] ?? match[3];
        const target = markdown ?? match[4].replace(/[.,;:!?]+$/, '');
        if (target.startsWith(siteUrl) || /^\/(?!\/)/.test(target)) add(match.index, target, missingLink(target, known));
      }
      for (const match of line.matchAll(/`([^`\n]+)`/g)) {
        const span = match[1].trim();
        add(match.index, span, missingSpan(span, known));
      }
      return found.sort((a, b) => a.column - b.column).map(({ column, ...miss }) => miss);
    }),
  );
}

/** One miss as a line: `<file>:<line>: unknown <label> <reference>`, the label one of 'page', 'API name', 'error case',
 *  'event case' or 'Shared Fact'. e.g. "broken/limit.md:3: unknown Shared Fact /agents/limits#fact-maxgroupsze". */
export function formatMissing(miss: MissingReference): string {
  return `${miss.file}:${miss.line}: unknown ${labels[miss.kind]} ${miss.reference}`;
}

/** Every .md and .mdx file under `dir` (or `dir` itself when it is such a file), sorted, skipping node_modules and dot
 *  folders. Each path is join(dir, relative path), so it reads as the caller wrote it. */
export function markdownFiles(dir: string): { path: string; text: string }[] {
  const isMarkdown = (name: string) => /\.mdx?$/.test(name);
  const paths = statSync(dir).isFile() ? (isMarkdown(dir) ? [dir] : []) : walk(dir, isMarkdown);
  return paths.sort().map(path => ({ path, text: readFileSync(path, 'utf8') }));
}
