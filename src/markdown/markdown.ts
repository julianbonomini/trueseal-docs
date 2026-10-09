// The Markdown versions of the built docs pages, and llms.txt and llms-full.txt over the Agent Docs.
// It hides how a built page becomes Markdown (which part of the HTML is the page, what is dropped, how a
// component gives its own Markdown, how code keeps its language), the two llms formats and where in dist/ they go.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Element, ElementContent, Root as HastRoot } from 'hast';
import type { RootContent } from 'mdast';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { markdownPathOf, sidebarPages, type Surface } from '../config/nav';
import { siteDescription, siteUrl, versionLabel } from '../config/site';

const droppedTags = new Set(['nav', 'button', 'script', 'style', 'template']);

const parseHtml = unified().use(rehypeParse);

// The first element in document order that passes `test`.
function findElement(node: HastRoot | Element, test: (element: Element) => boolean): Element | undefined {
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    if (test(child)) return child;
    const found = findElement(child, test);
    if (found) return found;
  }
  return undefined;
}

const isArticle = (element: Element) => element.tagName === 'article';

// Keeps what a reader of the page reads: comments, navigation, buttons and aria-hidden decoration go.
// Shiki marks a block's language on its <pre>; hast-util-to-mdast looks for it as a `language-` class on the
// <code>, so it is copied there.
function prune(element: Element): void {
  element.children = element.children.filter(
    (child): child is ElementContent =>
      child.type !== 'comment' &&
      (child.type !== 'element' || (!droppedTags.has(child.tagName) && child.properties.ariaHidden !== 'true')),
  );
  for (const child of element.children) {
    if (child.type !== 'element') continue;
    const language = child.properties.dataLanguage;
    if (child.tagName === 'pre' && typeof language === 'string' && language !== 'plaintext') {
      const code = child.children.find((c): c is Element => c.type === 'element' && c.tagName === 'code');
      if (code) code.properties.className = [...((code.properties.className as string[] | undefined) ?? []), `language-${language}`];
    }
    prune(child);
  }
}

const parseMarkdown = unified().use(remarkParse).use(remarkGfm);

const toMarkdown = unified()
  .use(rehypeParse)
  .use(() => (tree: HastRoot): HastRoot => {
    const article = findElement(tree, isArticle);
    if (!article) throw new Error('No <article> in page');
    prune(article);
    return { type: 'root', children: [article] };
  })
  .use(rehypeRemark, {
    handlers: {
      div(state, node): RootContent[] {
        const markdown = node.properties.dataMarkdown;
        if (typeof markdown === 'string') return parseMarkdown.parse(markdown).children;
        return state.toFlow(state.all(node));
      },
    },
  })
  .use(remarkGfm)
  .use(remarkStringify, { bullet: '-', fences: true, rule: '-' });

/** The Markdown version of one built docs page: its <article> as GitHub-flavoured Markdown, from its `# h1`
 *  to its last block, ending in one newline. Navigation, buttons and aria-hidden decoration are left out; a
 *  `div[data-markdown]` gives its own Markdown in place of its HTML; code blocks keep their language.
 *  Throws `No <article> in page` when the HTML has no article. */
export function pageMarkdown(html: string): string {
  return toMarkdown.processSync(html).toString();
}

function descriptionOf(html: string): string {
  const meta = findElement(parseHtml.parse(html), element => element.tagName === 'meta' && element.properties.name === 'description');
  return String(meta?.properties.content ?? '');
}

// Every built page under dist/<surface>, as its site path and HTML. Redirect pages have no article and are left out.
function builtPages(dist: string, surface: Surface): { path: string; html: string }[] {
  const walk = (dir: string, path: string): { path: string; html: string }[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      if (entry.isDirectory()) return walk(join(dir, entry.name), `${path}/${entry.name}`);
      if (entry.name !== 'index.html') return [];
      const html = readFileSync(join(dir, entry.name), 'utf8');
      return findElement(parseHtml.parse(html), isArticle) ? [{ path: `${path}/`, html }] : [];
    });
  return walk(join(dist, surface), `/${surface}`);
}

/** Writes beside the built site in `dist`: `<page path>.md` for every Human Docs and Agent Docs page (each
 *  index.html under dist/docs and dist/agents that holds an <article>), plus `llms.txt` and `llms-full.txt`
 *  over the Agent Docs sidebar pages in reading order. Throws `Agent Docs page <path> was not built` when a
 *  sidebar page has no built HTML. */
export function writeMarkdownFiles(dist: string): void {
  const pagesByMarkdownPath = new Map(
    [...builtPages(dist, 'docs'), ...builtPages(dist, 'agents')].map(page => [
      markdownPathOf(page.path),
      { html: page.html, markdown: pageMarkdown(page.html) },
    ]),
  );
  for (const [markdownPath, { markdown }] of pagesByMarkdownPath) writeFileSync(join(dist, markdownPath), markdown);

  const agentsPages = sidebarPages('agents').map(({ section, link }) => {
    const markdownPath = markdownPathOf(link.href);
    const page = pagesByMarkdownPath.get(markdownPath);
    if (!page) throw new Error(`Agent Docs page ${link.href} was not built`);
    return {
      section,
      url: siteUrl + markdownPath,
      title: page.markdown.match(/^# (.*)$/m)?.[1] ?? link.title,
      description: descriptionOf(page.html),
      markdown: page.markdown,
    };
  });

  const sections = [...new Set(agentsPages.map(page => page.section))].map(section =>
    [
      `## ${section}`,
      agentsPages
        .filter(page => page.section === section)
        .map(page => `- [${page.title}](${page.url}): ${page.description}`)
        .join('\n'),
    ].join('\n\n'),
  );
  const llms = [
    '# TrueSeal',
    `> ${siteDescription}`,
    `The TrueSeal Agent Docs for ${versionLabel}, written for coding agents and canonical where they differ from the Human Docs. ` +
      `Each link is the Markdown version of a page. The whole Agent Docs in one file: ${siteUrl}/llms-full.txt. ` +
      `Every Human Docs page under ${siteUrl}/docs/ has a Markdown version too: add \`.md\` to its URL.`,
    ...sections,
  ];
  writeFileSync(join(dist, 'llms.txt'), `${llms.join('\n\n')}\n`);

  const full = [
    '# TrueSeal',
    `> ${siteDescription}`,
    `The whole TrueSeal Agent Docs for ${versionLabel}, page by page. The index is ${siteUrl}/llms.txt.`,
    ...agentsPages.map(page => `---\n\nSource: ${page.url}\n\n${page.markdown.trimEnd()}`),
  ];
  writeFileSync(join(dist, 'llms-full.txt'), `${full.join('\n\n')}\n`);
}
