// The Threat Model check's core: whether a file declares a named test. No network; each test hands
// missingTests the file text a fetch would have returned.
import { describe, expect, test } from 'bun:test';
import { missingTests } from '../scripts/declared-tests.ts';
import type { TestRef } from '../src/config/threatModel.ts';

const rust = `
#[cfg(test)]
mod tests {
    #[test]
    /// Proves the present case.
    #[ignore]
    fn present_test() {}

    #[tokio::test]
    async fn async_present_test() {}

    fn helper_name() {}
}
`;

function ref(path: string, name: string): TestRef {
  return { repo: 'trueseal-sync', path, name };
}

function check(path: string, name: string, text: string | undefined) {
  return missingTests([ref(path, name)], () => text);
}

describe('missingTests', () => {
  test('a Rust test that is present, renamed or removed', () => {
    expect(check('src/a.rs', 'present_test', rust)).toEqual([]);
    expect(check('src/a.rs', 'async_present_test', rust)).toEqual([]);
    const renamed = rust.replace('fn present_test', 'fn renamed_test');
    expect(check('src/a.rs', 'present_test', renamed)).toEqual([{ ref: ref('src/a.rs', 'present_test'), reason: 'no test' }]);
  });

  test('the deliberate break: a removed file is a miss', () => {
    expect(check('src/a.rs', 'present_test', undefined)).toEqual([{ ref: ref('src/a.rs', 'present_test'), reason: 'no file' }]);
  });

  test('a Rust function with no test attribute is not a test', () => {
    expect(check('src/a.rs', 'helper_name', rust)).toEqual([{ ref: ref('src/a.rs', 'helper_name'), reason: 'no test' }]);
  });

  test('a Go test that is present or renamed', () => {
    const go = 'package relay\n\nfunc TestA(t *testing.T) {\n}\n';
    expect(check('x_test.go', 'TestA', go)).toEqual([]);
    expect(check('x_test.go', 'TestA', go.replace('TestA', 'TestB'))).toHaveLength(1);
  });

  test('a node:test test that is present or renamed', () => {
    const mjs = "test('system', async t => {\n  await t.test('offline recipient drains', async () => {});\n});\n";
    expect(check('test/system.test.mjs', 'offline recipient drains', mjs)).toEqual([]);
    expect(check('test/system.test.mjs', 'system', mjs)).toEqual([]);
    expect(check('test/system.test.mjs', 'offline recipient drains', mjs.replace('drains', 'empties'))).toHaveLength(1);
  });

  test('a name is matched literally, not as a pattern', () => {
    const go = 'func axb(t *testing.T) {}';
    expect(check('x_test.go', 'a.b', go)).toHaveLength(1);
  });

  test('a file in a language it cannot read throws', () => {
    expect(() => check('Tests/A.swift', 'testA', '')).toThrow('Tests/A.swift');
  });

  test('misses come back in the order of the refs', () => {
    const refs = [ref('b.rs', 'b'), ref('a.rs', 'a'), ref('c.rs', 'present_test')];
    const misses = missingTests(refs, r => (r.path === 'c.rs' ? rust : undefined));
    expect(misses.map(miss => miss.ref.name)).toEqual(['b', 'a']);
  });
});
