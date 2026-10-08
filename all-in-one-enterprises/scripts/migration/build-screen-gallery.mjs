#!/usr/bin/env node
/**
 * AIO client migration — screen review gallery. Captures every migration screen from the running app (the six
 * representatives and the 35 propagated authority screens) with a demo state per screen, and packs them into one
 * self-contained page: each screen renders live in a phone / tablet / desktop frame next to its authority image.
 *
 *   npm run migration:gallery            → .migration-mocks/aio-migration-gallery.html
 *
 * Uses a running dev server at MIG_MOCK_BASE (default http://127.0.0.1:5173) or starts one. Chromium: MIG_MOCK_CHROMIUM,
 * else /opt/pw-browsers/chromium when present. Demo state lives only in the capture's browser profile (Heartland Freight Co.,
 * River Bend Logistics LLC as a new client file, four batch clients). Published copy: docs/migration-recovery/MOCKS.md.
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const AUTH_DIR = resolve(APP, '../AIO_CLIENT_MIGRATION_AUTHORITY');
const OUT = resolve(process.env.MIG_GALLERY_OUT ?? join(APP, '.migration-mocks', 'aio-migration-gallery.html'));
const BASE = process.env.MIG_MOCK_BASE ?? 'http://127.0.0.1:5173';
const CHROMIUM = process.env.MIG_MOCK_CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SHA = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: APP }).toString().trim();
const C = 'client-b';
const NEW = 'mig-demo-new';

/** [key, branch, screen name, authority id, route, actor, demo scenario, extra] — in flow order per branch. */
const S = (key, branch, name, authority, route, actor, seed, extra = {}) => ({ key, branch, name, authority, route, actor, seed, ...extra });
const SCREENS = [
  S('root', 'existing', 'Bring your data to AIO', 'AIO-MIG-ROOT-001', '/office/migration', 'staff', 'none', { rep: true }),
  S('existing', 'existing', 'Existing client file', 'AIO-MIG-EXISTING-SELECT-001', `/office/migration/existing?client=${C}`, 'staff', 'existing-known', { rep: true }),
  S('upload', 'existing', 'Upload client file', 'AIO-MIG-EXISTING-UPLOAD-001', `/office/migration/upload?client=${C}`, 'staff', 'existing-known', { local: ['Heartland_Client_File.pdf', 'Insurance_Certificate.png'] }),
  S('received', 'existing', 'Files received', 'AIO-MIG-EXISTING-RECEIVED-001', `/office/migration/received?client=${C}`, 'staff', 'existing-received', { rep: true, local: ['Driver_List.xlsx', 'Operating_Agreement.docx', 'Fleet_Photos.zip'] }),
  S('extract', 'existing', 'Extracting and classifying', 'AIO-MIG-EXISTING-EXTRACT-001', `/office/migration/extract?client=${C}`, 'staff', 'existing-processing', { rep: true }),
  S('match', 'existing', 'Match and conflict review', 'AIO-MIG-EXISTING-MATCH-001', `/office/migration/match?client=${C}`, 'staff', 'existing-facts'),
  S('review', 'existing', 'Founder review', 'AIO-MIG-EXISTING-REVIEW-001', `/office/migration/review?client=${C}`, 'staff', 'existing-facts'),
  S('conflicts', 'existing', 'Items needing review', 'AIO-MIG-EXISTING-CONFLICTS-001', `/office/migration/conflicts?client=${C}`, 'staff', 'existing-facts2'),
  S('approval', 'existing', 'Approval summary', 'AIO-MIG-EXISTING-APPROVAL-001', `/office/migration/approval?client=${C}`, 'staff', 'existing-approval'),
  S('prebuilt', 'existing', 'Prebuilt · not active yet', 'AIO-MIG-EXISTING-PREBUILT-001', `/office/migration/prebuilt?client=${C}`, 'staff', 'existing-prebuilt'),
  S('invite', 'existing', 'Send activation invite', 'AIO-MIG-EXISTING-INVITE-001', `/office/migration/invite?client=${C}`, 'staff', 'existing-prebuilt'),
  S('invited', 'existing', 'Invite sent', 'AIO-MIG-EXISTING-INVITED-001', `/office/migration/invited?client=${C}`, 'staff', 'existing-invited'),
  S('welcome', 'activation', 'Here’s what AIO already knows', 'AIO-MIG-ACTIVATION-WELCOME-001', '/portal/activation/review#welcome', 'client', 'client-review'),
  S('company', 'activation', 'Company review', 'AIO-MIG-ACTIVATION-COMPANY-001', '/portal/activation/review#company', 'client', 'client-review', { rep: true }),
  S('people', 'activation', 'People review', 'AIO-MIG-ACTIVATION-PEOPLE-001', '/portal/activation/review#people', 'client', 'client-review'),
  S('vehicles', 'activation', 'Vehicles review', 'AIO-MIG-ACTIVATION-VEHICLES-001', '/portal/activation/review#vehicles', 'client', 'client-review'),
  S('services', 'activation', 'Active services', 'AIO-MIG-ACTIVATION-SERVICES-001', '/portal/activation/review#services', 'client', 'client-review'),
  S('documents', 'activation', 'Documents we have', 'AIO-MIG-ACTIVATION-DOCUMENTS-001', '/portal/activation/review#documents', 'client', 'client-review'),
  S('changed', 'activation', 'What changed?', 'AIO-MIG-ACTIVATION-CHANGED-001', '/portal/activation/review#changed', 'client', 'client-review'),
  S('confirm', 'activation', 'Confirm your information', 'AIO-MIG-ACTIVATION-CONFIRM-001', '/portal/activation/review#confirm', 'client', 'client-review'),
  S('complete', 'activation', 'Welcome to your office', 'AIO-MIG-ACTIVATION-COMPLETE-002', '/portal/activation/review#done', 'client', 'client-active', { rep: true }),
  S('new', 'new', 'New client file', 'AIO-MIG-NEW-FILE-001', '/office/migration/new', 'staff', 'none'),
  S('new-received', 'new', 'Files received', 'AIO-MIG-NEW-RECEIVED-001', `/office/migration/new-received?client=${NEW}`, 'staff', 'new-files', { local: ['ScannedDocs.tiff', 'Notes.txt'] }),
  S('new-extract', 'new', 'Extraction and classification', 'AIO-MIG-NEW-EXTRACT-001', `/office/migration/new-extract?client=${NEW}`, 'staff', 'new-processing'),
  S('new-identity', 'new', 'Business identity review', 'AIO-MIG-NEW-IDENTITY-001', `/office/migration/new-identity?client=${NEW}`, 'staff', 'new-files'),
  S('new-records', 'new', 'People, vehicles, services, documents', 'AIO-MIG-NEW-RECORDS-001', `/office/migration/new-records?client=${NEW}`, 'staff', 'new-files'),
  S('new-review', 'new', 'Founder review', 'AIO-MIG-NEW-REVIEW-001', `/office/migration/new-review?client=${NEW}`, 'staff', 'new-files'),
  S('new-approval', 'new', 'Approval summary', 'AIO-MIG-NEW-APPROVAL-001', `/office/migration/new-approval?client=${NEW}`, 'staff', 'new-reviewed'),
  S('new-prebuilt', 'new', 'Prebuilt · not active yet', 'AIO-MIG-NEW-PREBUILT-001', `/office/migration/new-prebuilt?client=${NEW}`, 'staff', 'new-prebuilt'),
  S('new-invite', 'new', 'Send invite', 'AIO-MIG-NEW-INVITE-001', `/office/migration/new-invite?client=${NEW}`, 'staff', 'new-prebuilt'),
  S('new-confirm', 'new', 'Client confirmation required', 'AIO-MIG-NEW-CONFIRM-001', `/office/migration/new-confirm?client=${NEW}`, 'staff', 'new-invited'),
  S('batch', 'batch', 'Bulk batch migration', 'AIO-MIG-BULK-001', '/office/migration/batch', 'staff', 'none'),
  S('batch-received', 'batch', 'Batch files received', 'AIO-MIG-BATCH-RECEIVED-001', '/office/migration/batch-received', 'staff', 'batch'),
  S('batch-processing', 'batch', 'Processing and client detection', 'AIO-MIG-BATCH-PROCESSING-001', '/office/migration/batch-processing', 'staff', 'batch-processing'),
  S('batch-summary', 'batch', 'Detection summary', 'AIO-MIG-BATCH-SUMMARY-001', '/office/migration/batch-summary', 'staff', 'batch'),
  S('batch-conflicts', 'batch', 'Duplicates and conflicts', 'AIO-MIG-BATCH-CONFLICTS-001', '/office/migration/batch-conflicts', 'staff', 'batch'),
  S('batch-queue', 'batch', 'Per-client review queue', 'AIO-MIG-BATCH-QUEUE-001', '/office/migration/batch-queue', 'staff', 'batch'),
  S('batch-client', 'batch', 'Client review detail', 'AIO-MIG-BATCH-CLIENT-001', '/office/migration/batch-client?client=client-a', 'staff', 'batch'),
  S('batch-approval', 'batch', 'Approval summary', 'AIO-MIG-BATCH-APPROVAL-001', '/office/migration/batch-approval', 'staff', 'batch'),
  S('batch-run', 'batch', 'Processing approved clients', 'AIO-MIG-BATCH-RUN-001', '/office/migration/batch-run', 'staff', 'batch'),
  S('batch-complete', 'batch', 'Batch complete', 'AIO-MIG-BATCH-COMPLETE-001', '/office/migration/batch-complete', 'staff', 'batch-done'),
];

const AUTH_FILE = (id) => {
  const dir = id.startsWith('AIO-MIG-ROOT') ? '00_ROOT' : id.startsWith('AIO-MIG-EXISTING') ? '01_EXISTING_CLIENT' : id.startsWith('AIO-MIG-ACTIVATION') ? '02_ACTIVATION' : id.startsWith('AIO-MIG-NEW') ? '03_NEW_CLIENT' : '04_BULK_BATCH';
  return join(AUTH_DIR, dir, `${id}.png`);
};

/** Runs in the page: the demo state for one scenario (browser profile only). */
function SEED(scenario) {
  const k = 'aio_debug_store';
  const st = JSON.parse(localStorage.getItem(k));
  const C = 'client-b';
  const NEW = 'mig-demo-new';
  const t0 = new Date();
  t0.setHours(9, 14, 0, 0);
  const iso = (d = 0) => new Date(t0.getTime() - d * 86400000).toISOString();
  st.archiveMigrationBatches = [];
  st.archiveMigrationBatchFiles = [];
  st.clientExtractedFacts = [];
  st.clientReviewSections = [];
  st.clientReportedChanges = [];
  st.clientLifecycleEvents = st.clientLifecycleEvents || [];
  const client = (id) => st.clients.find((c) => c.id === id);
  const batch = (org, files, state = 'ready_for_review', notes) => {
    const id = `demo-batch-${org}`;
    st.archiveMigrationBatches.push({ id, organizationId: org, clientId: org, createdByStaffId: 'staff-2', state, reviewState: 'pending', approvalState: 'pending', fileCount: files.length, documentCount: files.length, notes, createdAt: iso(1), updatedAt: iso(0) });
    files.forEach(([name, mime, size, ps = 'ready'], i) => st.archiveMigrationBatchFiles.push({ id: `${id}-f${i}`, batchId: id, organizationId: org, fileName: name, mimeType: mime, fileSizeBytes: size, processingState: ps, createdAt: iso(1) }));
    return id;
  };
  const fact = (batchId, org, entityType, fieldKey, proposedValue, existingValue, confidence, documentId) =>
    st.clientExtractedFacts.push({ id: `fact-${org}-${fieldKey}`, batchId, organizationId: org, entityType, fieldKey, proposedValue, existingValue, confidence, documentId, sourceReference: `${batchId}/${fieldKey}.pdf#p1`, createdAt: iso(0) });
  const doc = (id, org, title, fileName, documentType) => {
    if (!st.documents.some((d) => d.id === id)) st.documents.push({ id, organizationId: org, category: 'legacy', documentType, title, fileName, status: 'under_review', verificationStatus: 'pending_review', visibility: 'internal', isCurrent: true, source: 'legacy_scan', createdAt: iso(1), updatedAt: iso(1), uploadedAt: iso(1) });
  };
  const files5 = [
    ['Authority_Letter.pdf', 'application/pdf', 250880],
    ['W9.pdf', 'application/pdf', 104448],
    ['Insurance_Card.pdf', 'application/pdf', 319488],
    ['Carrier_Photo.jpg', 'image/jpeg', 2202009],
    ['IFTA_License.pdf', 'application/pdf', 226304],
  ];
  const b = client(C);
  b.contactPhone = b.contactPhone || '(614) 555-0187';
  st.portalClientId = C;
  b.clientReviewState = 'REQUIRED';
  if (scenario === 'existing-processing' || scenario === 'existing-received') {
    b.clientLifecycle = 'MIGRATION_IN_PROGRESS';
    const proc = scenario === 'existing-processing';
    batch(C, files5.map(([n, m, z], i) => [n, m, z, proc ? (i < 2 ? 'ready' : 'processing') : n === 'Insurance_Card.pdf' ? 'failed' : 'uploaded']), proc ? 'processing' : 'uploading');
  } else if (scenario.startsWith('existing')) {
    b.clientLifecycle = scenario === 'existing-known' ? 'KNOWN_UNMIGRATED' : 'MIGRATION_IN_PROGRESS';
    if (scenario !== 'existing-known') {
      const bid = batch(C, files5);
      doc('demo-doc-w9', C, 'W-9', 'W9.pdf', 'Tax Form');
      doc('demo-doc-auth', C, 'Authority Letter', 'Authority_Letter.pdf', 'USDOT Registration');
      fact(bid, C, 'company', 'legal_name', 'Heartland Freight Co.', 'Heartland Freight Co.', 'HIGH', 'demo-doc-auth');
      fact(bid, C, 'vehicle', 'unit_number', 'Truck 204', 'Truck 204', 'MEDIUM', 'demo-doc-auth');
      fact(bid, C, 'document', 'insurance_carrier', 'Progressive', '', 'HIGH', 'demo-doc-auth');
      if (scenario === 'existing-facts' || scenario === 'existing-facts2') fact(bid, C, 'company', 'company_phone', '(614) 555-0187', '(614) 555-0176', 'CONFLICT', 'demo-doc-auth');
      if (scenario === 'existing-facts2') fact(bid, C, 'person', 'primary_contact_email', 'operations@heartland.example', 'diana.demo@heartland.example', 'CONFLICT', 'demo-doc-w9');
    }
    if (scenario === 'existing-approval') b.clientLifecycle = 'MIGRATION_REVIEW_REQUIRED';
    if (scenario === 'existing-prebuilt' || scenario === 'existing-invited') {
      b.clientLifecycle = scenario === 'existing-invited' ? 'INVITED' : 'PREBUILT';
      b.activationConditions = { ...(b.activationConditions || {}), officeProvisioningSucceeded: true };
    }
  }
  if (scenario === 'client-review') b.clientLifecycle = 'CLIENT_CONFIRMATION_REQUIRED';
  if (scenario === 'client-active') b.clientLifecycle = 'ACTIVE';
  if (scenario.startsWith('new')) {
    st.clients = st.clients.filter((c) => c.id !== NEW);
    st.roadReadyProfiles = (st.roadReadyProfiles || []).filter((p) => p.organizationId !== NEW);
    const lc = { 'new-prebuilt': 'PREBUILT', 'new-invited': 'INVITED' }[scenario] || 'INTAKE_IN_PROGRESS';
    st.clients.unshift({ id: NEW, companyName: 'River Bend Logistics LLC', contactName: 'Sam Ortiz', contactEmail: 'pending@example.com', clientType: 'carrier', primaryState: '', accountStatus: 'pending', clientLifecycle: lc, clientReviewState: 'NOT_STARTED', roadmapProgress: 0, customerSince: iso(2).slice(0, 10), services: [], activeRequestCount: 0, documentsNeededCount: 0, lastActivityAt: iso(0), activationConditions: { canonicalIdentityExists: true, officeProvisioningSucceeded: lc !== 'INTAKE_IN_PROGRESS' } });
    st.roadReadyProfiles.push({ organizationId: NEW, mode: 'onboarding', onboardingStep: 0, onboardingComplete: false, ruleVersion: 'v1', business: { legalName: 'River Bend Logistics LLC' }, operating: {}, authority: { usdot: 'yes', usdotNumber: '4102877', mc: 'yes', mcNumber: '1588201' }, registration: {}, taxFuel: {}, insurance: {}, permits: {}, createdAt: iso(2), updatedAt: iso(0) });
    const files = [
      ['January_2024.pdf', 'application/pdf', 2516582, scenario === 'new-processing' ? 'ready' : 'ready'],
      ['Q1_Expenses.jpg', 'image/jpeg', 1153434, scenario === 'new-processing' ? 'processing' : 'ready'],
      ['Receipts.png', 'image/png', 3774873, scenario === 'new-processing' ? 'uploaded' : 'ready'],
    ];
    const bid = batch(NEW, files, scenario === 'new-processing' ? 'processing' : 'ready_for_review');
    fact(bid, NEW, 'company', 'legal_name', 'River Bend Logistics LLC', '', 'MEDIUM');
    if (scenario !== 'new-files' && scenario !== 'new-processing') st.clientExtractedFacts.forEach((f) => (f.reviewAction = 'CONFIRM'));
    if (lc !== 'INTAKE_IN_PROGRESS') {
      st.clientLifecycleEvents.push({ id: 'demo-ev-pb', organizationId: NEW, fromState: 'MIGRATION_REVIEW_REQUIRED', toState: 'PREBUILT', eventType: 'MIGRATION_APPROVED', actorType: 'STAFF', actorId: 'staff-2', createdAt: iso(0) });
      files.forEach(([name], i) => { if (!st.documents.some((d) => d.id === `demo-nd-${i}`)) st.documents.push({ id: `demo-nd-${i}`, organizationId: NEW, category: 'legacy', documentType: 'Legacy Scan', title: name.replace(/\..*$/, ''), fileName: name, status: 'under_review', verificationStatus: 'pending_review', visibility: 'internal', isCurrent: true, source: 'legacy_scan', createdAt: iso(0), updatedAt: iso(0), uploadedAt: iso(0) }); });
    }
  }
  if (scenario.startsWith('batch')) {
    const mk = (id, name, lc, extra = {}) => {
      st.clients = st.clients.filter((c) => c.id !== id);
      st.clients.push({ id, companyName: name, contactName: 'Primary contact', contactEmail: 'pending@example.com', clientType: 'carrier', primaryState: '', accountStatus: 'pending', clientLifecycle: lc, roadmapProgress: 0, customerSince: iso(5).slice(0, 10), services: [], activeRequestCount: 0, documentsNeededCount: 0, lastActivityAt: iso(1), ...extra });
    };
    client('client-a').clientLifecycle = 'MIGRATION_IN_PROGRESS';
    client('shipper-demo-b').clientLifecycle = 'MIGRATION_REVIEW_REQUIRED';
    mk('mig-demo-canyon', 'Canyon Freight Co.', 'KNOWN_UNMIGRATED');
    mk('mig-demo-lakeside', 'Lakeside Carriers Inc.', 'MIGRATION_IN_PROGRESS', { customerNumber: 'AIO-20417' });
    const ps = scenario === 'batch-processing' ? 'processing' : 'ready';
    const bA = batch('client-a', files5.slice(0, 4).map((f) => [...f, ps]), scenario === 'batch-processing' ? 'processing' : 'ready_for_review', 'Q1 2025 Clients');
    batch('shipper-demo-b', files5.slice(0, 3).map((f) => [...f, ps]), 'ready_for_review', 'Q1 2025 Clients');
    batch('mig-demo-canyon', files5.slice(1, 3).map((f) => [...f, 'ready']), 'ready_for_review', 'Q1 2025 Clients');
    batch('mig-demo-lakeside', files5.map((f, i) => [...f, i === 4 ? 'failed' : 'ready']), 'ready_for_review', 'Q1 2025 Clients');
    fact(bA, 'client-a', 'company', 'legal_name', 'Summit Ridge Hauling, LLC', 'Summit Ridge Hauling LLC', 'CONFLICT');
    if (scenario === 'batch-done') {
      client('client-a').clientLifecycle = 'PREBUILT';
      st.clientExtractedFacts.forEach((f) => (f.reviewAction = 'MATCH_TO_EXISTING'));
    }
  }
  localStorage.setItem(k, JSON.stringify(st));
}


const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const dataUri = (file) => `data:${MIME[file.slice(file.lastIndexOf('.'))]};base64,${readFileSync(file).toString('base64')}`;

async function serverUp() {
  try {
    return (await fetch(BASE)).ok;
  } catch {
    return false;
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
  process.kill(-child.pid, 'SIGTERM');
  throw new Error(`Dev server did not start at ${BASE}`);
}

async function capture(browser, s) {
  const ctx = await browser.newContext({ viewport: { width: 427, height: 768 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await p.evaluate(SEED, s.seed);
  await p.goto(`${BASE}${s.route}`, { waitUntil: 'networkidle' });
  if (s.local) {
    await p.setInputFiles('input.amg-file-input', s.local.map((name) => ({ name, mimeType: name.endsWith('.pdf') ? 'application/pdf' : name.endsWith('.png') ? 'image/png' : 'application/octet-stream', buffer: Buffer.alloc(name.endsWith('.pdf') ? 4404019 : 1887436) })));
  }
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(350);
  const html = await p.evaluate(() => document.querySelector('.amg').outerHTML);
  await ctx.close();
  return html
    .replace(/<a ([^>]*?)href="[^"]*"/g, '<a $1href="#"')
    .replace(/ fetchpriority="high"/g, '')
    .replace(/ decoding="async"/g, '');
}

/** Authority PNG → 427-wide JPEG data URI (drawn in the browser, no image library needed). */
async function authorityJpeg(page, file) {
  const src = `data:image/png;base64,${readFileSync(file).toString('base64')}`;
  return page.evaluate(async (s) => {
    const img = new Image();
    img.src = s;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 427;
    c.height = Math.round((427 * img.height) / img.width);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.74);
  }, src);
}

const server = await ensureServer();
const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
const shots = [];
try {
  const tool = await browser.newPage();
  for (const s of SCREENS) {
    const html = await capture(browser, s);
    const auth = await authorityJpeg(tool, AUTH_FILE(s.authority));
    shots.push({ ...s, html, auth });
    console.log(`${s.key.padEnd(18)} ${(html.length / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
  if (server) process.kill(-server.pid, 'SIGTERM');
}

const assets = {};
for (const s of shots) for (const m of s.html.matchAll(/src="(\/migration\/[^"]+)"/g)) assets[m[1]] ??= dataUri(join(APP, 'public', m[1]));
const sprite = readFileSync(join(APP, 'public/migration/icons/aio-icon-sheet.svg'), 'utf8');
const used = new Set(shots.flatMap((s) => [...s.html.matchAll(/aio-icon-sheet\.svg#([a-z0-9-]+)/g)].map((m) => m[1])));
const symbols = [...used].map((id) => sprite.match(new RegExp(`<symbol id="${id}"[^>]*>.*?</symbol>`, 's'))?.[0] ?? '').join('');
const fontCss = (css) => css.replace(/url\('(\/fonts\/migration\/[^']+)'\)/g, (_, f) => `url('${dataUri(join(APP, 'public', f))}')`);
const css = [
  fontCss(readFileSync(join(APP, 'src/client-migration/visual/aio-migration.css'), 'utf8')),
  readFileSync(join(APP, 'src/client-migration/visual/aio-migration-flow.css'), 'utf8'),
  readFileSync(join(APP, 'src/styles/aio-uppercase.css'), 'utf8'),
  'a, button, input, label { pointer-events: none; }',
].join('\n');
const fonts = fontCss(readFileSync(join(APP, 'src/client-migration/visual/aio-migration.css'), 'utf8').match(/@font-face[\s\S]*?\}\s*@font-face[\s\S]*?\}/)[0]);

const data = {
  sha: SHA,
  built: new Date().toISOString().slice(0, 10),
  css,
  sprite: `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${symbols.replace(/\s+id="/g, ' id="').replaceAll('aio-icon-sheet.svg#', '#')}</svg>`,
  assets,
  screens: shots.map(({ key, branch, name, authority, route, actor, rep, html, auth }) => ({
    key,
    branch,
    name,
    authority,
    route: route.replace(/\?client=[^#]*/, ''),
    actor,
    rep: Boolean(rep),
    html: html.replace(/href="\/migration\/icons\/aio-icon-sheet\.svg#/g, 'href="#'),
    auth,
  })),
};
const template = readFileSync(join(APP, 'scripts/migration/gallery-template.html'), 'utf8');
const page = template.replace('/*__DATA__*/null', () => JSON.stringify(data).replace(/</g, '\\u003c')).replaceAll('__SHA__', SHA).replace('/*__FONTS__*/', () => fonts);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, page);
console.log(`gallery: ${OUT} · ${(page.length / 1024 / 1024).toFixed(2)} MB · ${shots.length} screens · ${SHA}`);
