/**
 * P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1 — the AIO OFFICE visual authority
 * record (vendored from SITE00) held to this repo: every render it pins exists here with exactly those pixels, every
 * approved asset it reuses exists, the stand-ins are what their manifest says, and nothing in src depends on any of it.
 * Decisions APPROVED · visuals AWAITING FOUNDER APPROVAL · live implementation NOT AUTHORIZED.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/office-visual-authority');
const STUDIO = path.join(APP, 'design-authority/aio-office');
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');

type Render = { frame: string; file: string; sha256: string; qa_pass: boolean };
type Rec = {
  status: Record<string, string>;
  approvals: { decision_id: string; decided_by: string; modification: string | null }[];
  renders: Render[];
  frames: { frame: string; root: string; viewport: string }[];
  assets: { reused: { path: string; status: string }[] };
  composer_handoff: { status: string };
};
const REC = JSON.parse(readFileSync(path.join(DOCS, 'VISUAL_AUTHORITY.json'), 'utf8')) as Rec;

describe('Visual authority ↔ this repo', () => {
  it('every render it pins exists here with exactly those pixels', () => {
    expect(REC.renders).toHaveLength(38);
    for (const r of REC.renders) {
      const p = path.join(REPO, r.file);
      expect(existsSync(p), r.file).toBe(true);
      expect(sha(p), r.file).toBe(r.sha256);
      expect(r.qa_pass, r.file).toBe(true);
    }
  });

  it('the renderer’s own manifest agrees with the record', () => {
    const local = JSON.parse(readFileSync(path.join(REPO, 'AIO_OFFICE_VISUAL_AUTHORITY/renders.json'), 'utf8')) as Render[];
    expect(local.map((r) => [r.file, r.sha256])).toEqual(REC.renders.map((r) => [r.file, r.sha256]));
  });

  it('covers the four roots at phone, tablet, desktop and ultra-wide', () => {
    for (const root of ['HOME', 'WORK', 'REPORTS', 'MORE'])
      for (const vp of ['MOBILE', 'TABLET', 'DESKTOP', 'ULTRA_WIDE']) expect(REC.frames.some((f) => f.root === root && f.viewport === vp), `${root} ${vp}`).toBe(true);
  });

  it('every approved asset it reuses exists here; the dotted lockup is not used', () => {
    const files = REC.assets.reused.filter((a) => a.status !== 'NOT_USED' && /^all-in-one-enterprises\/public\/.+\.(png|jpg|svg)$/.test(a.path));
    expect(files.length).toBeGreaterThanOrEqual(10);
    for (const a of files) expect(existsSync(path.join(REPO, a.path)), a.path).toBe(true);
    expect(REC.assets.reused.find((a) => a.path.endsWith('aio-logo-lockup.png'))!.status).toBe('NOT_USED');
    const studio = readFileSync(path.join(STUDIO, 'studio.js'), 'utf8');
    expect(studio).toContain('/migration/brand-lockup.png');
    expect(studio).not.toContain('aio-logo-lockup');
  });

  it('the stand-ins are the founder-drawing crops their manifest names', () => {
    const m = JSON.parse(readFileSync(path.join(STUDIO, 'standins/standins.json'), 'utf8')) as Record<string, { file: string; sha256: string }>;
    expect(Object.keys(m)).toHaveLength(7);
    for (const v of Object.values(m)) expect(sha(path.join(STUDIO, v.file)), v.file).toBe(v.sha256);
  });

  it('keeps the status honest: decisions approved, visuals awaiting the founder, no implementation', () => {
    expect(REC.approvals).toHaveLength(15);
    expect(REC.approvals.every((a) => a.decided_by === 'FOUNDER')).toBe(true);
    expect(REC.status.approval).toMatch(/^AWAITING FOUNDER APPROVAL/);
    expect(REC.status.implementation).toMatch(/^NOT AUTHORIZED/);
    expect(REC.composer_handoff.status).toMatch(/^DRAFT/);
  });
});

describe('Visual authority ↔ SITE00 provenance', () => {
  const prov = JSON.parse(readFileSync(path.join(DOCS, 'PROVENANCE.json'), 'utf8')) as { sha256: Record<string, string> };

  it('every copied file matches its sha256', () => {
    expect(Object.keys(prov.sha256)).toHaveLength(13);
    for (const [f, s] of Object.entries(prov.sha256)) expect(sha(path.join(DOCS, f)), f).toBe(s);
  });

  it('is design authority only: nothing in src imports the studio, the renders or the record', () => {
    const importers: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx|css)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && /design-authority|AIO_OFFICE_VISUAL_AUTHORITY|office-visual-authority/.test(readFileSync(p, 'utf8'))) importers.push(p);
      }
    };
    walk(path.join(APP, 'src'));
    expect(importers).toEqual([]);
  });
});
