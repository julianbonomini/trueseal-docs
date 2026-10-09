// The reference check on any folder of Markdown/MDX, resolved against this checkout's build: `bun run check:references
// [--ref <docs ref>] <folder or file>...`. Exits 0 with no misses, 1 with misses, 2 on a usage or setup error.
// trueseal-skills CI runs it on its skill files from a trueseal-docs checkout at a pinned ref.
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { findMissingReferences, formatMissing, knownReferences, markdownFiles } from '../src/references/references.ts';

const docsRoot = join(import.meta.dir, '..');
const dist = join(docsRoot, 'dist');

function git(...args: string[]): string {
  const result = Bun.spawnSync(['git', '-C', docsRoot, ...args]);
  return result.exitCode === 0 ? result.stdout.toString().trim() : '';
}

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

const args = process.argv.slice(2);
const refAt = args.indexOf('--ref');
const ref = refAt === -1 ? undefined : args[refAt + 1];
const paths = refAt === -1 ? args : args.toSpliced(refAt, 2);
if (paths.length === 0 || (refAt !== -1 && !ref)) fail('usage: bun run check:references [--ref <docs ref>] <folder or file>...');

const head = git('rev-parse', 'HEAD');
const short = git('rev-parse', '--short', 'HEAD');
if (ref && !head) fail(`--ref needs ${docsRoot} to be a git checkout of trueseal-docs.`);
// A ref that names another commit would check skills against pages and names this build doesn't have.
if (ref && git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`) !== head) {
  fail(`trueseal-docs is at ${short}, not ${ref}. Check out ${ref} and run bun run build first.`);
}
if (!existsSync(join(dist, 'index.html'))) fail(`No build in ${dist}. Run bun run build in trueseal-docs first.`);

const files = paths.flatMap(path => {
  const absolute = resolve(path);
  if (!existsSync(absolute)) fail(`No such folder or file: ${path}`);
  return markdownFiles(absolute).map(file => ({ ...file, path: relative(process.cwd(), file.path) }));
});
const misses = findMissingReferences(files, knownReferences(dist));
if (misses.length === 0) {
  console.log(`No missing references in ${files.length} files (trueseal-docs ${short}).`);
  process.exit(0);
}
for (const miss of misses) console.log(formatMissing(miss));
console.log(`${misses.length} missing references (trueseal-docs ${short}).`);
process.exit(1);
