// Site-wide values: the origin, the one-line description and the version shown in the chrome.
import { factText } from '../facts/facts';

/** The version shown in the header and the docs Menu: the TrueSeal Release from Shared Facts. */
export const versionLabel = `${factText('trueSealRelease').text} preview`;

/** The deployed site's origin, without a trailing slash. */
export const siteUrl = 'https://trueseal.dev';

/** The one-line summary of TrueSeal: every page's default meta description and the llms.txt summary. */
export const siteDescription = 'End-to-end encrypted sync for Swift, Kotlin and TypeScript, with a relay you run yourself.';
