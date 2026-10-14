// Generates the /.well-known/agent-skills/index.json the docs site serves (docs ADR-0005
// "Distribution"), from a pinned trueseal-skills ref, with sha256 digests of every skill file.
//
//   bun scripts/sync-skills-index.ts <commit>   regenerate src/config/agent-skills-index.json
//   bun scripts/sync-skills-index.ts --check    verify the committed file matches a fresh fetch
//
// The pin is a commit until the first TrueSeal Release tags trueseal-skills v0.6.0; at release the
// Release Conductor re-runs this against the tag and the `tag` field flips from null (G8: the pin is
// always exact, never a branch or latest). The endpoint serves the committed file, so the site build
// needs no network.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = join(import.meta.dir, '..');
const outPath = join(repo, 'src/config/agent-skills-index.json');
const SKILLS_REPO = 'julianbonomini/trueseal-skills';
const SKILL_NAMES = ['integrate', 'pairing', 'relay'];

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

async function fetchAt(ref: string, path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${SKILLS_REPO}/${ref}/${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch ${url}: ${response.status}`);
  return response.text();
}

/** The description from a SKILL.md's frontmatter. */
function descriptionOf(skillMd: string, path: string): string {
  const match = skillMd.match(/^---\n([\s\S]*?)\n---/);
  const description = match?.[1].match(/^description: (.*)$/m)?.[1].trim();
  if (!description) throw new Error(`${path}: no frontmatter description`);
  return description;
}

async function buildIndex(ref: string): Promise<object> {
  const plugin = JSON.parse(await fetchAt(ref, '.claude-plugin/plugin.json'));
  const skills = [];
  for (const name of SKILL_NAMES) {
    const base = `skills/${name}`;
    const skillMd = await fetchAt(ref, `${base}/SKILL.md`);
    const files = [{ path: `${base}/SKILL.md`, sha256: sha256(skillMd) }];
    for (const platform of ['swift', 'kotlin', 'ts']) {
      const reference = await fetchAt(ref, `${base}/references/${platform}.md`);
      files.push({ path: `${base}/references/${platform}.md`, sha256: sha256(reference) });
    }
    skills.push({
      name: `trueseal:${name}`,
      path: base,
      description: descriptionOf(skillMd, `${base}/SKILL.md`),
      files,
    });
  }
  return {
    description:
      'The TrueSeal Agent Skills index (docs ADR-0005). Lists the three workflow skills with sha256 digests of every file, built from a pinned trueseal-skills ref by scripts/sync-skills-index.ts — never edited by hand.',
    schemaVersion: 1,
    plugin: { name: plugin.name, version: plugin.version },
    source: {
      repo: SKILLS_REPO,
      ref,
      tag: null as string | null,
      tagNote:
        'Pinned to a commit until the first TrueSeal Release tags trueseal-skills v0.6.0; the Release Conductor re-runs the sync script against the tag and this field flips.',
    },
    install: {
      marketplace: '/plugin marketplace add julianbonomini/trueseal-skills && /plugin install trueseal@trueseal-skills',
      npx: 'npx skills add julianbonomini/trueseal-skills',
    },
    skills,
  };
}

if (process.argv[2] === '--check') {
  const committed = JSON.parse(readFileSync(outPath, 'utf8'));
  const fresh = await buildIndex(committed.source.ref);
  if (JSON.stringify(fresh) !== JSON.stringify(committed)) {
    console.error('agent-skills-index.json does not match a fresh fetch at its pinned ref; regenerate with bun scripts/sync-skills-index.ts <commit>');
    process.exit(1);
  }
  console.log(`agent-skills index matches the pin (${SKILLS_REPO} @ ${committed.source.ref.slice(0, 7)})`);
} else {
  const ref = process.argv[2];
  if (!ref || !/^[0-9a-f]{40}$/.test(ref)) {
    console.error('usage: bun scripts/sync-skills-index.ts <full-40-char-commit-or-tag> | --check');
    process.exit(1);
  }
  const index = await buildIndex(ref);
  writeFileSync(outPath, JSON.stringify(index, null, 2) + '\n');
  console.log(`wrote src/config/agent-skills-index.json (${SKILLS_REPO} @ ${ref.slice(0, 7)}, ${SKILL_NAMES.length} skills)`);
}
