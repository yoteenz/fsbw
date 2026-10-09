/**
 * Builds the AIO PUBLIC WEBSITE design review: a static folder with
 *   site.html   the public site on its own (fills the window; real responsive behaviour)
 *   index.html  the founder review (the same site inside device frames, the page tree, the reference beside it)
 * The words and services are bundled from the live sources at build time (esbuild): the canonical service catalog, the
 * discovery categories and need options, the two activation matrices (public CTA and PAUSED state), divisionMeta, the
 * homepage pathways and roadmap stages, the Start Your Business journey, bookkeeping plan features, the FleetCare and
 * DriverLink disclosures, and the live per-service detail (src/data/services.ts — audience, requirements, process, documents,
 * FAQ; src/services/mobileServicePageConfig.ts — the operating-authority process and FAQ). Prices are dropped before anything
 * reaches the page: none are approved.
 *
 *   node design-authority/aio-public/build.mjs <outDir>
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../..');
const OUT = resolve(process.argv[2] || join(APP, '..', 'AIO_PUBLIC_WEBSITE_REVIEW/site'));
mkdirSync(OUT, { recursive: true });
const { build } = await import(join(APP, 'node_modules/esbuild/lib/main.js'));

/* ── 1 · the live sources, bundled ── */
const bundle = await build({
  stdin: {
    contents: `
      export { CANONICAL_SERVICE_CATALOG, SERVICE_NEED_OPTIONS, COMPLIANCE_DISCLAIMER, fulfillmentDisclosure } from './src/services/catalog/serviceCatalog';
      export { SERVICE_DISCOVERY_CATEGORIES } from './src/services/catalog/serviceDiscoveryCategories';
      export { getServiceLaunchEntry, getPublicServiceCta } from './src/launch/serviceActivationLaunch';
      export { SERVICE_ACTIVATION_MATRIX } from './src/infrastructure/serviceActivation';
      export { divisionMeta, aioServices } from './src/data/services';
      export { mobileServiceProcessBySlug, mobileServiceFaqBySlug } from './src/services/mobileServicePageConfig';
      export { intakeSections, getVisibleSections } from './src/intake/intakeConfig';
      export { homepagePathways, homepageRoadmapStages, homepageHeroSupportingCopy } from './src/data/homepageMobileContent';
      export { startBusinessJourneyDef } from './src/journeys/startBusinessJourneyConfig';
      export { BOOKKEEPING_PLANS, BOOKKEEPING_TRUCKING_CATEGORIES } from './src/bookkeeping/bookkeepingPlans';
      export { FLEETCARE_LEGAL_DISCLOSURES, FLEETCARE_PRICING_CONFIG } from './src/fleetcare/fleetcareConfig';
      export { DRIVERLINK_LEGAL_DISCLOSURES } from './src/driverlink/driverlinkConfig';
    `,
    resolveDir: APP,
    loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'error', loader: { '.png': 'text', '.svg': 'text' },
});
const M = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const en = (f) => JSON.parse(readFileSync(join(APP, 'src/locales/en', f), 'utf8'));
const dl = en('driverLink.json');
const brokeragePaused = M.SERVICE_ACTIVATION_MATRIX.find((x) => x.id === 'brokerage')?.activationState === 'PAUSED';

/** The public status word for a service: the launch matrix when it has an entry, else the catalog; Brokerage PAUSED. */
function stateOf(s) {
  if (s.legacyDivision === 'brokerage' && brokeragePaused) return 'PAUSED';
  const L = M.getServiceLaunchEntry(s.slug);
  if (L) return { GO: 'AVAILABLE', LIMITED_PILOT: s.fulfillmentType === 'PARTNER_PROVIDED' ? 'PARTNER' : 'PILOT', HOLD: 'HOLD', BLOCKED: 'BLOCKED', INTERNAL_ONLY: 'STAFF', COMING_SOON: 'SOON' }[L.activationState] || 'PREPARING';
  if (s.fulfillmentType === 'PARTNER_PROVIDED' && s.activationStatus !== 'COMING_SOON') return 'PARTNER';
  return { ACTIVE: 'AVAILABLE', LIMITED_PILOT: 'PILOT', PREPARING: 'PREPARING', COMING_SOON: 'SOON' }[s.activationStatus] || 'PREPARING';
}
/** Unapproved prices live inside some catalog sentences ("Starting at $249/month — …"); they are cut, never shown. */
const noPrice = (t) => (t == null ? t : String(t).replace(/\s*starting at \$[\d,.]+(\/(month|mo|year))?\s*[—;,-]*\s*/gi, ' ').replace(/\s+—\s*$/, '').replace(/^\s*—\s*/, '').replace(/\s{2,}/g, ' ').trim().replace(/^./, (c) => c.toUpperCase()));
/** The live service page's detail (src/data/services.ts, the mobile service config): recovered, never rewritten. A line that
 *  carries a price is left out (prices are not approved), never edited. */
const priced = (t) => /\$\s?\d/.test(String(t ?? ''));
function detailOf(slug) {
  const L = M.aioServices.find((x) => x.slug === slug);
  const steps = M.mobileServiceProcessBySlug[slug];
  const faq = [...(M.mobileServiceFaqBySlug[slug] ?? L?.faq ?? [])].filter((f) => !priced(f.question) && !priced(f.answer));
  return {
    audience: L && !priced(L.audience) ? L.audience : null,
    requirements: (L?.requirements ?? []).filter((x) => !priced(x)),
    documents: (L?.documents ?? []).filter((x) => !priced(x)),
    process: steps ? steps.map((x) => [x.title, x.description]) : (L?.process ?? []).filter((x) => !priced(x)).map((x) => [x, '']),
    faq: faq.map((f) => [f.question, f.answer]),
    detailSource: L ? (steps ? 'src/data/services.ts + src/services/mobileServicePageConfig.ts' : 'src/data/services.ts') : null,
  };
}
const services = M.CANONICAL_SERVICE_CATALOG.filter((s) => s.customerPortalVisible !== false).map((s) => {
  const state = stateOf(s);
  const cta = M.getPublicServiceCta(s.slug);
  const allowed = state === 'PAUSED' ? false : ['AVAILABLE', 'PILOT', 'PARTNER'].includes(state) && cta.allowed;
  return {
    slug: s.slug, name: s.name, shortDescription: noPrice(s.shortDescription), description: noPrice(s.description), category: s.category, division: s.legacyDivision ?? null,
    fulfillmentType: s.fulfillmentType ?? 'AIO_DIRECT', pricingModel: s.pricingModel, jurisdictionDependent: !!s.jurisdictionDependent, documentsRequired: !!s.documentsRequired,
    renewalInterval: s.renewalInterval ?? null, roadReadyApplicable: !!s.roadReadyApplicable, icon: s.icon, relatedSlugs: s.relatedSlugs ?? [],
    state, ctaAllowed: allowed, ctaLabel: allowed ? (cta.label && cta.label !== 'Get Started' ? cta.label : s.cta || 'Get Started') : state === 'PAUSED' ? 'BUSINESS ACTIVATION REQUIRED' : 'REQUEST INFORMATION',
    disclosure: M.fulfillmentDisclosure(s) ?? null,
    ...detailOf(s.slug),
    needsFor: M.SERVICE_NEED_OPTIONS.filter((n) => n.id !== 'not-sure' && n.recommendedSlugs.includes(s.slug)).map((n) => n.label),
  };
});
const has = (slug) => services.some((s) => s.slug === slug);
/** The live Smart Intake (src/intake/intakeConfig.ts): its sections, questions and options as built — the design draws these,
 *  it does not invent a shorter form. Which sections a goal shows comes from the live getVisibleSections(). */
function intakeOf() {
  const ix = JSON.parse(readFileSync(join(APP, 'src/locales/en/intake.json'), 'utf8'));
  const RAIL = { goal: 'goal', journey: 'status', business: 'business', operating: 'operating', assets: 'assets', pain_points: 'painPoints', factoring_branch: 'factoring', insurance_branch: 'insurance', shipper: 'shipper', contact: 'contact' };
  const sections = M.intakeSections.map((sec) => ({
    id: sec.id, title: sec.title, description: String(sec.description || '').replace(/\s*\(Demo — no sensitive data\.\)/, ''),
    rail: ix.journey[RAIL[sec.id]] ? [ix.journey[RAIL[sec.id]].label, ix.journey[RAIL[sec.id]].subtitle] : [sec.title, ''],
    questions: sec.questions.map((q) => ({ id: q.id, question: q.question, type: q.type, required: !!q.required, description: q.description || '', states: (q.options || []).length > 40, options: (q.options || []).length > 40 ? [] : (q.options || []).map((o) => [o.value, o.label, o.description || '']) })),
  }));
  const goals = M.intakeSections.find((x) => x.id === 'goal').questions[0].options.map((o) => o.value);
  const flows = Object.fromEntries(goals.map((g) => [g, M.getVisibleSections({ goal: g }).map((x) => x.id)]));
  return { sections, flows, shell: ix.shell };
}
const ALIAS = { 'irp-registration': 'irp-apportioned-registration', 'ifta-setup': 'ifta-fuel-tax-assistance', 'vehicle-registration': 'tag-services', 'boc-3-filing': 'boc-3-assistance' };
const data = {
  services,
  categories: M.SERVICE_DISCOVERY_CATEGORIES.map(({ id, title, headline, description, order }) => ({ id, title, headline, description, order })),
  needs: M.SERVICE_NEED_OPTIONS.map((n) => ({ ...n, recommendedSlugs: n.recommendedSlugs.filter(has) })),
  disclaimer: M.COMPLIANCE_DISCLAIMER,
  divisions: M.divisionMeta,
  pathways: M.homepagePathways.map(({ id, title, description, ctaLabel, href }) => ({ id, title, description, ctaLabel, href })),
  stages: M.homepageRoadmapStages.map(({ id, number, title, description, href }) => ({ id, number, title, description, href })),
  journey: M.startBusinessJourneyDef.steps.map((s) => ({ id: s.id, number: s.number, title: s.title, shortTitle: s.shortTitle, description: s.description, route: s.route, serviceSlugs: [...new Set([s.serviceSlug, ...(s.subSteps || []).map((x) => x.serviceSlug)].map((x) => ALIAS[x] || x).filter(has))] })),
  heroSupport: M.homepageHeroSupportingCopy,
  plans: Object.values(M.BOOKKEEPING_PLANS).map(({ name, tagline, bestFor, features }) => ({ name, tagline, bestFor, features })), // no prices
  bookCategories: [...M.BOOKKEEPING_TRUCKING_CATEGORIES],
  fleetPlans: { client: Object.values(M.FLEETCARE_PRICING_CONFIG.clientPlans ?? {}).map((p) => p.name).filter(Boolean) },
  fleetDisclosures: M.FLEETCARE_LEGAL_DISCLOSURES,
  driverDisclosures: M.DRIVERLINK_LEGAL_DISCLOSURES,
  driverLead: dl.heroLead,
  driverSteps: [dl.step1, dl.step2, dl.step3, dl.step4],
  intake: intakeOf(),
};
if (!data.fleetPlans.client.length) data.fleetPlans.client = JSON.stringify(M.FLEETCARE_PRICING_CONFIG).match(/"name":"FleetCare[^"]*"/g)?.map((x) => x.slice(8, -1)).filter((n) => !/Provider/.test(n)) ?? [];
{ // no price reaches the page. The one allowed dollar figure is the live intake's own answer bands for "monthly invoice volume" (factoring_volume) — the customer's volume, not an AIO price.
  const scan = JSON.stringify({ ...data, intake: { ...data.intake, sections: data.intake.sections.map((x) => ({ ...x, questions: x.questions.filter((q) => q.id !== 'factoring_volume') })) } });
  const hit = scan.match(/.{0,80}\$\s?\d.{0,40}/g); if (hit) throw new Error(`a price reached the page data: ${hit.join(" | ")}`); }

/* ── 2 · assets: photography (founder-supplied / founder-approved plates), brand marks, fonts, approved IFTA captures ── */
const PUBLIC = join(APP, 'public');
const PHOTOS = {
  'hero-home': 'brand/aio-login-hero.png', 'aio-login': 'brand/aio-login-hero.png', // all-in-one-hero-truck.png is retired (IFTA public contract, IDNTY_10)
  'highway-gold': 'brand/ifta/plates/client-hero.jpg', 'mountain-road': 'brand/ifta/plates/public-road.jpg', 'night-interstate': 'brand/ifta/plates/public-hero.jpg',
  'fleet-yard': 'brand/ifta/plates/staff-hero.jpg', 'freight-map': 'brand/ifta/plates/public-map.jpg', 'valley-trail': 'brand/ifta/plates/public-footer-tablet.jpg',
  'mountains-dusk': 'brand/ifta/plates/public-footer-desktop.jpg',
};
mkdirSync(join(OUT, 'img'), { recursive: true });
let resized = 0;
for (const [k, src] of Object.entries(PHOTOS)) {
  const out = join(OUT, 'img', `${k}.jpg`);
  if (existsSync(out) && statSync(out).mtimeMs > statSync(join(PUBLIC, src)).mtimeMs) continue;
  execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nif im.width>2560: im=im.resize((2560,round(im.height*2560/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=82,optimize=True,progressive=True)', join(PUBLIC, src), out]);
  resized++;
}
for (const [dir, files, from] of [
  ['brand', ['aio-mark-on-dark.png', 'aio-lockup-on-dark.png'], 'brand/ifta'],
  ['fonts', ['inter-latin-wght.woff2', 'inter-tight-latin-wght.woff2'], 'fonts/ifta'],
]) {
  mkdirSync(join(OUT, dir), { recursive: true });
  for (const f of files) copyFileSync(join(PUBLIC, from, f), join(OUT, dir, f));
}
const CAP = join(APP, 'docs/aio/ifta/visual-reconstruction/captures/after');
mkdirSync(join(OUT, 'ifta'), { recursive: true });
for (const f of ['CLIENT_1440.jpg', 'PUBLIC_393.jpg', 'PUBLIC_834.jpg', 'PUBLIC_1440.jpg']) copyFileSync(join(CAP, f), join(OUT, 'ifta', f));
const REF = join(HERE, 'reference');
if (existsSync(REF)) {
  mkdirSync(join(OUT, 'reference'), { recursive: true });
  for (const f of ['brand-dna-board.jpg', 'panel-04-homepage.jpg', 'ifta-public-authority.jpg']) if (existsSync(join(REF, f))) copyFileSync(join(REF, f), join(OUT, 'reference', f));
}
const THUMBS = join(APP, '..', 'AIO_PUBLIC_WEBSITE_REVIEW/thumbs');
const thumbs = [];
if (existsSync(THUMBS)) {
  mkdirSync(join(OUT, 'thumbs'), { recursive: true });
  for (const f of (await import('node:fs')).readdirSync(THUMBS).filter((x) => x.endsWith('.jpg'))) { copyFileSync(join(THUMBS, f), join(OUT, 'thumbs', f)); thumbs.push(f); }
}

/* ── 2b · the migration-readiness evidence the review shows (vendored record + measured page lengths + captures) ── */
const READY = join(APP, '..', 'AIO_PUBLIC_MIGRATION_READINESS');
const RECORD = join(APP, 'docs/aio/public-migration/PUBLIC_MIGRATION.json');
const MIG = existsSync(RECORD) ? (({ status, live, inventory, routes, issues, blockers, decisions }) => ({ status, live, inventory, routes, issues, blockers, decisions }))(JSON.parse(readFileSync(RECORD, 'utf8'))) : null;
const SCROLL = existsSync(join(READY, 'scroll.json')) ? JSON.parse(readFileSync(join(READY, 'scroll.json'), 'utf8')) : null;
const reviewImgs = [];
for (const dir of ['current', 'after', 'strips']) {
  const from = join(READY, 'review', dir);
  if (!existsSync(from)) continue;
  mkdirSync(join(OUT, dir), { recursive: true });
  for (const f of (await import('node:fs')).readdirSync(from).filter((x) => x.endsWith('.jpg'))) { copyFileSync(join(from, f), join(OUT, dir, f)); reviewImgs.push(`${dir}/${f}`); }
}

/* ── 3 · pages ── */
const read = (f) => readFileSync(join(HERE, f), 'utf8');
const js = `const PUB_DATA = ${JSON.stringify(data)};\n${read('site-icons.js')}\n${read('site.js')}`;
const head = (title) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="icon" href="brand/aio-mark-on-dark.png">`;
writeFileSync(join(OUT, 'site.html'), `${head('ALL IN ONE ENTERPRISES INC. — WHERE BUSINESS MEETS THE ROAD.')}<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"><style>html,body{margin:0;background:#050505}${read('site.css')}</style></head><body><div id="pub"></div><script>${js}
const root = document.getElementById('pub');
const sync = () => root.style.setProperty('--fh', (window.__fh || innerHeight) + 'px'); // __fh: capture tools hold the first screen at the device height
sync(); addEventListener('resize', sync);
const start = decodeURIComponent(location.hash.slice(1)) || '/';
PUB.path = start;
mountPub(root, { width: innerWidth });
addEventListener('pub:route', (e) => history.replaceState(null, '', '#' + e.detail));
addEventListener('hashchange', () => { const p = decodeURIComponent(location.hash.slice(1)) || '/'; if (p !== PUB.path) go(p); });
window.AIO_PUB = { go, act: (a, v) => ACT[a]?.(v), state: () => JSON.parse(JSON.stringify({ ...PUB, seen: undefined, scroller: undefined })), tree: () => TREE, data: () => D, hold(h) { window.__fh = h; sync(); }, capture(on) { PUB.capture = !!on; if (on) root.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); } };
document.documentElement.dataset.ready = '1';
</script></body></html>`);
/* index.html is the artifact page (the viewer adds the document skeleton); local.html is the same page as a document. */
const GF = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap">';
const review = `<title>AIO Public Website</title>${GF}<style>${read('site.css')}\n${read('review.css')}</style><div id="rv"></div><script>${js}\nconst THUMBS = ${JSON.stringify(thumbs)};\nconst MIG = ${JSON.stringify(MIG)};\nconst SCROLL = ${JSON.stringify(SCROLL)};\n${read('review.js')}</script>`;
writeFileSync(join(OUT, 'index.html'), review);
writeFileSync(join(OUT, 'local.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${review}</body></html>`);
const files = ['site.html', ...Object.keys(PHOTOS).map((k) => `img/${k}.jpg`), 'brand/aio-mark-on-dark.png', 'brand/aio-lockup-on-dark.png', 'fonts/inter-latin-wght.woff2', 'fonts/inter-tight-latin-wght.woff2', 'ifta/CLIENT_1440.jpg', 'ifta/PUBLIC_393.jpg', 'ifta/PUBLIC_834.jpg', 'ifta/PUBLIC_1440.jpg', ...(existsSync(join(OUT, 'reference')) ? ['reference/brand-dna-board.jpg', 'reference/panel-04-homepage.jpg', 'reference/ifta-public-authority.jpg'].filter((f) => existsSync(join(OUT, f))) : []), ...thumbs.map((f) => `thumbs/${f}`), ...reviewImgs];
writeFileSync(join(OUT, 'files.json'), JSON.stringify(Object.fromEntries(files.map((f) => [f, join(OUT, f)])), null, 1));
console.log(`built ${OUT} · ${services.length} services · ${data.categories.length} families · ${resized} photos resized · ${files.length} files`);
