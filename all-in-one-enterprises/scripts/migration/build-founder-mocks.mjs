#!/usr/bin/env node
/**
 * Founder review mocks — static, self-contained HTML copies of the six representative client-migration screens,
 * captured from the running app. The migration renderer is unit-based (1u = 1px of the 853×1536 authority frame), so one
 * capture serves every width: phones get the authority composition, wider screens the column on a full-bleed environment.
 * Fonts, photography, the founder icon sheet and the app's own stylesheets are inlined. Links and buttons are inert.
 *
 *   npm run migration:mocks                         → .migration-mocks/<screen>.html
 *   node scripts/migration/build-founder-mocks.mjs --out <dir> [--only root,existing,extract,received,company,complete]
 *
 * Uses a running dev server at MIG_MOCK_BASE (default http://127.0.0.1:5173) or starts one. Chromium: MIG_MOCK_CHROMIUM,
 * else /opt/pw-browsers/chromium when present, else Playwright's default. Published copies: docs/migration-recovery/MOCKS.md.
 *
 * Demo state (in the browser profile only): client-b (Heartland Freight Co.), a sample migration batch for EXTRACTING and
 * FILES RECEIVED, three unsupported local files chosen through the real file input, and the client lifecycle each
 * activation screen needs (CLIENT_CONFIRMATION_REQUIRED for COMPANY REVIEW, ACTIVE for the arrival).
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const OUT = resolve(arg('out', join(APP, '.migration-mocks')));
const ONLY = arg('only', 'root,existing,extract,received,company,complete').split(',');
const BASE = process.env.MIG_MOCK_BASE ?? 'http://127.0.0.1:5173';
const CHROMIUM = process.env.MIG_MOCK_CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SHA = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: APP }).toString().trim();
const CLIENT = 'client-b';

const MOCKS = {
  root: { title: 'AIO MIGRATION INTAKE', route: '/office/migration', authority: 'AIO-MIG-ROOT-001', actor: 'Staff intake' },
  existing: { title: 'AIO EXISTING CLIENT FILE', route: `/office/migration/existing?client=${CLIENT}`, authority: 'AIO-MIG-EXISTING-SELECT-001', actor: 'Staff intake' },
  extract: { title: 'AIO EXTRACTING AND CLASSIFYING', route: `/office/migration/extract?client=${CLIENT}`, authority: 'AIO-MIG-EXISTING-EXTRACT-001', actor: 'Staff intake', batch: 'processing' },
  received: { title: 'AIO FILES RECEIVED', route: `/office/migration/received?client=${CLIENT}`, authority: 'AIO-MIG-EXISTING-RECEIVED-001', actor: 'Staff intake', batch: 'received', local: ['Driver_List.xlsx', 'Operating_Agreement.docx', 'Fleet_Photos.zip'] },
  company: { title: 'AIO COMPANY REVIEW', route: '/portal/activation/review#company', authority: 'AIO-MIG-ACTIVATION-COMPANY-001', actor: 'Client, not active yet', lifecycle: 'CLIENT_CONFIRMATION_REQUIRED' },
  complete: { title: 'AIO WELCOME TO YOUR OFFICE', route: '/portal/activation/review#done', authority: 'AIO-MIG-ACTIVATION-COMPLETE-002', actor: 'Client, lifecycle ACTIVE', lifecycle: 'ACTIVE' },
};

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const dataUri = (path) => `data:${MIME[path.slice(path.lastIndexOf('.'))]};base64,${readFileSync(join(APP, 'public', path)).toString('base64')}`;

async function serverUp() {
  try {
    return (await fetch(BASE)).ok;
  } catch {
    return false;
  }
}

function stopServer(child) {
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill();
  }
}

async function ensureServer() {
  if (await serverUp()) return null;
  const port = new URL(BASE).port || '5173';
  const child = spawn('npx', ['vite', '--port', port, '--strictPort'], { cwd: APP, stdio: 'ignore', detached: true });
  for (let i = 0; i < 120; i++) {
    if (await serverUp()) return child;
    await new Promise((r) => setTimeout(r, 1000));
  }
  stopServer(child);
  throw new Error(`Dev server did not start at ${BASE}`);
}

async function capture(browser, cfg) {
  const ctx = await browser.newContext({ viewport: { width: 427, height: 768 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await p.evaluate(({ client, lifecycle, batch }) => {
    const raw = localStorage.getItem('aio_debug_store');
    if (!raw) return;
    const st = JSON.parse(raw);
    st.portalClientId = client;
    const c = (st.clients || []).find((x) => x.id === client);
    if (c) c.clientLifecycle = lifecycle ?? (c.clientLifecycle === 'ACTIVE' ? 'CLIENT_CONFIRMATION_REQUIRED' : c.clientLifecycle || 'CLIENT_CONFIRMATION_REQUIRED');
    st.archiveMigrationBatches = (st.archiveMigrationBatches || []).filter((b) => b.clientId !== client);
    st.archiveMigrationBatchFiles = (st.archiveMigrationBatchFiles || []).filter((f) => f.organizationId !== client);
    if (batch) {
      const t = new Date();
      t.setHours(9, 14, 0, 0);
      const id = `demo-batch-${client}`;
      const files = [
        ['Authority_Letter.pdf', 'application/pdf', 250880],
        ['W9.pdf', 'application/pdf', 104448],
        ['Insurance_Card.pdf', 'application/pdf', 319488],
        ['Carrier_Photo.jpg', 'image/jpeg', 2202009],
        ['IFTA_License.pdf', 'application/pdf', 226304],
      ];
      st.archiveMigrationBatches.unshift({ id, organizationId: client, clientId: client, createdByStaffId: 'staff-2', state: batch === 'processing' ? 'processing' : 'uploading', reviewState: 'pending', approvalState: 'pending', fileCount: files.length, documentCount: 0, createdAt: t.toISOString(), updatedAt: t.toISOString() });
      files.forEach(([name, mime, size], i) =>
        st.archiveMigrationBatchFiles.push({ id: `${id}-f${i}`, batchId: id, organizationId: client, fileName: name, mimeType: mime, fileSizeBytes: size, processingState: batch === 'processing' ? (i < 2 ? 'ready' : 'processing') : name === 'Insurance_Card.pdf' ? 'failed' : 'uploaded', createdAt: t.toISOString() }),
      );
    }
    localStorage.setItem('aio_debug_store', JSON.stringify(st));
  }, { client: CLIENT, lifecycle: cfg.lifecycle ?? null, batch: cfg.batch ?? null });
  await p.goto(`${BASE}${cfg.route}`, { waitUntil: 'networkidle' });
  if (cfg.local) {
    await p.setInputFiles('input.amg-file-input', cfg.local.map((name) => ({ name, mimeType: 'application/octet-stream', buffer: Buffer.alloc(name.endsWith('.zip') ? 5033164 : name.endsWith('.docx') ? 1003520 : 1468006) })));
  }
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const html = await p.evaluate(() => document.querySelector('.amg').outerHTML);
  await ctx.close();
  return html;
}

function render(key, cfg, captured) {
  const sprite = readFileSync(join(APP, 'public/migration/icons/aio-icon-sheet.svg'), 'utf8');
  const used = [...new Set([...captured.matchAll(/aio-icon-sheet\.svg#([a-z0-9-]+)/g)].map((m) => m[1]))];
  const symbols = used.map((id) => sprite.match(new RegExp(`<symbol id="${id}"[^>]*>.*?</symbol>`, 's'))?.[0] ?? '').join('');
  let body = captured
    .replace(/href="\/migration\/icons\/aio-icon-sheet\.svg#/g, 'href="#')
    .replace(/src="(\/migration\/[^"]+)"/g, (_, p) => `src="${dataUri(p)}"`)
    .replace(/<a ([^>]*?)href="\/[^"]*"/g, '<a $1href="#" data-mock-link=""')
    .replace(/ fetchpriority="high"/g, '')
    .replace(/ decoding="async"/g, ''); // inlined plates paint with the page, no pale first frame
  // the demo-store note goes inside the page column, above the staff dock
  const note = `<p class="mock-note">Static copy of ${cfg.route.split(/[?#]/)[0]}${cfg.route.includes('#') ? '#' + cfg.route.split('#')[1] : ''} · ${cfg.actor} · authority ${cfg.authority} · demo data (Heartland Freight Co.) · links and buttons are inactive · fsbw ${SHA}</p>`;
  body = body.replace(/<\/main>/, `${note}</main>`);
  let css = readFileSync(join(APP, 'src/client-migration/visual/aio-migration.css'), 'utf8');
  css = css.replace(/url\('(\/fonts\/migration\/[^']+)'\)/g, (_, p) => `url('${dataUri(p)}')`);
  const upper = readFileSync(join(APP, 'src/styles/aio-uppercase.css'), 'utf8');
  return `<title>${cfg.title}</title>
<!-- migration-mock: ${key} · fsbw ${SHA} -->
<style>
/* Static copy of a live AIO client-migration screen. Design system = the app's own aio-migration.css (single committed
   look, as approved against the authority); founder rule: all text uppercase (aio-uppercase.css). */
${css}
${upper}
.mock-note { margin: calc(24 * var(--u)) calc(22 * var(--u)) 0; font: 500 calc(13 * var(--u)) / 1.5 var(--text); letter-spacing: 0.06em; color: #6b6b70; text-align: center; }
.amg--active .mock-note { margin-top: calc(18 * var(--u)); color: #f4efe6; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45); }
</style>
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${symbols}</svg>
${body}
<script>
document.querySelectorAll('[data-mock-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
document.querySelectorAll('form').forEach((f) => f.addEventListener('submit', (e) => e.preventDefault()));
</script>
`;
}

mkdirSync(OUT, { recursive: true });
const server = await ensureServer();
const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
try {
  for (const key of ONLY) {
    const cfg = MOCKS[key];
    if (!cfg) throw new Error(`Unknown mock "${key}" (${Object.keys(MOCKS).join(', ')})`);
    const html = render(key, cfg, await capture(browser, cfg));
    const file = join(OUT, `aio-migration-${key}.html`);
    writeFileSync(file, html);
    console.log(`${key}: ${file} · ${(html.length / 1024 / 1024).toFixed(2)} MB · ${SHA}`);
  }
} finally {
  await browser.close();
  if (server) stopServer(server);
}
