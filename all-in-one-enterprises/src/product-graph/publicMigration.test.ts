/**
 * P0.AIO.PUBLIC-WEBSITE.LIVE-LEGACY-AUDIT-RESPONSIVE-CREATIVE-RECONCILIATION-AND-MIGRATION-READINESS1 — the public
 * migration record (vendored from SITE00) held to this repo: the audit's evidence (QA at six sizes, the current app's
 * renders, page lengths) is here and agrees with the record; the design still carries no price and keeps Brokerage paused;
 * the live per-service words and the live Smart Intake are what the design draws; the issues it re-verified are still true
 * of this source (so the record cannot silently go stale).
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/public-migration');
const PUB = path.join(APP, 'design-authority/aio-public');
const OUT = path.join(REPO, 'AIO_PUBLIC_MIGRATION_READINESS');
const read = (p: string) => readFileSync(p, 'utf8');
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
type Rec = {
  status: Record<string, string>;
  live: { production_url: string | null; verified: boolean };
  inventory: { id: string; classes: string[] }[];
  issues: { id: string; verdict: string }[];
  evidence: { qa: { pass: number; fail: number; pages: number; sizes: string[] }; legacy: { routes: number; renders: number }; screenshots: { qa: number; current_app: number; boards: number }; scroll_all_pages: number };
};
const REC = JSON.parse(read(path.join(DOCS, 'PUBLIC_MIGRATION.json'))) as Rec;

describe('Vendored record', () => {
  it('matches its provenance byte for byte', () => {
    const prov = JSON.parse(read(path.join(DOCS, 'PROVENANCE.json'))) as { sha256: Record<string, string>; source: { commit: string } };
    expect(prov.source.commit).toMatch(/^[0-9a-f]{40}$/);
    const files = readdirSync(DOCS).filter((f) => f !== 'PROVENANCE.json').sort();
    expect(Object.keys(prov.sha256).sort()).toEqual(files);
    for (const f of files) expect(sha(path.join(DOCS, f)), f).toBe(prov.sha256[f]);
    expect(files.filter((f) => /^\d\d_/.test(f))).toHaveLength(20);
  });

  it('claims no production URL, deploys nothing, keeps Brokerage paused and the privacy gaps open', () => {
    expect(REC.live.production_url).toBeNull();
    expect(REC.live.verified).toBe(false);
    expect(REC.status.public_design).toMatch(/NOT DEPLOYED$/);
    expect(REC.status.live_app).toMatch(/^NOT CHANGED/);
    expect(REC.status.brokerage).toMatch(/^PAUSED/);
    expect(REC.status.security).toMatch(/PRIVACY GAPS STILL OPEN/);
  });
});

describe('Evidence in this repo agrees with the record', () => {
  it('QA ran clean at six sizes over the whole tree', () => {
    const qa = JSON.parse(read(path.join(OUT, 'qa-summary.json'))) as { pass: number; fail: number; pages: number; devices: string[] };
    expect(qa.fail).toBe(0);
    expect(qa.pass).toBe(REC.evidence.qa.pass);
    expect(qa.pages).toBe(REC.evidence.qa.pages);
    expect(qa.devices).toEqual(['s360', 'phone', 'tablet', 'tabletL', 'desktop', 'wide']);
    expect(readdirSync(path.join(OUT, 'screens')).filter((f) => f.endsWith('.jpg'))).toHaveLength(REC.evidence.screenshots.qa);
  });

  it('the current app was rendered at five sizes (local build, labelled not production)', () => {
    const m = JSON.parse(read(path.join(OUT, 'current-app/metrics.json'))) as { what: string; routes: number; renders: number };
    expect(m.what).toMatch(/NOT PRODUCTION/);
    expect(m.renders).toBe(m.routes * 5);
    expect(m.routes).toBe(REC.evidence.legacy.routes);
    expect(readdirSync(path.join(OUT, 'current-app')).filter((f) => f.endsWith('.jpg'))).toHaveLength(REC.evidence.screenshots.current_app);
  });

  it('page lengths: every page before and after at six sizes; the long ones shorter', () => {
    const sc = JSON.parse(read(path.join(OUT, 'scroll.json'))) as { pages: { path: string; before: Record<string, number>; after: Record<string, number> }[] };
    expect(sc.pages).toHaveLength(REC.evidence.scroll_all_pages);
    const at = (p: string) => sc.pages.find((x) => x.path === p)!;
    expect(at('/services').after.phone).toBeLessThan(at('/services').before.phone / 2);
    expect(at('/roadmap').after.desktop).toBeLessThan(at('/roadmap').before.desktop);
    for (const b of ['B-home.jpg', 'C-services--phone.jpg', 'A-home-current-vs-new.jpg']) expect(existsSync(path.join(OUT, 'boards', b)), b).toBe(true);
  });
});

describe('The design draws the live sources', () => {
  it('bundles the live per-service words and the live Smart Intake, and still refuses any price', () => {
    const build = read(path.join(PUB, 'build.mjs'));
    expect(build).toContain("aioServices } from './src/data/services'");
    expect(build).toContain("intakeSections, getVisibleSections } from './src/intake/intakeConfig'");
    expect(build).toContain('a price reached the page data');
    expect(read(path.join(PUB, 'site.js'))).not.toMatch(/\$\s?\d/);
    expect(read(path.join(PUB, 'site.js'))).not.toMatch(/truck-branded|MOST CHOSEN/);
  });
});

describe('The re-verified issues are still true of this source', () => {
  it('A · aio-page-system.css is still imported nowhere', () => {
    const app = read(path.join(APP, 'src/App.tsx'));
    expect(app).not.toMatch(/aio-page-system\.css/);
    expect(REC.issues.find((i) => i.id === 'A')!.verdict).toMatch(/^CONFIRMED/);
  });
  it('B · the public CTA still fails open for unmapped slugs', () => {
    expect(read(path.join(APP, 'src/launch/serviceActivationLaunch.ts'))).toMatch(/if \(!entry\) return \{ label: 'Get Started', allowed: true, state: 'GO' \}/);
  });
  it('D · the placeholder contacts are still in appConfig', () => {
    expect(read(path.join(APP, 'src/config/appConfig.ts'))).toContain("'(866) 000-0000'");
  });
  it('E · the retired identity is still the intake placeholder', () => {
    expect(read(path.join(APP, 'src/locales/en/intake.json'))).toContain('Perfect Choice Inc.');
  });
});
