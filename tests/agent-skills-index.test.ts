// The /.well-known/agent-skills index (docs ADR-0005): the built site serves it, it lists the three
// skills with sha256 digests of every file, and it names its pinned trueseal-skills ref.
// Reads dist/, so run `bun run build` first.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dir, '..', 'dist');

interface SkillsIndex {
  schemaVersion: number;
  plugin: { name: string; version: string };
  source: { repo: string; ref: string; tag: string | null };
  install: { marketplace: string; npx: string };
  skills: { name: string; path: string; description: string; files: { path: string; sha256: string }[] }[];
}

describe('/.well-known/agent-skills/index.json', () => {
  const body = readFileSync(join(dist, '.well-known', 'agent-skills', 'index.json'), 'utf8');
  const index = JSON.parse(body) as SkillsIndex;

  test('is valid JSON served at the well-known path', () => {
    expect(index.schemaVersion).toBe(1);
  });

  test('lists the three workflow skills, each with its SKILL.md and per-platform references', () => {
    expect(index.skills.map(skill => skill.name)).toEqual(['trueseal:integrate', 'trueseal:pairing', 'trueseal:relay']);
    for (const skill of index.skills) {
      expect(skill.description.trim().length).toBeGreaterThan(0);
      expect(skill.files.map(file => file.path)).toEqual([
        `${skill.path}/SKILL.md`,
        `${skill.path}/references/swift.md`,
        `${skill.path}/references/kotlin.md`,
        `${skill.path}/references/ts.md`,
      ]);
    }
  });

  test('every file carries a sha256 digest', () => {
    const bad = index.skills.flatMap(skill => skill.files.filter(file => !/^[0-9a-f]{64}$/.test(file.sha256)).map(file => file.path));
    expect(bad).toEqual([]);
  });

  test('names the pinned trueseal-skills ref and both install commands', () => {
    expect(index.source.repo).toBe('julianbonomini/trueseal-skills');
    expect(index.source.ref.length).toBeGreaterThanOrEqual(7);
    expect(index.install.marketplace).toContain('/plugin marketplace add julianbonomini/trueseal-skills');
    expect(index.install.npx).toContain('npx skills add julianbonomini/trueseal-skills');
  });
});
