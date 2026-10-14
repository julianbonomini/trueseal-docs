// The CI job that runs scripts/check-threat-model.ts against GitHub at the pinned commits.
import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(import.meta.dir, '..', '.github', 'workflows', 'threat-model.yml'), 'utf8');
const workflow = Bun.YAML.parse(source) as {
  on: Record<string, { branches?: string[] } | null>;
  permissions: Record<string, string>;
  jobs: Record<string, { steps: { uses?: string; run?: string; with?: Record<string, string>; env?: Record<string, string> }[] }>;
};
const steps = Object.values(workflow.jobs).flatMap(job => job.steps);

test('runs on pull requests, pushes to main and by hand, with read-only contents', () => {
  expect(Object.keys(workflow.on).sort()).toEqual(['pull_request', 'push', 'workflow_dispatch']);
  expect(workflow.on.push!.branches).toEqual(['main']);
  expect(workflow.permissions).toEqual({ contents: 'read' });
});

test('runs the check with the sibling repos token and no other secret', () => {
  expect(steps.find(step => step.uses?.startsWith('oven-sh/setup-bun'))?.with?.['bun-version']).toBe('1.4.2');
  const check = steps.find(step => step.run?.includes('bun scripts/check-threat-model.ts'));
  expect(check?.env?.GITHUB_TOKEN).toBe('${{ secrets.SIBLING_REPOS_TOKEN }}');
  expect(source.match(/secrets\.\w+/g)).toEqual(['secrets.SIBLING_REPOS_TOKEN']);
});

test('a missing token is a loud NOT RUN, never silent green', () => {
  const check = steps.find(step => step.run?.includes('bun scripts/check-threat-model.ts'));
  // Exit 3 (no token) becomes a workflow warning annotation plus a step-summary banner, and the job
  // stays green so docs PRs aren't blocked — but the wording must say NOT RUN and that G10 fails on it.
  expect(check?.run).toContain('code=0');
  expect(check?.run).toContain('[ "$code" -eq 3 ]');
  expect(check?.run).toContain('::warning title=Threat Model named-tests leg NOT RUN::');
  expect(check?.run).toContain('$GITHUB_STEP_SUMMARY');
  expect(check?.run).toContain('NOT RUN');
  expect(check?.run).toContain('G10 counts NOT RUN as a failure');
  // Any other exit code (1 = a named test is missing, 2 = fetch failed) fails the job.
  expect(check?.run).toContain('exit "$code"');
});
