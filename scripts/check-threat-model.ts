// Checks that every test the Threat Model names exists in its repo at the pinned commit. Fetches each
// named file once from the GitHub API and hands the text to missingTests.
//
//   GITHUB_TOKEN=$(gh auth token) bun scripts/check-threat-model.ts
//
// Exits 0 when every named test exists, 1 when any is missing, 2 when it can't fetch a file, and 3
// when no token is set. Exit 3 is NOT RUN, not a pass: the Threat Model CI workflow turns it into a
// loud warning annotation and a step-summary banner, and G10 counts a NOT RUN leg as a failure at
// release. Never swallow exit 3 as silent green.
import { missingTests } from './declared-tests.ts';
import { testLocation, testRefs, type TestRef } from '../src/config/threatModel.ts';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.log('THREAT MODEL NAMED-TESTS LEG: NOT RUN — GITHUB_TOKEN is not set, so the cross-repo');
  console.log('test-existence check could not run. Every claim on the Threat Model page is UNVERIFIED');
  console.log('until this leg runs green. This is a visible skip, not a pass: G10 counts NOT RUN as a');
  console.log('failure at release. Set a token that can read the trueseal repos, trueseal-e2e included.');
  process.exit(3);
}

const fileKey = (ref: TestRef) => `${ref.repo}/${ref.path}`;

async function fetchFile(ref: TestRef): Promise<string | undefined> {
  const { owner, repo, sha, path } = testLocation(ref);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${sha}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.raw+json', Authorization: `Bearer ${token}` },
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`${url} answered ${response.status} ${response.statusText}.`);
  return response.text();
}

const refs = testRefs();
const files = new Map<string, string | undefined>();
try {
  const unique = [...new Map(refs.map(ref => [fileKey(ref), ref])).values()];
  await Promise.all(unique.map(async ref => files.set(fileKey(ref), await fetchFile(ref))));
} catch (error) {
  console.error((error as Error).message);
  process.exit(2);
}

const misses = missingTests(refs, ref => files.get(fileKey(ref)));
for (const { ref, reason } of misses) {
  const sha = testLocation(ref).sha.slice(0, 7);
  console.log(`${ref.repo} ${ref.path} ${ref.name}: ${reason === 'no file' ? 'no file' : 'no test named so'} at ${sha}`);
}
if (misses.length > 0) {
  console.log(`${misses.length} of ${refs.length} named tests are missing.`);
  process.exit(1);
}
console.log(`All ${refs.length} named tests exist.`);
