// Vendors the core's generated Shared Facts and API surface into src/facts/upstream/ at an exact
// trueseal-sync commit, with sha256 verification (docs ADR-0003; G8 pinned inputs).
//
//   bun scripts/sync-upstream-facts.ts <commit>   refresh the vendored files + pin
//   bun scripts/sync-upstream-facts.ts --check    verify the committed files match the pin's digests
//
// --check runs in CI (tests/upstream-facts.test.ts): a vendored file that doesn't match its pinned
// digest fails the build, so the source every Shared Fact derives from is byte-pinned.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = join(import.meta.dir, '..');
const pinPath = join(repo, 'src/facts/upstream/pin.json');
const pin = JSON.parse(readFileSync(pinPath, 'utf8'));

const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');

async function fetchAt(commit: string, path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${pin.repo}/${commit}/${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch ${url}: ${response.status}`);
  return response.text();
}

if (process.argv[2] === '--check') {
  const failures: string[] = [];
  for (const [path, entry] of Object.entries(pin.files) as [string, { sha256: string; vendoredAs: string }][]) {
    const actual = sha256(readFileSync(join(repo, entry.vendoredAs)));
    if (actual !== entry.sha256) failures.push(`${entry.vendoredAs}: digest ${actual} != pinned ${entry.sha256} (${path} @ ${pin.commit})`);
  }
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log(`upstream facts match the pin (${pin.repo} @ ${pin.commit.slice(0, 7)})`);
} else {
  const commit = process.argv[2];
  if (!commit || !/^[0-9a-f]{40}$/.test(commit)) {
    console.error('usage: bun scripts/sync-upstream-facts.ts <full-40-char-commit> | --check');
    process.exit(1);
  }
  for (const [path, entry] of Object.entries(pin.files) as [string, { sha256: string; vendoredAs: string }][]) {
    const content = await fetchAt(commit, path);
    entry.sha256 = sha256(content);
    writeFileSync(join(repo, entry.vendoredAs), content);
    console.log(`vendored ${path} -> ${entry.vendoredAs} (${entry.sha256.slice(0, 12)}…)`);
  }
  pin.commit = commit;
  writeFileSync(pinPath, JSON.stringify(pin, null, 2) + '\n');
  console.log(`pin updated to ${commit}`);
}
