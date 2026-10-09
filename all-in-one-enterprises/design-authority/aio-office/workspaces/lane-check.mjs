/**
 * Check one workspace while it is being built: every SEE state and declared audit state of the workspace, at phone,
 * tablet, desktop and ultra-wide — structure (handlers, dead controls, keyboard reach, uppercase, sideways overflow,
 * one-screen fit) and the text audit — and a screenshot of each for looking at.
 *
 *   node design-authority/aio-office/workspaces/lane-check.mjs <workspacesDist> <workspaceId> <outDir> [devices,comma]
 *
 * Prints one line per state and device (OK, or the problems) and exits 1 when any check fails.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SINGLE_LINE, pageAudit, pageStructure } from './audit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const [DIST, WS, OUT] = [resolve(process.argv[2]), process.argv[3], resolve(process.argv[4])];
const DEVS = (process.argv[5] || 'phone,tablet,desktop,wide').split(',');
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));
mkdirSync(OUT, { recursive: true });
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
const DEV = { phone: [390, 844], tablet: [834, 1194], desktop: [1440, 900], wide: [2560, 1440] };
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const errors = [];
let bad = 0;
for (const dev of DEVS) {
  const p = await browser.newPage({ viewport: { width: Math.max(1500, DEV[dev][0] + 80), height: DEV[dev][1] + 420 } });
  p.on('pageerror', (e) => errors.push(`${dev}: ${e}`));
  p.on('console', (m) => m.type() === 'error' && errors.push(`${dev}: ${m.text()}`));
  await p.goto(`http://127.0.0.1:${srv.address().port}/local.html?device=${dev}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  const def = await p.evaluate((id) => window.AIO_WS.registry().find((w) => w.id === id), WS);
  if (!def) throw new Error(`no workspace ${WS}`);
  const states = [...def.states.map(([l, acts, d]) => [l, acts, d]), ...def.audit.map((acts, i) => [`AUDIT ${i + 1}`, acts, null])].filter(([, , d]) => !d || d === dev);
  for (const [i, [label, acts]] of states.entries()) {
    await p.evaluate(([w, a, d]) => window.AIO_WS.go(w, a, d), [WS, acts, dev]);
    await p.waitForTimeout(450);
    await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
    await p.evaluate(() => window.AIO_WS.capture(true));
    const st = await p.evaluate(pageStructure);
    const au = (await p.evaluate(pageAudit, SINGLE_LINE)).filter((x) => !(x.kind === 'TRUNCATED' && x.reachable) && !(x.kind === 'SCROLLS_X' && x.scroller));
    const view = await p.evaluate(() => window.AIO_WS.state().view);
    const probs = [];
    if (st.unknown.length) probs.push(`UNKNOWN ACTIONS ${st.unknown.join(',')}`);
    if (st.dead.length) probs.push(`DEAD ${st.dead.length}: ${st.dead[0]}`);
    if (st.inputs) probs.push(`UNWIRED INPUTS ${st.inputs}`);
    if (st.unreachable.length) probs.push(`NOT KEYBOARD-REACHABLE ${st.unreachable.length}: ${st.unreachable[0]}`);
    if (st.lower.length) probs.push(`LOWERCASE ${st.lower.join(' | ')}`);
    if (st.sw > st.cw + 1 || st.wide.length) probs.push(`SIDEWAYS ${st.sw}/${st.cw} ${st.wide.join(',')}`);
    if (dev !== 'phone' && !st.sheet && st.sh > st.ch + 1) probs.push(`PAGE SCROLLS ${st.sh} > ${st.ch} (desktop, tablet and wide fit one screen; only lists scroll)`);
    for (const x of au.slice(0, 6)) probs.push(`${x.kind} ${x.el} "${x.text}"${x.with ? ` × ${x.with}` : ''}${x.by ? ` by ${x.by}` : ''}`);
    if (au.length > 6) probs.push(`… ${au.length - 6} more text issues`);
    const file = join(OUT, `${WS}-${String(i).padStart(2, '0')}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${dev}.png`);
    await (await p.$('#rv-device')).screenshot({ path: file });
    await p.evaluate(() => window.AIO_WS.capture(false));
    if (probs.length) bad++;
    console.log(`${probs.length ? 'FAIL' : 'OK  '} ${dev.padEnd(7)} ${label.padEnd(14)} view=${view} ${probs.length ? `\n       ${probs.join('\n       ')}` : ''}`);
  }
  await p.close();
}
if (errors.length) console.log(`CONSOLE / PAGE ERRORS\n  ${[...new Set(errors)].slice(0, 8).join('\n  ')}`);
await browser.close();
srv.close();
process.exit(bad || errors.length ? 1 : 0);
