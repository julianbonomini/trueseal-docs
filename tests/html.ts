// Reading built HTML the way a reader sees it, and the brandbook voice rules visible copy must pass.
// Shared by the dist/ checks of the Landing and the docs surfaces.

export function decode(s: string): string {
  return s
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/** The visible text: no scripts, styles or tags, entities decoded. */
export function text(html: string): string {
  return decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' '));
}

/** The visible text outside code blocks. */
export function prose(html: string): string {
  return text(html.replace(/<pre[\s\S]*?<\/pre>/g, ' '));
}

/** The page's `<title>`, entities decoded. */
export function titleOf(html: string): string {
  return decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
}

/** The page's meta description, entities decoded. */
export function descriptionOf(html: string): string {
  return decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
}

/** Terms banned from public copy (brandbook §5 and the preview release spec §4), lower case. */
export const bannedTerms = [
  'zero-trust',
  'zero trust',
  'zero-knowledge',
  'no communication graph',
  'structurally unknowable',
  'cryptographic guarantee',
  "can't see your ip",
  'anonymous',
  'military-grade',
  'fully private',
  'completely private',
];

/** Each banned term that appears in the copy, matched without regard to case or curly apostrophes. */
export function bannedTermsIn(copy: string): string[] {
  const lower = copy.toLowerCase().replace(/’/g, "'");
  return bannedTerms.filter(term => lower.includes(term));
}

/** Each problem the brandbook bans in visible copy: a banned term, or an em/en dash or spaced hyphen. Empty when clean. */
export function voiceProblems(copy: string): string[] {
  const terms = bannedTermsIn(copy).map(term => `banned term "${term}"`);
  const dashes = [...copy.matchAll(/.{0,30}(—|–| - ).{0,30}/g)].map(m => `dash in "${m[0].trim()}"`);
  return [...terms, ...dashes];
}
