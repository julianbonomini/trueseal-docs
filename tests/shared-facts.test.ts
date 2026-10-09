// Pages print Shared Facts from src/config/sharedFacts.ts rather than typing them. Reads dist/.
import { expect, test } from 'bun:test';
import { protocolSizeLimit } from '../src/config/sharedFacts.ts';
import { servedAt } from './dist.ts';

test('the size limit renders from Shared Facts', () => {
  const paths = ['/docs/reference/wire-format', '/docs/operate/deploying', '/docs/overview/architecture'];
  const missing = paths.filter(path => {
    const served = servedAt(path);
    return served?.kind !== 'page' || !served.html.includes(protocolSizeLimit.text);
  });
  expect(missing).toEqual([]);
});
