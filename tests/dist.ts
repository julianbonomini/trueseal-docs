// The built site the dist/ checks read. Run `bun run build` first.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export const dist = join(import.meta.dir, '..', 'dist');

/** Every built HTML page under dist/, as absolute paths. */
export function builtPages(dir = dist): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}
