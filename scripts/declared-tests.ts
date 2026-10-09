// The Threat Model check's core: which named tests their files don't declare. It knows how a test is
// declared in Rust, Go and node:test, and nothing about where the file text comes from.
import type { TestRef } from '../src/config/threatModel.ts';

/** A named test that isn't there: its file is missing, or the file declares no test by that name. */
export interface Miss {
  ref: TestRef;
  reason: 'no file' | 'no test';
}

/** The refs whose test isn't declared. `source` returns a file's text, or undefined when the file doesn't exist.
 *  A test is declared when its file contains:
 *   - .rs: `fn <name>` after a `#[...test]` attribute (`#[test]`, `#[tokio::test]`), with doc comments
 *     and other attributes allowed between;
 *   - .go: `func <name>(<id> *testing.T)`;
 *   - .js/.mjs/.ts: `test(` or `<id>.test(` or `it(` with the exact name as its first string literal.
 *  Throws on any other extension. Order follows `refs`. */
export function missingTests(refs: readonly TestRef[], source: (ref: TestRef) => string | undefined): Miss[] {
  return refs.flatMap((ref): Miss[] => {
    // Built before the lookup so a test in an unreadable language throws even when its file is gone.
    const declaration = declarationOf(ref);
    const text = source(ref);
    if (text === undefined) return [{ ref, reason: 'no file' }];
    return declaration.test(text) ? [] : [{ ref, reason: 'no test' }];
  });
}

function declarationOf({ repo, path, name }: TestRef): RegExp {
  const literal = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const extension = path.slice(path.lastIndexOf('.'));
  switch (extension) {
    case '.rs':
      return new RegExp(
        String.raw`#\[(?:\w+::)*test(?:\([^)]*\))?\]\s*(?:(?:#\[[^\]]*\]|//[^\n]*)\s*)*(?:pub\s+)?(?:async\s+)?fn\s+${literal}\b`,
      );
    case '.go':
      return new RegExp(String.raw`func\s+${literal}\s*\(\s*\w+\s+\*testing\.T\s*\)`);
    case '.js':
    case '.mjs':
    case '.ts':
      return new RegExp(String.raw`(?:^|[^\w$.])(?:[\w$]+\.)?(?:test|it)\(\s*(['"\x60])${literal}\1`, 'm');
    default:
      throw new Error(`${repo} ${path}: the Threat Model check can't read tests in ${extension} files.`);
  }
}
