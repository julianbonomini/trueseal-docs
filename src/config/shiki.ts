// The Shiki theme every code block uses, in Markdown and in Astro's <Code>.
import { createCssVariablesTheme } from 'shiki';

// Colours come from the --shiki-* variables in src/styles/tokens.css, so code follows the Theme.
export const codeTheme = createCssVariablesTheme({ name: 'trueseal', variablePrefix: '--shiki-', variableDefaults: {}, fontStyle: true });
