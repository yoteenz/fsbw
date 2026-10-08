/**
 * P0.AIO.OFFICE.COMPLETE-INTERNAL-OFFICE-AND-UNIFIED-EXPERIENCE1 — the unified internal office record (vendored from SITE00)
 * held to this repo: the review studio realizes every lane, INTAKE section, report domain and MORE destination it lists;
 * the studio stays isolated from src; the review holds sample data only; the approved authorities it shows exist here
 * unchanged; the QA output it cites is here; and the twelve privacy gaps it hands to Composer are still in the source.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/office-unified-experience');
const OFFICE = path.join(APP, 'design-authority/aio-office/office');
const REVIEW = path.join(REPO, 'AIO_OFFICE_UNIFIED_REVIEW');
const read = (p: string) => readFileSync(p, 'utf8');
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');

type Rec = {
  status: Record<string, string>;
  lanes: { slug: string; tabs: [string, string, string | null, string, string][] }[];
  report_domains: [string, string, string, string, string, string][];
  more: { slug: string }[];
  page_tree: { route: string; review: string; live: string }[];
  security: { handoff: { gap_id: string; status: string }[] };
  qa: { crawled_routes: number; failures: number; screenshots: number };
  composer_plan: { status: string };
};
const REC = JSON.parse(read(path.join(DOCS, 'UNIFIED_EXPERIENCE.json'))) as Rec;
const pages = ['pages-core.js', 'pages-intake.js', 'pages-work.js', 'pages-reports-more.js'].map((f) => read(path.join(OFFICE, f))).join('\n');

describe('Vendored record', () => {
  it('matches its provenance byte for byte', () => {
    const prov = JSON.parse(read(path.join(DOCS, 'PROVENANCE.json'))) as { sha256: Record<string, string>; source: { commit: string } };
    expect(prov.source.commit).toMatch(/^[0-9a-f]{40}$/);
    const files = readdirSync(DOCS).filter((f) => f !== 'PROVENANCE.json').sort();
    expect(Object.keys(prov.sha256).sort()).toEqual(files);
    for (const f of files) expect(sha(path.join(DOCS, f)), f).toBe(prov.sha256[f]);
  });

  it('never claims the office, the live app or approval', () => {
    expect(REC.status.office).toMatch(/^NOT COMPLETE/);
    expect(REC.status.live_app).toMatch(/^NOT COMPLETE/);
    expect(REC.status.approval).toBe('AWAITING FOUNDER REVIEW');
    expect(REC.composer_plan.status).toMatch(/^DRAFT/);
  });
});

describe('Review studio ↔ record', () => {
  it('has a workspace for every lane and a page for every lane tab', () => {
    const work = read(path.join(OFFICE, 'pages-work.js'));
    for (const l of REC.lanes) {
      expect(work, l.slug).toMatch(new RegExp(`\\b${l.slug}\\(tab = '${l.tabs[0][0]}', r\\)`));
      for (const [tab] of l.tabs.slice(1)) expect(work, `${l.slug}/${tab}`).toMatch(new RegExp(`'${tab}'|\\b${tab}: '`));
    }
  });

  it('has every report domain, MORE destination and INTAKE section', () => {
    for (const [slug] of REC.report_domains.slice(1)) expect(pages, slug).toMatch(new RegExp(`\\b${slug}\\(`));
    for (const m of REC.more) expect(pages, m.slug).toMatch(new RegExp(`\\b${m.slug}\\(child, r\\)`));
    for (const s of ['existing', 'new', 'bulk', 'status', 'extraction', 'match', 'review', 'prebuilt', 'activation', 'history']) expect(read(path.join(OFFICE, 'pages-intake.js'))).toContain(`['${s}', `);
  });

  it('keeps the activation gate and paused brokerage in the pages', () => {
    const intake = read(path.join(OFFICE, 'pages-intake.js'));
    expect(intake).toMatch(/label: 'APPROVE · LANDS ON PREBUILT'[^}]*founder: true/);
    expect(intake).toContain('ONLY THE CLIENT’S CONFIRMATION MAKES A CLIENT ACTIVE');
    expect(intake).toContain('NOT ALLOWED — THE CLIENT CONFIRMS IN THEIR OWN OFFICE');
    expect(read(path.join(OFFICE, 'pages-work.js'))).toContain('NOTHING HERE ACTIVATES THE SERVICE');
  });

  it('hides founder-only actions from staff in the shared component', () => {
    expect(read(path.join(OFFICE, 'office-ui.js'))).toMatch(/filter\(\(a\) => !a\.founder \|\| FOUNDER\)/);
  });
});

describe('Isolation, data safety and approved authority', () => {
  it('nothing in src imports the studio (tests may read it)', () => {
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = path.join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx|js|jsx)$/.test(f) && !/\.test\.tsx?$/.test(f) && /(from\s+|import\()['"][^'"]*design-authority/.test(read(p))) hits.push(p);
      }
    };
    walk(path.join(APP, 'src'));
    expect(hits).toEqual([]);
  });

  it('holds sample records only: no email addresses, phone numbers or full VINs', () => {
    const data = read(path.join(OFFICE, 'office-data.js'));
    expect(data).toMatch(/ILLUSTRATIVE SAMPLE RECORDS\. Safe demo data only/);
    expect(data).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    expect(data).not.toMatch(/\(?\d{3}\)?[ -]\d{3}-\d{4}/);
    expect(data).not.toMatch(/\b[A-HJ-NPR-Z0-9]{17}\b/);
  });

  it('studio.js stays embeddable without changing the authority renders', () => {
    const studio = read(path.join(APP, 'design-authority/aio-office/studio.js'));
    expect(studio).toContain('const EMBED = window.AIO_STUDIO_EMBED === true;');
    expect(studio).toContain('if (!EMBED) mount();');
    const renders = JSON.parse(read(path.join(REPO, 'AIO_OFFICE_VISUAL_AUTHORITY/renders.json')));
    const list = (Array.isArray(renders) ? renders : renders.renders) as { file: string; sha256: string }[];
    expect(list).toHaveLength(38);
  });

  it('the approved authorities the review shows exist here', () => {
    const manifest = JSON.parse(read(path.join(REPO, 'AIO_CLIENT_MIGRATION_AUTHORITY/authority-manifest.json'))) as { source_image: string }[];
    expect(manifest).toHaveLength(42);
    for (const m of manifest) expect(existsSync(path.join(REPO, 'AIO_CLIENT_MIGRATION_AUTHORITY', m.source_image)), m.source_image).toBe(true);
    for (const k of ['QUEUE', 'CASE']) for (const w of [393, 834, 1440]) expect(existsSync(path.join(APP, `docs/aio/ifta/visual-reconstruction/captures/after/STAFF_${k}_${w}.jpg`))).toBe(true);
  });

  it('the QA output it cites is here', () => {
    const qa = JSON.parse(read(path.join(REVIEW, 'qa-summary.json'))) as { counts: { routes: number; failures: number }; failures: unknown[] };
    expect(qa.counts.routes).toBe(REC.qa.crawled_routes);
    expect(qa.failures).toEqual([]);
    expect(readdirSync(path.join(REVIEW, 'screens')).filter((f) => f.endsWith('.jpg'))).toHaveLength(REC.qa.screenshots);
  });
});

describe('Security-repair handoff ↔ source', () => {
  it('lists twelve gaps, all still OPEN, with their evidence still in this repo', () => {
    expect(REC.security.handoff).toHaveLength(12);
    expect(REC.security.handoff.every((g) => g.status === 'OPEN')).toBe(true);
    const sql = (f: string) => read(path.join(APP, 'supabase/migrations', f));
    expect(sql('20260815110000_aio_business_data_rls.sql')).toMatch(/create policy aio_messages_access on public\.aio_messages for all using \(\s*conversation_id in/);
    expect(sql('20260815110000_aio_business_data_rls.sql')).toMatch(/visibility = 'customer' and organization_id in \(select public\.aio_user_org_ids\(\)\)/);
    expect(sql('20260827001621_aio_api_role_grants.sql')).toContain('grant select on all tables in schema public to anon;');
    expect(sql('20260817190000_aio_fleetcare_network.sql')).toMatch(/or client_organization_id in \(select public\.aio_user_org_ids\(\)\)/);
    expect(read(path.join(APP, 'src/pages/portal/dispatch/DispatchHomePage.tsx'))).toContain('aioPaths.officeMessages');
  });
});
