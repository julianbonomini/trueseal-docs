import { expect, test } from 'bun:test';
import { pageMarkdown } from './markdown';

const page = (article: string) =>
  `<html><body><header>Site header</header><nav class="sidebar">Sidebar</nav><main><article class="prose">${article}</article></main><footer>Site footer</footer></body></html>`;

test('only the article becomes Markdown, without its next-page links', () => {
  const markdown = pageMarkdown(page('<h1>Limits</h1><p>Body.</p><nav class="next-page"><a href="/agents/api">Next</a></nav>'));
  expect(markdown).toBe('# Limits\n\nBody.\n');
});

test('headings, paragraphs, links, lists and inline code become Markdown', () => {
  const markdown = pageMarkdown(
    page('<h1>Title</h1><h2>Part</h2><p>See <a href="/agents/limits">limits</a> and <code>ack()</code>.</p><ul><li>one</li><li>two</li></ul>'),
  );
  expect(markdown).toBe('# Title\n\n## Part\n\nSee [limits](/agents/limits) and `ack()`.\n\n- one\n- two\n');
});

test('a table becomes a GFM table and a pipe inside its code is escaped', () => {
  const markdown = pageMarkdown(
    page('<h1>T</h1><table><thead><tr><th>Name</th><th>Type</th></tr></thead><tbody><tr><td>x</td><td><code>a | b</code></td></tr></tbody></table>'),
  );
  expect(markdown).toContain('| Name | Type');
  expect(markdown).toContain('`a \\| b`');
});

test('a Shiki code block keeps its language and its lines', () => {
  const markdown = pageMarkdown(
    page('<h1>T</h1><pre class="astro-code" data-language="yaml"><code><span class="line">a: 1</span>\n<span class="line">b: 2</span></code></pre>'),
  );
  expect(markdown).toContain('```yaml\na: 1\nb: 2\n```');
});

test('a plaintext code block has no language', () => {
  const markdown = pageMarkdown(page('<h1>T</h1><pre data-language="plaintext"><code>x</code></pre>'));
  expect(markdown).toContain('```\nx\n```');
});

test('a data-markdown div gives its own Markdown in place of its HTML', () => {
  const markdown = pageMarkdown(page('<h1>T</h1><div data-markdown="- one\n- two"><span>junk</span></div>'));
  expect(markdown).toBe('# T\n\n- one\n- two\n');
});

test('comments, buttons and aria-hidden decoration are left out', () => {
  const markdown = pageMarkdown(page('<h1>T</h1><!-- Left column --><button>Copy</button><p>Next <span aria-hidden="true">→</span></p>'));
  expect(markdown).toBe('# T\n\nNext\n');
});

test('a page without an article throws', () => {
  expect(() => pageMarkdown('<html><body><p>x</p></body></html>')).toThrow('No <article> in page');
});
