// Screenshots built pages in both themes at desktop and phone widths, so a
// reviewer can see a UI change. Serves dist/ with `astro preview`, so run
// `bun run build` first.
//
//   bun run screenshot <out-dir> <path>...
//   bun run screenshot /tmp/shots / /docs/introduction
//
// Prints one line per screenshot, and flags console errors and pages wider
// than the viewport. Exits 1 when any page fails to load.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const port = 4329;
const origin = `http://localhost:${port}`;
const themes = ['light', 'dark'] as const;
const viewports = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};

const [outDir, ...paths] = process.argv.slice(2);
if (!outDir || paths.length === 0) {
  console.error('usage: bun run screenshot <out-dir> <path>...');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const server = spawn('bunx', ['astro', 'preview', '--port', String(port)], {
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  stdio: 'ignore',
});

let failed = false;
try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const path of paths) {
    for (const theme of themes) {
      for (const [device, viewport] of Object.entries(viewports)) {
        failed = !(await shoot(browser, path, theme, device, viewport)) || failed;
      }
    }
  }
  await browser.close();
} finally {
  server.kill();
}
process.exit(failed ? 1 : 0);

async function shoot(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  path: string,
  theme: (typeof themes)[number],
  device: string,
  viewport: { width: number; height: number },
): Promise<boolean> {
  // The site follows prefers-color-scheme until the reader picks a theme.
  const context = await browser.newContext({ viewport, colorScheme: theme });
  const page = await context.newPage();
  const errors: string[] = [];
  // Failed loads are reported by URL from the response, since the console
  // message for them doesn't name the URL.
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => errors.push(`error: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url() !== origin + path) {
      errors.push(`${response.status()} ${response.url().replace(origin, '')}`);
    }
  });

  const name = `${path.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'index'}-${theme}-${device}.png`;
  const file = join(outDir, name);
  const response = await page.goto(origin + path, { waitUntil: 'networkidle' });
  const status = response?.status() ?? 0;
  await page.screenshot({ path: file, fullPage: true });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  await context.close();

  const notes = [
    status === 200 ? '' : `HTTP ${status}`,
    width > viewport.width ? `overflows by ${width - viewport.width}px` : '',
    ...new Set(errors),
  ].filter(Boolean);
  console.log(`${file}${notes.length ? `  ${notes.join('; ')}` : ''}`);
  return status === 200;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await fetch(origin);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error(`astro preview did not start on ${origin}`);
}
