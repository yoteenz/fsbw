/**
 * P0.AIO.COMPLETE-PRODUCT-VISUAL-CONVERGENCE.INTERNAL-OFFICE-AND-PUBLIC-WEBSITE1 — the AIO COMPLETE PRODUCT record
 * (vendored from SITE00) held to this repo: every office page it lists is a registered workspace with its own file; the
 * approved roots are byte-for-byte unchanged; Brokerage is drawn paused and never activated; the public website draws its
 * services from the live catalog with no price; the QA summaries and evidence the record cites are here.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/complete-product');
const WS = path.join(APP, 'design-authority/aio-office/workspaces');
const PUB = path.join(APP, 'design-authority/aio-public');
const OFFICE_OUT = path.join(REPO, 'AIO_OFFICE_COMPLETE_REVIEW');
const PUBLIC_OUT = path.join(REPO, 'AIO_PUBLIC_WEBSITE_REVIEW');
const read = (p: string) => readFileSync(p, 'utf8');
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');

type Rec = {
  status: Record<string, string>;
  office: { id: string; no: string; name: string; built_around: string; routes: string[]; approved?: boolean }[];
  reports_areas: string[];
  more_destinations: string[];
  public: { tree: { group: string; pages: number }[]; home: { differs: string[] } };
  qa: { office: { checks_run: number; failures: number; screenshots: number }; public: { checks_run: number; failures: number; pages: number; screenshots: number } };
  links: { office_review: string; public_review: string };
};
const REC = JSON.parse(read(path.join(DOCS, 'COMPLETE_PRODUCT.json'))) as Rec;
const FILE: Record<string, string> = { comp: 'ws-compliance.js' };
const wsFile = (id: string) => path.join(WS, FILE[id] ?? `ws-${id}.js`);

describe('Vendored record', () => {
  it('matches its provenance byte for byte', () => {
    const prov = JSON.parse(read(path.join(DOCS, 'PROVENANCE.json'))) as { sha256: Record<string, string>; source: { commit: string } };
    expect(prov.source.commit).toMatch(/^[0-9a-f]{40}$/);
    const files = readdirSync(DOCS).filter((f) => f !== 'PROVENANCE.json').sort();
    expect(Object.keys(prov.sha256).sort()).toEqual(files);
    for (const f of files) expect(sha(path.join(DOCS, f)), f).toBe(prov.sha256[f]);
  });

  it('stays candidates, not deployed, live app untouched, Brokerage paused, privacy gaps open', () => {
    expect(REC.status.office).toMatch(/CANDIDATES, AWAITING FOUNDER REVIEW$/);
    expect(REC.status.public_site).toMatch(/NOT DEPLOYED$/);
    expect(REC.status.live_app).toMatch(/^NOT CHANGED/);
    expect(REC.status.brokerage).toMatch(/^PAUSED/);
    expect(REC.status.security).toMatch(/PRIVACY GAPS STILL OPEN/);
    expect(REC.links.public_review).toMatch(/^https:\/\/claude\.ai\/artifact\//);
  });
});

describe('The complete office', () => {
  it('every page the record lists is a workspace registered in its own file', () => {
    for (const p of REC.office) {
      expect(existsSync(wsFile(p.id)), p.id).toBe(true);
      expect(read(wsFile(p.id)), p.id).toMatch(new RegExp(`registerWorkspace\\(\\{[\\s\\S]*?id: '${p.id}'`));
    }
    expect(REC.office.filter((p) => /^\d\d$/.test(p.no))).toHaveLength(12);
    expect(new Set(REC.office.map((p) => p.built_around)).size).toBe(REC.office.length);
    expect(REC.reports_areas).toHaveLength(10);
    expect(REC.more_destinations).toHaveLength(11);
  });

  it('the approved roots are byte-for-byte unchanged (fsbw cdd43dfb)', () => {
    expect(sha(path.join(APP, 'design-authority/aio-office/studio.js'))).toBe('31f0f650cac2494e82670b52e5cb12dd7deedc9392916f2331dd2a10403f49e7');
    expect(sha(path.join(APP, 'design-authority/aio-office/studio.css'))).toBe('bdf2aa01354842a4829b8f715091d5d6a1512d0576b80b20d8b23c52509b5821');
  });

  it('Brokerage is drawn paused and offers no activation', () => {
    const b = read(wsFile('broker'));
    expect(b).toMatch(/PAUSED/);
    expect(b).not.toMatch(/ACTIVATE BROKERAGE/);
  });

  it('the office QA passed and its evidence is here', () => {
    const qa = JSON.parse(read(path.join(OFFICE_OUT, 'qa-summary.json'))) as { pass: number; fail: number };
    expect(qa.pass).toBe(REC.qa.office.checks_run);
    expect(qa.fail).toBe(0);
    expect(readdirSync(path.join(OFFICE_OUT, 'screens')).filter((f) => f.endsWith('.jpg'))).toHaveLength(REC.qa.office.screenshots);
    for (const p of REC.office) expect(existsSync(path.join(OFFICE_OUT, 'boards', `dept-${p.id}.jpg`)), p.id).toBe(true);
  });
});

describe('The public website', () => {
  it('bundles the live catalog and refuses any price', () => {
    const build = read(path.join(PUB, 'build.mjs'));
    expect(build).toContain("from './src/services/catalog/serviceCatalog'");
    expect(build).toContain('a price reached the page data');
    expect(read(path.join(PUB, 'site.js'))).not.toMatch(/\$\s?\d/);
  });

  it('the public QA passed over the whole tree at four sizes and its evidence is here', () => {
    const qa = JSON.parse(read(path.join(PUBLIC_OUT, 'qa-summary.json'))) as { pass: number; fail: number; pages: number; devices: string[] };
    expect(qa.fail).toBe(0);
    expect(qa.pass).toBe(REC.qa.public.checks_run);
    expect(qa.pages).toBe(REC.qa.public.pages);
    expect(qa.devices).toEqual(['phone', 'tablet', 'desktop', 'wide']);
    expect(REC.public.tree.reduce((n, g) => n + g.pages, 0)).toBe(qa.pages);
    expect(readdirSync(path.join(PUBLIC_OUT, 'screens')).filter((f) => f.endsWith('.jpg'))).toHaveLength(REC.qa.public.screenshots);
    for (const b of ['match-home.jpg', 'match-family.jpg', 'home-sizes.jpg', 'family.jpg', 'remaining.jpg']) expect(existsSync(path.join(PUBLIC_OUT, 'boards', b)), b).toBe(true);
  });

  it('records why the homepage differs from panel 04 (no unverified figures)', () => {
    expect(REC.public.home.differs.join(' ')).toMatch(/unverified/);
    for (const f of ['brand-dna-board.jpg', 'panel-04-homepage.jpg', 'ifta-public-authority.jpg']) expect(existsSync(path.join(PUB, 'reference', f)), f).toBe(true);
  });
});
