// The Human Docs and Agent Docs sources, line by line, for the checks that read source rather than dist/.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const content = join(import.meta.dir, '..', 'src', 'content');

/** Every line of every `.md` and `.mdx` file in `src/content/<collection>`, with `where` as `path:line`.
 *  MDX comments read as blank, so a commented-out line never counts. Throws when the collection has no source. */
export function contentLines(collection: 'docs' | 'agents'): { file: string; where: string; line: string }[] {
  const dir = join(content, collection);
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter(file => /\.mdx?$/.test(file));
  if (files.length === 0) throw new Error(`No sources in src/content/${collection}`);
  return files.flatMap(name => {
    const file = `src/content/${collection}/${name}`;
    // Blank comments out line by line, so line numbers still match the file.
    const source = readFileSync(join(dir, name), 'utf8').replace(/\{\/\*[\s\S]*?\*\/\}/g, comment => comment.replace(/[^\n]/g, ' '));
    return source.split('\n').map((line, index) => ({ file, where: `${file}:${index + 1}`, line }));
  });
}
