#!/usr/bin/env node
/**
 * Founder review mocks — static, self-contained HTML copies of the live IFTA pages (client · public · founder / staff),
 * captured from the running app at desktop (1440), tablet (834 / 1024 staff) and phone (402) widths. Each file shows the
 * layout for the viewer's width; tabs, View All, quarter tasks, quick actions, the bottom rail and in-page anchors work.
 * Search, notifications, menus and links are inert (a mock has no other pages). Images and fonts are inlined.
 *
 *   npm run ifta:mocks                        → .ifta-mocks/{aio-client-filing-room,aio-public-ifta,aio-founder-staff-mode}.html
 *   node scripts/ifta/build-founder-mocks.mjs --out <dir> [--only client,public,staff]
 *
 * Uses a running dev server at IFTA_MOCK_BASE (default http://127.0.0.1:5173) or starts one. Chromium: IFTA_MOCK_CHROMIUM,
 * else /opt/pw-browsers/chromium when present, else Playwright's default. Each file carries the commit it was built from
 * (`<!-- ifta-mock-sha: … -->`) so a refresh can skip unchanged builds. Published copies: docs/aio/ifta/visual-reconstruction/MOCKS.md.
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
const OUT = resolve(arg('out', join(APP, '.ifta-mocks')));
const ONLY = arg('only', 'client,public,staff').split(',');
const BASE = process.env.IFTA_MOCK_BASE ?? 'http://127.0.0.1:5173';
const CHROMIUM = process.env.IFTA_MOCK_CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SHA = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: APP }).toString().trim();

const MOCKS = {
  client: {
    file: 'aio-client-filing-room.html',
    route: '/portal/workspaces/ifta/2026-Q3',
    title: 'AIO Client Filing Room',
    widths: { desktop: 1440, tablet: 834, phone: 402 },
    staffScale: false,
    dark: false,
    note: 'Static mock of the client filing room (/portal/workspaces/ifta/2026-Q3) with Pioneer Fleet demo data. Tabs, quarter tasks, quick actions, View All and the bottom rail switch sections; search, notifications, the avatar menu and links are not active in the mock.',
  },
  public: {
    file: 'aio-public-ifta.html',
    route: '/services/ifta-filing',
    title: 'AIO Public IFTA Page',
    widths: { desktop: 1440, tablet: 834, phone: 402 },
    staffScale: false,
    dark: true,
    note: 'Static mock of the public IFTA page (/services/ifta-filing) with the labelled sample quarter. Section links and SEE HOW IT WORKS scroll the page; search, RESOURCES, the menu and GET STARTED are not active in the mock.',
  },
  staff: {
    file: 'aio-founder-staff-mode.html',
    route: '/office/workspaces/ifta/client-c/2026-Q3',
    title: 'AIO Founder Staff Mode',
    widths: { desktop: 1440, tablet: 1024, phone: 402 },
    staffScale: true,
    dark: false,
    note: 'Static mock of the founder / staff case (/office/workspaces/ifta/client-c/2026-Q3) with Pioneer Fleet demo data. Tabs and View All switch sections (NOTES holds the client ⇄ AIO mirror, case record, 09 RUN FAQS and audit trail); search, notifications, the avatar menu, EXPORT REPORT and links are not active in the mock.',
  },
};

/** Clickables whose destination tab is recorded from the app (never assumed). */
const PANEL_GO = '[role=tabpanel] :is(button.ifta-viewall, button.ifta-tasks__row, button.ifta-quick__row)';
const PAGE_GO = ':is(button.ifta-cta:not([disabled]), button.ifta-qcard__btn)';

const dataUri = (path) => {
  const mime = path.endsWith('.png') ? 'image/png' : path.endsWith('.woff2') ? 'font/woff2' : 'image/jpeg';
  return `data:${mime};base64,${readFileSync(join(APP, 'public', path)).toString('base64')}`;
};

/** Each <picture> keeps only the image its band shows (a band wrapper only displays in its own width range). */
function pickPicture(pic, band) {
  const sources = [...pic.matchAll(/<source media="([^"]+)" srcset="([^"]+)">/g)].map((m) => ({ media: m[1], src: m[2] }));
  const img = pic.match(/<img [^>]*src="([^"]+)"[^>]*>/);
  if (!img) return pic;
  const find = (bp) => sources.find((s) => s.media.includes(bp))?.src;
  const src = band === 'desktop' ? img[1] : band === 'tablet' ? (find('1199.98') ?? img[1]) : (find('699.98') ?? find('1199.98') ?? img[1]);
  return `${pic.match(/^<picture[^>]*>/)[0]}${img[0].replace(/src="[^"]+"/, `src="${src}"`)}</picture>`;
}

function clean(html, band) {
  html = html.replace(/<picture[^>]*>[\s\S]*?<\/picture>/g, (pic) => pickPicture(pic, band));
  html = html.replace(/src="(\/(?:brand|fonts)\/[^"]+)"/g, (_, p) => `src="${dataUri(p)}"`);
  html = html.replace(/href="\/[^"]*"/g, 'href="#" data-mock-link=""');
  return html.replace(/ loading="lazy"/g, '');
}

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
  // own process group, so stopping it also stops the vite process npx starts
  const child = spawn('npx', ['vite', '--port', port, '--strictPort'], { cwd: APP, env: { ...process.env, AIO_CLOUD_MOBILE_PREVIEW: '1' }, stdio: 'ignore', detached: true });
  for (let i = 0; i < 120; i++) {
    if (await serverUp()) return child;
    await new Promise((r) => setTimeout(r, 1000));
  }
  stopServer(child);
  throw new Error(`Dev server did not start at ${BASE}`);
}

async function capture(browser, cfg) {
  const bands = [];
  for (const [band, width] of Object.entries(cfg.widths)) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await p.evaluate(() => {
      const k = 'aio_debug_store';
      const raw = localStorage.getItem(k);
      if (raw) {
        const s = JSON.parse(raw);
        s.portalClientId = 'client-c';
        localStorage.setItem(k, JSON.stringify(s));
      }
    });
    await p.goto(`${BASE}${cfg.route}`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const settle = () => p.waitForTimeout(100);
    const tabs = await p.locator('[role=tab]').allInnerTexts();
    const openFirst = async () => {
      if (tabs.length) {
        await p.getByRole('tab', { name: tabs[0], exact: true }).click();
        await settle();
      }
    };
    const panels = {};
    const panelGo = [];
    const pageGo = [];
    if (tabs.length) {
      for (const t of tabs) {
        await p.getByRole('tab', { name: t, exact: true }).click();
        await settle();
        panels[t] = clean(await p.locator('[role=tabpanel]').innerHTML(), band);
      }
      await openFirst();
      const nPanel = await p.locator(PANEL_GO).count();
      for (let i = 0; i < nPanel; i++) {
        await openFirst();
        await p.locator(PANEL_GO).nth(i).click();
        await settle();
        const sel = await p.getByRole('tab', { selected: true }).innerText();
        panelGo.push(sel === tabs[0] ? null : sel);
      }
      await openFirst();
      const nPage = await p.locator(PAGE_GO).count();
      for (let i = 0; i < nPage; i++) {
        await openFirst();
        await p.locator(PAGE_GO).nth(i).click();
        await settle();
        const sel = await p.getByRole('tab', { selected: true }).innerText();
        pageGo.push(sel === tabs[0] ? null : sel);
      }
      await openFirst();
    }
    // a serialized <select> loses its live value: write it into the markup
    await p.evaluate(() => document.querySelectorAll('select').forEach((s) => [...s.options].forEach((o) => o.toggleAttribute('selected', o.selected))));
    const shell = clean(await p.evaluate(() => document.querySelector('.ifta-root').outerHTML), band);
    bands.push({ band, shell, tabs, panels, panelGo, pageGo });
    await ctx.close();
  }
  return bands;
}

function render(cfg, bands) {
  let css = readFileSync(join(APP, 'src/ifta/ui/ifta-ui.css'), 'utf8');
  css = css.replace(/html\.ifta-scaled--staff/g, cfg.staffScale ? ':root' : '.mock-unused-staff-scale').replace(/html\.ifta-scaled/g, ':root');
  css = css.replace(/url\('(\/fonts\/ifta\/[^']+)'\)/g, (_, p) => `url('${dataUri(p)}')`);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const body = bands
    .map(({ band, shell, tabs, panels, panelGo, pageGo }) =>
      [
        `<div class="mock-band mock-band--${band}" data-panel-go="${esc(JSON.stringify(panelGo))}" data-page-go="${esc(JSON.stringify(pageGo))}">`,
        shell,
        ...tabs.map((t) => `<template data-tab="${esc(t)}">${panels[t]}</template>`),
        '</div>',
      ].join('\n'),
    )
    .join('\n');
  const tokens = cfg.dark
    ? ':root { color-scheme: dark; --mock-bg: #040405; --mock-ink: #f4f4f4; --mock-muted: #9a9a9e; }'
    : ':root { color-scheme: light; --mock-bg: #f7f7f5; --mock-ink: #141414; --mock-muted: #6b6c72; }';
  return `<title>${cfg.title}</title>
<!-- ifta-mock-sha: ${SHA} -->
<style>
/* Static mock of a live IFTA surface. Visual system = the app's own ifta-ui.css (single look, as approved). */
${tokens}
body { background: var(--mock-bg); color: var(--mock-ink); }
.mock-band { display: none; }
@media (min-width: 1200px) { .mock-band--desktop { display: block; } }
@media (min-width: 700px) and (max-width: 1199.98px) { .mock-band--tablet { display: block; } }
@media (max-width: 699.98px) { .mock-band--phone { display: block; } }
.mock-note { margin: 0; padding: 14px 16px 28px; text-align: center; font: 12px/1.5 Inter, system-ui, sans-serif; color: var(--mock-muted); background: var(--mock-bg); }
${css}
</style>
${body}
<p class="mock-note">${cfg.note} Built from fsbw master ${SHA}.</p>
<script>
(() => {
  const PANEL_GO = ${JSON.stringify(PANEL_GO)};
  const PAGE_GO = ${JSON.stringify(PAGE_GO)};
  const smooth = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const parse = (v) => { try { return JSON.parse(v || '[]'); } catch (e) { return []; } };
  document.querySelectorAll('.mock-band').forEach((band) => {
    const panel = band.querySelector('[role=tabpanel]');
    const tabs = [...band.querySelectorAll('[role=tab]')];
    const tabrow = band.querySelector('.ifta-tabrow');
    const panelGo = parse(band.dataset.panelGo);
    const pageGo = parse(band.dataset.pageGo);
    const first = tabs[0] ? tabs[0].textContent.trim() : null;
    const show = (name, scroll) => {
      const tpl = [...band.querySelectorAll('template')].find((t) => t.dataset.tab === name);
      if (!tpl || !panel) return;
      panel.innerHTML = tpl.innerHTML;
      panel.setAttribute('aria-label', name);
      tabs.forEach((b) => {
        const on = b.textContent.trim() === name;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      wire(name);
      if (scroll && tabrow) tabrow.scrollIntoView({ behavior: smooth(), block: 'start' });
    };
    const wire = (current) => {
      if (current !== first) return;
      band.querySelectorAll(PANEL_GO).forEach((b, i) => { if (panelGo[i]) b.onclick = () => show(panelGo[i], true); });
    };
    tabs.forEach((b) => (b.onclick = () => show(b.textContent.trim(), false)));
    [...band.querySelectorAll(PAGE_GO)].filter((b) => !b.closest('[role=tabpanel]')).forEach((b, i) => {
      if (!pageGo[i]) return;
      b.onclick = () => show(pageGo[i], true);
    });
    if (first) wire(first);
    band.querySelectorAll('a[href^="#"]:not([data-mock-link])').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = id && band.querySelector('[id="' + id + '"]');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: smooth(), block: 'start' });
      });
    });
  });
  document.querySelectorAll('[data-mock-link]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
})();
</script>
`;
}

mkdirSync(OUT, { recursive: true });
const server = await ensureServer();
const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
try {
  for (const key of ONLY) {
    const cfg = MOCKS[key];
    if (!cfg) throw new Error(`Unknown mock "${key}" (client, public, staff)`);
    const html = render(cfg, await capture(browser, cfg));
    writeFileSync(join(OUT, cfg.file), html);
    console.log(`${key}: ${join(OUT, cfg.file)} · ${(html.length / 1024 / 1024).toFixed(2)} MB · ${SHA}`);
  }
} finally {
  await browser.close();
  if (server) stopServer(server);
}
