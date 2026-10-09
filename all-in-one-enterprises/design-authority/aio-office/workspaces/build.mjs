/**
 * Build the AIO OFFICE four-workspace founder review as one self-contained page + its image files.
 *
 *   node design-authority/aio-office/workspaces/build.mjs [outDir]      (default: design-authority/aio-office/workspaces/dist)
 *
 * Inlines the scoped studio CSS (the approved roots' header, navigation and tokens), office.css (status chips, badges),
 * ws.css (the workspace grammar) and review.css, the icon sheet, and every script: studio.js in embed mode →
 * office-data → office-ui → ws-data → ws-core → ws-fleet → ws-books → ws-compliance → ws-client → ws-review.
 * Images are copied at the relative paths the scripts use (P = '.'). Nothing here touches the live app.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const STUDIO = resolve(HERE, '..');
const OFFICE = join(STUDIO, 'office');
const APP = resolve(HERE, '../../..');
const REPO = resolve(APP, '..');
const OUT = resolve(process.argv[2] || join(HERE, 'dist'));
const read = (p) => readFileSync(p, 'utf8');
const sub = (s, a, b, all = false) => {
  if (!s.includes(a)) throw new Error(`build: expected text not found: ${a.slice(0, 80)}`);
  return all ? s.split(a).join(b) : s.replace(a, b);
};

/* ── CSS: the approved studio styles, scoped to the device (as the Batch 1 review did) ── */
let css = read(join(STUDIO, 'studio.css'));
css = css.replace(/@font-face \{[^}]*\}\n/g, '');
css = sub(css, ":root {\n  --text: 'AO Roboto', Roboto, Arial, sans-serif;\n  --cond: 'AO Roboto Condensed', 'Roboto Condensed', 'Arial Narrow', sans-serif;", ".ao-root {\n  --text: Roboto, Arial, sans-serif;\n  --cond: 'Roboto Condensed', 'Arial Narrow', sans-serif;");
css = sub(css, '* {\n  box-sizing: border-box;\n}', '.ao-root * {\n  box-sizing: border-box;\n}');
css = sub(css, 'html,\nbody {', '.ao-root {');
css = sub(css, 'img {\n  display: block;\n}', '.ao-root img {\n  display: block;\n}');
css = sub(css, '  min-height: 100vh;\n}', '  min-height: 100%;\n}');
css = sub(css, '100vw', 'var(--dw)', true);

/* ── JS ── */
let studio = read(join(STUDIO, 'studio.js'));
studio = sub(studio, '${P}/brand/all-in-one-hero-truck.png', '${P}/brand/all-in-one-hero-truck.jpg');
studio = sub(studio, '${P}/brand/aio-login-hero.png', '${P}/brand/aio-login-hero.jpg');
const js = [
  "window.AIO_STUDIO_EMBED = true;\nwindow.AIO_STUDIO_ASSETS = '.';",
  studio,
  read(join(OFFICE, 'office-data.js')),
  read(join(OFFICE, 'office-ui.js')),
  ...['ws-data.js', 'ws-core.js', 'ws-motion.js', 'ws-fleet.js', 'ws-books.js', 'ws-compliance.js', 'ws-client.js', 'ws-review.js'].map((f) => read(join(HERE, f))),
  'boot();',
].join('\n\n');
if (js.includes('</script')) throw new Error('build: a script contains </script');
const sheet = read(join(APP, 'public/migration/icons/aio-icon-sheet.svg'));

/* ── page ── */
const tabs = [['overview', '', 'OVERVIEW'], ['fleet', '04', 'VEHICLES & FLEET'], ['books', '09', 'BOOKKEEPING'], ['comp', '03', 'COMPLIANCE'], ['client', '360', 'CLIENT 360']];
const html = `<title>AIO Office Workspaces</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;500;600;700;800&family=Roboto:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${read(join(HERE, 'review.css'))}
${css}
${read(join(OFFICE, 'office.css'))}
${read(join(HERE, 'ws.css'))}
</style>
<div class="rv" data-view="overview">
  <header class="rv-top">
    <div class="rv-id"><img src="migration/brand-lockup.png" alt="ALL IN ONE ENTERPRISES INC."><span><b>AIO OFFICE · WORKSPACES</b><small>CANDIDATES · FOR FOUNDER APPROVAL</small></span></div>
    <nav class="rv-tabs" aria-label="Workspaces">${tabs.map(([id, no, l]) => `<button type="button" class="rv-tab" data-rv-tab="${id}">${no ? `<i>${no}</i>` : ''}${l}</button>`).join('')}</nav>
    <div class="rv-group" role="group" aria-label="View as"><span class="rv-k">VIEW AS</span><button type="button" class="rv-btn" data-rv-role="founder">FOUNDER</button><button type="button" class="rv-btn" data-rv-role="staff">STAFF</button></div>
  </header>
  <div class="rv-bar">
    <div class="rv-line" id="rv-line"></div>
    <div class="rv-try" id="rv-try"></div>
    <div class="rv-right">
      <span class="rv-sims" id="rv-sims"></span><button type="button" class="rv-btn" id="rv-reset" disabled style="visibility:hidden">RESET</button>
      <div class="rv-group" role="group" aria-label="Screen"><button type="button" class="rv-btn" data-rv-device="phone">PHONE</button><button type="button" class="rv-btn" data-rv-device="tablet">TABLET</button><button type="button" class="rv-btn" data-rv-device="desktop">DESKTOP</button><button type="button" class="rv-btn" data-rv-device="wide">ULTRA-WIDE</button></div>
      <button type="button" class="rv-btn" id="rv-motionbtn" data-rv-motion="toggle" aria-pressed="false" title="TURNS MOTION OFF IN THE WORKSPACES, AS A PHONE SET TO REDUCE MOTION WOULD">REDUCE MOTION</button>
      <button type="button" class="rv-btn" id="rv-beforebtn" data-rv-before="toggle">BEFORE</button>
    </div>
  </div>
  <div id="rv-landing"></div>
  <div id="rv-work" hidden>
    <div id="rv-stagewrap" class="rv-stagewrap">
      <div id="rv-stage"><div id="rv-sizer"><div class="rv-cap" id="rv-cap" hidden></div><div id="rv-device" class="ao-root device"><div id="rv-screen" class="screen"></div><div id="rv-toast" class="proto-toast" hidden></div></div></div></div>
      <div class="rv-meta"><span id="rv-scale"></span><span>SAMPLE RECORDS · SIMULATED ACTIONS SAVE NOTHING</span></div>
    </div>
    <div id="rv-before" hidden></div>
  </div>
  <div id="rv-lightbox" hidden></div>
</div>
<div style="display:none" aria-hidden="true">${sheet}</div>
<script>
${js}
</script>
`;

/* ── images (relative to the page) ── */
const jobs = [];
const plate = (name, w) => jobs.push([join(APP, `public/brand/ifta/plates/${name}`), join(OUT, `brand/ifta/plates/${name}`), w, 'jpg']);
['staff-hero.jpg'].forEach((n) => plate(n, 2560));
jobs.push([join(APP, 'public/migration/brand-lockup.png'), join(OUT, 'migration/brand-lockup.png'), 0, 'copy']);
/* the Batch 1 diagnosis (deliverable A) and the boards made by boards.mjs */
for (const n of ['diagnosis-1-one-template', 'diagnosis-2-fleet', 'diagnosis-3-bookkeeping', 'diagnosis-4-compliance', 'diagnosis-5-client', 'before-after-fleet', 'before-after-books', 'before-after-comp', 'before-after-client', 'family-roots']) jobs.push([join(REPO, 'AIO_OFFICE_WORKSPACE_PROOFS/boards', `${n}.jpg`), join(OUT, `diagnosis/${n}.jpg`), 0, 'copy']);
/* this pass: the boards made by polish-boards.mjs, and the twelve recordings (last pass and this one) made by record.mjs */
for (const n of ['polish-1-fleet', 'polish-2-client', 'polish-3-books', 'polish-4-comp', 'polish-5-drawers', 'polish-6-text', 'polish-7-motion']) jobs.push([join(REPO, 'AIO_OFFICE_WORKSPACE_PROOFS/boards', `${n}.jpg`), join(OUT, `diagnosis/${n}.jpg`), 0, 'copy']);
for (let i = 1; i <= 12; i++) {
  const id = String(i).padStart(2, '0');
  for (const f of [`${id}-before.webm`, `${id}-after.webm`, `${id}-before.mp4`, `${id}-after.mp4`, `${id}-poster.jpg`]) jobs.push([join(REPO, 'AIO_OFFICE_WORKSPACE_PROOFS/recordings', f), join(OUT, `motion/${f}`), 0, 'copy']);
}

mkdirSync(OUT, { recursive: true });
const fresh = (src, dst) => existsSync(dst) && statSync(dst).mtimeMs >= statSync(src).mtimeMs;
const resize = [];
for (const [src, dst, w, kind] of jobs) {
  if (!existsSync(src)) throw new Error(`build: missing asset ${src}`);
  mkdirSync(dirname(dst), { recursive: true });
  if (fresh(src, dst)) continue;
  if (kind === 'copy') copyFileSync(src, dst);
  else resize.push([src, dst, w]);
}
if (resize.length) {
  const py = `import json,sys\nfrom PIL import Image\nfor src,dst,w in json.loads(sys.argv[1]):\n  im=Image.open(src).convert('RGB')\n  if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\n  im.save(dst,'JPEG',quality=82,optimize=True,progressive=True)`;
  execFileSync('python3', ['-I', '-c', py, JSON.stringify(resize)], { stdio: 'inherit' });
}
writeFileSync(join(OUT, 'index.html'), html);
writeFileSync(join(OUT, 'local.html'), `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>\n<body>\n${html}</body>\n</html>\n`);
writeFileSync(join(OUT, 'files.json'), JSON.stringify(jobs.map(([, dst]) => dst.slice(OUT.length + 1)), null, 1));
console.log(`built ${join(OUT, 'index.html')} (${(html.length / 1024).toFixed(0)} KB) + ${jobs.length} files (${resize.length} resized)`);
