// The CI workflow in .github/workflows/check.yml: it runs bun run check on every pull request and
// every push to main, with a pinned Bun and no secrets. actionlint isn't installed, so this parses the YAML.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface WorkflowStep {
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
}

interface Workflow {
  on: Record<string, { branches?: string[] } | null>;
  permissions: unknown;
  jobs: Record<string, { steps: WorkflowStep[] }>;
}

const workflowPath = join(import.meta.dir, '..', '.github', 'workflows', 'check.yml');
const text = readFileSync(workflowPath, 'utf8');
const workflow = Bun.YAML.parse(text) as Workflow;
const steps = Object.values(workflow.jobs ?? {}).flatMap(job => job.steps);
const isSetupBun = (step: WorkflowStep) => step.uses?.startsWith('oven-sh/setup-bun@') ?? false;

describe('CI workflow', () => {
  test('parses as YAML with jobs', () => {
    expect(typeof workflow).toBe('object');
    expect(workflow.jobs).toBeDefined();
  });

  test('runs on every pull request and on pushes to main only', () => {
    expect(Object.keys(workflow.on).sort()).toEqual(['pull_request', 'push']);
    expect(workflow.on.pull_request?.branches).toBeUndefined();
    expect(workflow.on.push?.branches).toEqual(['main']);
  });

  test('installs Bun at an exact version', () => {
    const setupBun = steps.filter(isSetupBun);
    expect(setupBun).toHaveLength(1);
    expect(String(setupBun[0]!.with?.['bun-version'])).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('installs from the lockfile, then runs bun run check, after setting up Bun', () => {
    const setupAt = steps.findIndex(isSetupBun);
    const installAt = steps.findIndex(step => step.run === 'bun install --frozen-lockfile');
    const checkAt = steps.findIndex(step => step.run === 'bun run check');
    expect(installAt).toBeGreaterThan(setupAt);
    expect(checkAt).toBeGreaterThan(installAt);
  });

  test('uses no secrets and can only read the repo', () => {
    expect(text).not.toMatch(/secrets\./);
    expect(workflow.permissions).toEqual({ contents: 'read' });
  });

  // No *.test.ts needs a browser today. A test that does must add the Playwright install step and
  // change this test.
  test('installs no Playwright browser', () => {
    expect(text).not.toMatch(/playwright/i);
  });
});
