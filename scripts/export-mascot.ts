// Renders brand/mascot/mascot.svg to the PNG exports in the light Theme on paper. Run
// `bun run export-mascot` after changing the SVG.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const root = join(import.meta.dir, '..');
const svg = readFileSync(join(root, 'brand/mascot/mascot.svg'), 'utf8');
// The light Theme comes first in tokens.css, so the first --paper is the light one.
const paper = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8').match(/--paper:\s*(#[0-9A-Fa-f]{6})/)?.[1];
if (!paper) throw new Error('No --paper colour found in src/styles/tokens.css.');

const targets = [
  // At this width the mascot stays inside the circle a social avatar is cropped to.
  { file: 'brand/mascot/mascot-avatar.png', width: 1024, height: 1024, mascotWidth: 640 },
  { file: 'brand/mascot/mascot-readme-header.png', width: 1280, height: 400, mascotWidth: 320 },
];

const browser = await chromium.launch();
try {
  for (const { file, width, height, mascotWidth } of targets) {
    const page = await browser.newPage({ viewport: { width, height }, colorScheme: 'light', deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html>
<style>
  body { margin: 0; width: ${width}px; height: ${height}px; display: grid; place-items: center; background: ${paper}; }
  .mascot { display: block; width: 100%; height: auto; }
</style>
<div style="width:${mascotWidth}px">${svg}</div>`);
    await page.screenshot({ path: join(root, file) });
    await page.close();
    console.log(file);
  }
} finally {
  await browser.close();
}
