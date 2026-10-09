// The Agent Snippet: the block app developers paste into their own AGENTS.md. The Agent Docs index page and the Landing's Integrate section both render it.
import { markdownPathOf, sidebarPaths } from '../config/nav';
import { siteUrl } from '../config/site';

// The absolute URL of an Agent Docs page's Markdown version, so a renamed page fails the build.
function agentsPage(href: string): string {
  if (!sidebarPaths('agents').includes(href)) throw new Error(`Agent Snippet links ${href}, which is not an Agent Docs sidebar page`);
  return siteUrl + markdownPathOf(href);
}

const llms = `${siteUrl}/llms.txt`;
const whatTrueSealIs = agentsPage('/agents/what-trueseal-is');

/** The Agent Snippet as Markdown, ready to paste into an AGENTS.md: a `## TrueSeal` heading, the integration
 *  pitfalls, the llms.txt URL and the TrueSeal Skills install commands. It states no Shared Fact or case; it links
 *  the Markdown versions of Agent Docs pages by absolute URL. No leading or trailing whitespace.
 *  Throws at import when it links a page missing from the Agent Docs sidebar. */
export const agentSnippet = [
  '## TrueSeal',
  '',
  `This app syncs data between devices with TrueSeal. Before you write or change code that uses TrueSeal, read ${llms} and take every API name, limit, error case and version from the pages it lists.`,
  '',
  '- Register the `onMessage` handler when the app starts. Nothing is received until it is registered.',
  '- Store or apply each message before the `onMessage` handler returns, and await that work inside the handler. The library acks the message to the relay when the handler returns, so work still running in the background is lost if the app is killed before it finishes.',
  '- Key stored messages by their `MessageId`, so that handling one twice changes nothing. A message arrives again if the app crashed while handling it.',
  '- Pairing needs an action by the user on both devices. On the admitting device, call `accept(request)` only after the user confirms the request comes from the device in front of them. The name in a request is a label the device chose and proves nothing. On the joining device, call `join(token)` only with a token the user scanned or pasted from the admitting device.',
  `- Describe TrueSeal to users only with what ${whatTrueSealIs} says it does and does not do.`,
  '',
  // TODO: ADR-0005 names the plugin `trueseal` but not the marketplace; `@trueseal-skills` assumes trueseal-skills' marketplace.json is named after the repo. Check once that repo exists.
  'The TrueSeal Skills walk through integrating, pairing and running a relay. In Claude Code, run `/plugin marketplace add julianbonomini/trueseal-skills`, then `/plugin install trueseal@trueseal-skills`. In other agents, run `npx skills add julianbonomini/trueseal-skills`.',
].join('\n');
