// The words and figures no TrueSeal page may use (trueseal-roadmap#16, brandbook section 5, sync ADR-0024/0025),
// and what to write instead. tests/banned-terms.test.ts holds src/ to it.

/** A word or figure no page may use. */
export interface BannedTerm {
  /** The term as the threat model decision names it, e.g. "zero-knowledge". */
  term: string;
  /** Matches the term in any case; multi-word terms match across line breaks. */
  pattern: RegExp;
  /** What to write instead, printed when the check fails. */
  instead: string;
}

const standardWording =
  "end-to-end encrypted; the relay can't read or forge messages; here is exactly what it does see (trueseal-roadmap#16)";
const sizeLimit = 'The Protocol Size Limit from src/config/sharedFacts.ts';

export const bannedTerms: BannedTerm[] = [
  { term: 'zero-trust', pattern: /\bzero-trust\b/i, instead: standardWording },
  { term: 'zero trust', pattern: /\bzero\s+trust\b/i, instead: standardWording },
  { term: 'zero-knowledge', pattern: /\bzero[-\s]+knowledge\b/i, instead: standardWording },
  { term: 'no communication graph', pattern: /\bno\s+communication\s+graph\b/i, instead: standardWording },
  { term: 'structurally unknowable', pattern: /\bstructurally\s+unknowable\b/i, instead: standardWording },
  {
    term: 'cryptographic guarantee',
    pattern: /\bcryptographic\s+guarantee/i,
    instead: "Say what the mechanism does and what it can't do (sync ADR-0029 for Destroy Group)",
  },
  { term: "can't see your IP", pattern: /\bcan(?:['’]t|not)\s+see\s+your\s+IP\b/i, instead: 'The brandbook section 10 IP sentence' },
  { term: 'Production-ready', pattern: /\bproduction[-\s]+ready\b/i, instead: 'Developer Preview' },
  { term: 'trueseal-clip', pattern: /\btrueseal-clip\b/i, instead: 'Hush' },
  { term: '1 MiB', pattern: /(?<![\d.,])1\s*MiB\b/i, instead: sizeLimit },
  { term: '1048576', pattern: /(?<![\d,])1,?048,?576(?![\d,])/, instead: sizeLimit },
  {
    term: 'trueseal-relay:latest',
    pattern: /trueseal-relay:latest\b/i,
    instead: 'A pinned tag: ghcr.io/julianbonomini/trueseal-relay:<version>',
  },
];

/** Each occurrence of a banned term in `text`, in order of position, with the 1-based line it starts on. */
export function findBannedTerms(text: string): { term: string; line: number }[] {
  return bannedTerms
    .flatMap(({ term, pattern }) =>
      [...text.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))].map(m => ({ term, index: m.index })),
    )
    .sort((a, b) => a.index - b.index)
    .map(({ term, index }) => ({ term, line: text.slice(0, index).split('\n').length }));
}
