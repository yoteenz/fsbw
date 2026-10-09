/**
 * Landing thumbnails for the review: every department and approved root that shows on the landing, drawn in its MAIN
 * state at desktop (1440 × 900) and phone (390 × 844), saved small. The next build lists them (THUMBS) and copies them.
 *
 *   node design-authority/aio-office/workspaces/thumbs.mjs <workspacesDist> [outDir]
 *     outDir  default: AIO_OFFICE_COMPLETE_REVIEW/thumbs (repository root)
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const DIST = resolve(process.argv[2]);
const OUT = resolve(process.argv[3] || join(APP, '..', 'AIO_OFFICE_COMPLETE_REVIEW/thumbs'));
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));
mkdirSync(OUT, { recursive: true });
const TMP = join(tmpdir(), `aio-thumbs-${process.pid}`);
mkdirSync(TMP, { recursive: true });
const srv = await new Promise((r) => {
  const s = createServer((q, res) => {
    if (q.url === '/favicon.ico') return res.writeHead(204).end();
    const p = join(DIST, decodeURIComponent(new URL(q.url, 'http://x').pathname));
    if (!p.startsWith(DIST) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png' }[extname(p)] || 'application/octet-stream' });
    createReadStream(p).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const SIZES = { desktop: [1440, 900, 720], phone: [390, 844, 300] };
let n = 0;
for (const [dev, [w, h, out]] of Object.entries(SIZES)) {
  const p = await browser.newPage({ viewport: { width: Math.max(1500, w + 80), height: h + 420 } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/local.html?device=${dev}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  const ids = (await p.evaluate(() => window.AIO_WS.registry())).filter((x) => !x.hidden).map((x) => x.id);
  for (const id of ids) {
    await p.evaluate(([i, d]) => window.AIO_WS.go(i, [], d), [id, dev]);
    await p.waitForTimeout(400);
    await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
    await p.evaluate(() => window.AIO_WS.capture(true));
    const png = join(TMP, `${id}--${dev}.png`);
    await (await p.$('#rv-device')).screenshot({ path: png });
    await p.evaluate(() => window.AIO_WS.capture(false));
    execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nw=int(sys.argv[3])\nim=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=80,optimize=True,progressive=True)', png, join(OUT, `${id}--${dev}.jpg`), String(out)]);
    n++;
  }
  await p.close();
}
await browser.close();
srv.close();
rmSync(TMP, { recursive: true, force: true });
console.log(`thumbs: ${n} written to ${OUT}`);
