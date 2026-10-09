// Pages print Shared Facts from src/config/sharedFacts.ts rather than typing them. Reads dist/.
import { expect, test } from 'bun:test';
import { protocolSizeLimit, relayTtl, replayWindow } from '../src/config/sharedFacts.ts';
import { servedAt } from './dist.ts';

test('the size limit renders from Shared Facts', () => {
  const paths = ['/docs/reference/wire-format', '/docs/operate/deploying'];
  const missing = paths.filter(path => {
    const served = servedAt(path);
    return served?.kind !== 'page' || !served.html.includes(protocolSizeLimit.text);
  });
  expect(missing).toEqual([]);
});

test('the Threat Model renders its day counts and size limit from Shared Facts', () => {
  const facts = [replayWindow.text, relayTtl.text, protocolSizeLimit.text];
  for (const path of ['/docs/trust/threat-model', '/agents/threat-model']) {
    const served = servedAt(path);
    const html = served?.kind === 'page' ? served.html : '';
    expect({ path, missing: facts.filter(fact => !html.includes(fact)) }).toEqual({ path, missing: [] });
  }
});
