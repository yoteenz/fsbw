/**
 * Motion evidence for the four workspace proofs: drives twelve interactions with real clicks in Chromium, records them,
 * crops each recording to the device, writes an MP4 and a WebM and a filmstrip (just before each click, then 50 / 120 / 200 / 320 ms
 * after it) for inspection.
 *
 *   node design-authority/aio-office/workspaces/record.mjs <workspacesDist> <outDir> [label] [ids,comma,separated]
 *
 * label names the files (e.g. "after" or "before"); the same scenarios run against an older build for comparison.
 * Needs ffmpeg (libx264) and python3 + Pillow.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const [DIST, OUT] = process.argv.slice(2, 4).map((p) => resolve(p));
const LABEL = process.argv[4] || 'after';
const ONLY = process.argv[5] ? process.argv[5].split(',') : null;
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
const DEV = { phone: [390, 844], desktop: [1440, 900] };
const c = (a, v) => `#rv-screen [data-a="${a}"]${v != null ? `[data-v="${v}"]` : ''}`;

/** [id, title, device, view, reducedMotion, steps]; a step is [selector, label] or ['wait', ms]. */
const SCENARIOS = [
  ['01', 'FLEET · VEHICLE SELECTION', 'desktop', 'fleet', false, [[c('fl.unit', 'v-rl-104'), 'UNIT 104'], [c('fl.unit', 'v-abc-1'), 'UNIT 1'], [c('fl.unit', 'v-tk-09'), 'UNIT 09']]],
  ['02', 'FLEET · CONNECTION DETAIL', 'desktop', 'fleet', false, [[`#rv-screen .fl-tag[data-v="insurance"]`, 'INSURANCE'], [`#rv-screen .fl-tag[data-v="driver"]`, 'DRIVER'], [`#rv-screen .fl-tag[data-v="maintenance"]`, 'MAINTENANCE']]],
  ['03', 'CLIENT 360 · SERVICE SELECTION', 'desktop', 'client', false, [[c('cl.service', 'insurance'), 'INSURANCE'], [c('cl.service', 'compliance'), 'COMPLIANCE'], [c('cl.view', 'overview'), 'OVERVIEW']]],
  ['04', 'CLIENT 360 · DRILL DOWN AND RETURN', 'desktop', 'client', false, [[c('cl.service', 'insurance'), 'INSURANCE'], [c('cl.push', 'policy:pol-abc'), 'POLICY'], [`#rv-screen .cl-cx [data-a="cl.push"][data-v="vehicle:v-abc-1"]`, 'UNIT 1'], [`#rv-screen .cl-cx [data-a="cl.back"]`, 'BACK'], [`#rv-screen .cl-cx [data-a="cl.back"]`, 'BACK']]],
  ['05', 'BOOKKEEPING · STEP TRANSITION', 'desktop', 'books', false, [[c('bk.phase', 'collect'), 'COLLECT'], [c('bk.phase', 'review'), 'REVIEW'], [c('bk.phase', 'reconcile'), 'RECONCILE'], [c('bk.item', 'q:q2'), 'A CHARGE']]],
  ['06', 'BOOKKEEPING · DETAIL DRAWER', 'phone', 'books', false, [[c('bk.open', 'q:q1'), 'OPEN A CHARGE'], [`#rv-screen [data-a="bk.cat"][data-v="q1|FUEL"]`, 'FUEL · SIMULATED'], [`#rv-screen .wsheet [data-a="sheet.close"]`, 'CLOSE']]],
  ['07', 'COMPLIANCE · DEADLINE SELECTION', 'desktop', 'comp', false, [[`#rv-screen .hz-m[data-v="dl-tk-09"]`, 'UNIT 09'], [`#rv-screen .hz-m[data-v="dl-rj-ucr"]`, 'UCR'], [`#rv-screen .hz-m[data-v="dl-rl-irp"]`, 'IRP']]],
  ['08', 'COMPLIANCE · ISSUE DETAIL', 'desktop', 'comp', false, [[`#rv-screen .cp-row[data-v="dl-abc-insp"]`, 'DOT INSPECTION'], [`#rv-screen .cp-also__r[data-v="dl-abc-med"]`, 'ALSO DUE'], [`#rv-screen .cp-row[data-v="dl-dh-pol"]`, 'POLICY RENEWAL']]],
  ['09', 'ACTION CONFIRMATION', 'desktop', 'fleet', false, [[c('sim.ask', 'fl:tk:t-tk-2'), 'REQUEST AUTHORIZATION'], [c('sim.ok', 'fl:tk:t-tk-2'), 'CONFIRM · SIMULATED'], ['wait', 900]]],
  ['10', 'MOBILE DRAWER · OPEN AND CLOSE', 'phone', 'fleet', false, [[c('fl.open', 'insurance'), 'INSURANCE'], [`#rv-screen .wsheet [data-a="sheet.close"]`, 'CLOSE'], [c('fl.open', 'maintenance'), 'MAINTENANCE'], [`#rv-screen .wscrim`, 'TAP OUTSIDE']]],
  ['11', 'MOBILE TABS', 'phone', 'comp', false, [[c('cp.sec', 'dot_safety'), 'DOT / SAFETY'], [c('cp.sec', 'corrective'), 'CORRECTIVE'], [c('cp.sec', 'expirations'), 'EXPIRATIONS']]],
  ['12', 'REDUCED MOTION', 'phone', 'fleet', true, [[c('fl.open', 'insurance'), 'INSURANCE'], [`#rv-screen .wsheet [data-a="sheet.close"]`, 'CLOSE'], [c('fl.unit', 'v-abc-1'), 'UNIT 1']]],
];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const report = [];
for (const [id, title, dev, view, reduced, steps] of SCENARIOS) {
  if (ONLY && !ONLY.includes(id)) continue;
  const [w, h] = DEV[dev];
  const vw = Math.max(1500, w + 80);
  const vh = h + 420;
  const tmp = join(tmpdir(), `aio-rec-${process.pid}-${id}`);
  rmSync(tmp, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, recordVideo: { dir: tmp, size: { width: vw, height: vh } }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const t0 = Date.now(); // the recording starts with the page
  await p.goto(`http://127.0.0.1:${srv.address().port}/local.html?device=${dev}#${view}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => window.AIO_WS.capture(true));
  await p.evaluate(() => window.scrollTo(0, 0));
  const box = await p.locator('#rv-device').boundingBox();
  await p.waitForTimeout(900);
  const marks = [];
  for (const [sel, label] of steps) {
    if (sel === 'wait') {
      await p.waitForTimeout(label);
      continue;
    }
    const el = p.locator(sel).first();
    if (!(await el.count())) {
      marks.push({ label, at: null, missing: sel });
      continue;
    }
    marks.push({ label, at: (Date.now() - t0) / 1000 });
    await el.click(sel.endsWith('.wscrim') ? { position: { x: 40, y: 60 } } : {}); // tapping outside the drawer
    await p.waitForTimeout(1100);
  }
  await p.waitForTimeout(500);
  const video = p.video();
  await ctx.close();
  const webm = await video.path();
  const mp4 = join(OUT, `${id}-${LABEL}.mp4`);
  const crop = `crop=${Math.round(box.width) & ~1}:${Math.round(box.height) & ~1}:${Math.round(box.x)}:${Math.round(box.y)}`;
  const scale = dev === 'desktop' ? ',scale=1280:-2' : '';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-vf', `${crop}${scale}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'veryfast', '-movflags', '+faststart', '-an', mp4]);
  // the same clip as VP9 WebM: browsers without H.264 (open-source Chromium) play this one; the review offers both
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-an', mp4.replace(/\.mp4$/, '.webm')]);
  // filmstrip: for each click, the frame just before and frames 50 / 120 / 200 / 320 ms after
  const strips = [];
  for (const [i, m] of marks.entries()) {
    if (m.at == null) continue;
    for (const [k, dt] of [-0.08, 0.05, 0.12, 0.2, 0.32].entries()) {
      const f = join(tmp, `f${i}-${k}.png`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, m.at + dt)), '-i', mp4, '-frames:v', '1', f]);
      strips.push([i, k, f, m.label, dt]);
    }
  }
  const py = `import sys,json\nfrom PIL import Image,ImageDraw\nrows=json.loads(sys.argv[1]);out=sys.argv[2]\nims={}\nfor i,k,f,l,dt in rows: ims[(i,k)]=(Image.open(f).convert('RGB'),l,dt)\nW=360 if ${dev === 'phone' ? 1 : 0} else 420\nn=max(i for i,_,_,_,_ in rows)+1 if rows else 0\nfirst=next(iter(ims.values()))[0]\nH=round(first.height*W/first.width)\nsheet=Image.new('RGB',(5*(W+8)+8,n*(H+30)+8),(30,30,32))\nd=ImageDraw.Draw(sheet)\nfor (i,k),(im,l,dt) in ims.items():\n  x=8+k*(W+8);y=8+i*(H+30)\n  sheet.paste(im.resize((W,H)),(x,y+22))\n  d.text((x,y+4),f"{l}  {'before' if dt<0 else '+'+str(int(dt*1000))+' ms'}",fill=(240,200,110))\nsheet.save(out,quality=85)`;
  if (strips.length) execFileSync('python3', ['-I', '-c', py, JSON.stringify(strips), join(OUT, `${id}-${LABEL}-strip.jpg`)]);
  rmSync(tmp, { recursive: true, force: true });
  report.push({ id, title, dev, reduced, mp4: `${id}-${LABEL}.mp4`, webm: `${id}-${LABEL}.webm`, strip: `${id}-${LABEL}-strip.jpg`, marks });
  console.log(id, title, marks.map((m) => (m.at == null ? `MISSING ${m.label}` : m.label)).join(' → '));
}
// a partial run (ids given) updates its scenarios and keeps the others
const jf = join(OUT, `recordings-${LABEL}.json`);
const prev = ONLY && existsSync(jf) ? JSON.parse(readFileSync(jf, 'utf8')).filter((r) => !ONLY.includes(r.id)) : [];
writeFileSync(jf, JSON.stringify([...prev, ...report].sort((a, b) => a.id.localeCompare(b.id)), null, 1));
await browser.close();
srv.close();
