/**
 * P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.EXISTING-DESIGN-RECONCILIATION1 — the founder's four-screen AIO OFFICE
 * design reconciliation, vendored from SITE00, held to this repo: every asset it plans to reuse or keep out exists here,
 * every lane / entry it proposes is in the vendored office IA, and every copied file matches its SITE00 provenance.
 * First delivery only — nothing approved, nothing in src imports these docs.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { officeIaChildren, officeIaNode, officeRootNav } from './officeInformationArchitecture';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/office-design-reconciliation');

type Ref = { kind: string; id: string | null };
type Rec = {
  reference: { file: { sha256: string }; drawn_nav: string[]; screens: { root_id: string; elements: { maps_to: Ref[] }[] }[] };
  pages: { root_id: string; proposed: { slot_id: string; maps_to: Ref; asset: string | null }[] }[];
  assets: { asset_id: string; path: string | null; status: string }[];
  decisions: { decision_id: string; status: string }[];
};
const REC = JSON.parse(readFileSync(path.join(DOCS, 'DESIGN_RECONCILIATION.json'), 'utf8')) as Rec;

describe('Design reconciliation ↔ this repo', () => {
  it('every asset it reuses, fixes or keeps out exists here', () => {
    const local = REC.assets.filter((a) => a.path && !a.path.startsWith('SITE00:'));
    expect(local.length).toBeGreaterThan(8);
    for (const a of local) expect(existsSync(path.join(REPO, a.path!)), `${a.asset_id} ${a.path}`).toBe(true);
    expect(REC.assets.find((a) => a.asset_id === 'logo-header')!.path).toBe('all-in-one-enterprises/public/migration/brand-lockup.png');
  });

  it('the dock it records is the IA root nav, and every IA node it names exists in the overlay', () => {
    expect(REC.reference.drawn_nav).toEqual(officeRootNav('AIO_OFFICE'));
    const ids = [...REC.reference.screens.flatMap((s) => s.elements.flatMap((e) => e.maps_to)), ...REC.pages.flatMap((p) => p.proposed.map((s) => s.maps_to))]
      .filter((r) => ['ROOT', 'LANE', 'MORE_ENTRY', 'REPORT_DOMAIN'].includes(r.kind))
      .map((r) => r.id!);
    for (const id of ids) expect(officeIaNode(id), id).toBeDefined();
  });

  it('proposes exactly the overlay’s twelve WORK lanes and eleven MORE entries', () => {
    const lanes = officeIaChildren('AIO_OFFICE.WORK').filter((n) => n.kind === 'SERVICE_LANE').map((n) => n.node_id);
    const work = REC.pages.find((p) => p.root_id === 'AIO_OFFICE.WORK')!.proposed.filter((s) => s.maps_to.kind === 'LANE').map((s) => s.maps_to.id);
    expect(work).toEqual(lanes);
    const more = REC.pages.find((p) => p.root_id === 'AIO_OFFICE.MORE')!.proposed.filter((s) => s.maps_to.kind === 'MORE_ENTRY').map((s) => s.maps_to.id).sort();
    expect(more).toEqual(officeIaChildren('AIO_OFFICE.MORE').map((n) => n.node_id).sort());
  });

  it('is kept as delivered — decisions OPEN at delivery; the founder’s approvals live in docs/aio/office-visual-authority', () => {
    expect(REC.decisions.length).toBeGreaterThan(0);
    expect(REC.decisions.every((d) => d.status === 'OPEN')).toBe(true);
    const va = JSON.parse(readFileSync(path.join(APP, 'docs/aio/office-visual-authority/VISUAL_AUTHORITY.json'), 'utf8')) as { approvals: { decision_id: string }[] };
    expect(va.approvals.map((a) => a.decision_id).sort()).toEqual(REC.decisions.map((d) => d.decision_id).sort());
  });
});

describe('Design reconciliation ↔ SITE00 provenance', () => {
  const prov = JSON.parse(readFileSync(path.join(DOCS, 'PROVENANCE.json'), 'utf8')) as { sha256: Record<string, string> };

  it('every copied file, the founder’s image included, matches its sha256', () => {
    expect(Object.keys(prov.sha256)).toHaveLength(14);
    expect(prov.sha256['reference/AIO_OFFICE_FOUR_SCREEN_REFERENCE.png']).toBe(REC.reference.file.sha256);
    for (const [f, sha] of Object.entries(prov.sha256)) expect(createHash('sha256').update(readFileSync(path.join(DOCS, f))).digest('hex'), f).toBe(sha);
  });

  it('is docs only: nothing in src imports the reconciliation', () => {
    const importers: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && readFileSync(p, 'utf8').includes('office-design-reconciliation')) importers.push(p);
      }
    };
    walk(path.join(APP, 'src'));
    expect(importers).toEqual([]);
  });
});
