/**
 * P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.MATERIAL-MOTION-AND-DETAIL-POLISH1 — the AIO OFFICE WORKSPACE STYLE (record vendored
 * from SITE00) held to this repo: the tokens in workspaces/ws.css are the ones the style records; motion stays inside
 * the brief (no long, looping or bouncing animation; reduced motion switches it off); drawers are dialogs that trap and
 * return focus; the text audit runs inside QA; the approved roots are byte-for-byte unchanged; the boards, recordings
 * and audit counts the record cites are here.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/office-workspace-style');
const WS = path.join(APP, 'design-authority/aio-office/workspaces');
const OUT = path.join(REPO, 'AIO_OFFICE_WORKSPACE_PROOFS');
const read = (p: string) => readFileSync(p, 'utf8');
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const ws = (f: string) => read(path.join(WS, f));

type Tok = { name: string; value: string; min?: number; max?: number };
type Rec = {
  status: Record<string, string>;
  tokens: Record<'type' | 'motion' | 'easing' | 'surfaces' | 'elevation', Tok[]>;
  defects: { id: string; status: string }[];
  founder_feedback: { recording: string };
  qa: { checks_run: number; failures: number; screenshots: number; text_audit: { states: number; this_pass: Record<string, number>; last_pass: Record<string, number> }; recordings: { count: number } };
  evidence: { boards: string[]; boards_since_batch1: string[] };
};
const REC = JSON.parse(read(path.join(DOCS, 'STYLE.json'))) as Rec;
const CSS = ws('ws.css');
/** The custom properties declared on .ao-root at the top of ws.css. */
const ROOT = Object.fromEntries([...CSS.slice(CSS.indexOf('.ao-root {'), CSS.indexOf('}', CSS.indexOf('.ao-root {'))).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

describe('Vendored record', () => {
  it('matches its provenance byte for byte', () => {
    const prov = JSON.parse(read(path.join(DOCS, 'PROVENANCE.json'))) as { sha256: Record<string, string>; source: { commit: string } };
    expect(prov.source.commit).toMatch(/^[0-9a-f]{40}$/);
    const files = readdirSync(DOCS).filter((f) => f !== 'PROVENANCE.json').sort();
    expect(Object.keys(prov.sha256).sort()).toEqual(files);
    for (const f of files) expect(sha(path.join(DOCS, f)), f).toBe(prov.sha256[f]);
  });

  it('stays a candidate, locked not redesigned, separate from the public site, privacy gaps open', () => {
    expect(REC.status.language).toMatch(/^LOCKED/);
    expect(REC.status.proofs).toMatch(/CANDIDATES, AWAITING FOUNDER REVIEW$/);
    expect(REC.status.expansion).toMatch(/^NOT STARTED/);
    expect(REC.status.public_site).toMatch(/^SEPARATE/);
    expect(REC.status.security).toMatch(/^12 PRIVACY GAPS STILL OPEN/);
    expect(REC.founder_feedback.recording).toMatch(/^NOT AVAILABLE/);
    expect(REC.defects.map((d) => `${d.id}:${d.status}`).join()).toBe('A:FIXED,B:FIXED,C:FIXED,D:FIXED,E:FIXED,F:FIXED,G:FIXED,H:FIXED,I:FIXED,J:FIXED');
  });
});

describe('Record ↔ ws.css', () => {
  it('declares every recorded token with the recorded value', () => {
    for (const group of ['type', 'motion', 'easing', 'surfaces', 'elevation'] as const) for (const t of REC.tokens[group]) expect(ROOT[t.name], t.name).toBe(t.value);
  });

  it('keeps the type scale and the durations inside the brief', () => {
    for (const t of [...REC.tokens.type, ...REC.tokens.motion]) {
      expect(parseFloat(t.value), t.name).toBeGreaterThanOrEqual(t.min!);
      expect(parseFloat(t.value), t.name).toBeLessThanOrEqual(t.max!);
    }
  });

  it('never sets text below 9 px', () => {
    const sizes = [...CSS.matchAll(/font(?:-size)?:\s*(?:[0-9]{3}\s+)?([0-9.]+)px/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(50);
    expect(sizes.filter((n) => n < 9)).toEqual([]);
  });

  it('animates with the tokens only: no literal duration but the working spinner, nothing looping but it', () => {
    const literal = [...CSS.matchAll(/(?:animation|transition):[^;]*?\b([0-9.]+m?s)\b[^;]*;/g)].map((m) => m[0]).filter((d) => !/1ms !important/.test(d));
    expect(literal).toEqual(['animation: wsSpin 0.7s linear infinite;']);
    expect((CSS.match(/infinite/g) ?? []).length).toBe(1);
  });

  it('switches motion off for reduced motion and for the review switch', () => {
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.ao-root \*, \.ao-root \*::before, \.ao-root \*::after \{ animation-duration: 1ms !important;/);
    expect(CSS).toContain(":root[data-motion='reduce'] .ao-root *");
    expect(ws('ws-motion.js')).toContain("document.documentElement.dataset.motion === 'reduce' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches");
  });
});

describe('Drawers and keyboard', () => {
  it('a drawer is a labelled modal dialog whose close control lives in its own bar', () => {
    const core = ws('ws-core.js');
    expect(core).toMatch(/class="wsheet[^"]*" data-key="sheet" role="dialog" aria-modal="true" aria-label="\$\{label\}"/);
    expect(core).toMatch(/<div class="wsheet__bar">.*class="wbtn wbtn--icon wbtn--sm wsheet__x" data-a="sheet\.close" aria-label="Close"/);
  });

  it('holds focus, traps Tab, makes the page inert and leaves in --m-out', () => {
    const m = ws('ws-motion.js');
    expect(m).toMatch(/function settleSheet\(/);
    expect(m).toMatch(/function trapTab\(/);
    expect(m).toContain("el.toggleAttribute('inert', !!sheet)");
    expect(m).not.toMatch(/FOCUSABLE = '[^']*, \[href\]/); // <use href> inside icons is not a focus stop
    expect(Number(m.match(/sheetOut: (\d+)/)![1])).toBe(parseFloat(ROOT['--m-out']));
    expect(ws('ws-review.js')).toContain("if (e.key !== 'Escape') return;");
  });

  it('every clickable that is not a button gets a tab stop and a role', () => {
    expect(ws('ws-motion.js')).toContain("t.content.querySelectorAll('[data-a]:not(button):not(input):not(.wscrim), [data-k], [data-go]:not(button)')");
  });
});

describe('QA and evidence', () => {
  it('runs the text audit inside QA, and the audit fails on what the brief forbids', () => {
    expect(ws('qa.mjs')).toContain("import { SINGLE_LINE, AUDIT_STATES, phoneActs, pageAudit } from './audit.mjs';");
    for (const k of ['WRAPS', 'CLIPPED', 'OVERLAPS', 'TINY', 'TRUNCATED', 'SCROLLS_X']) expect(ws('qa.mjs'), k).toContain(`'${k}'`);
  });

  it('the QA summary matches the record and passed', () => {
    const qa = JSON.parse(read(path.join(OUT, 'qa-summary.json'))) as { pass: number; fail: number; results: { name: string; ok: boolean }[] };
    expect(qa.pass).toBe(REC.qa.checks_run);
    expect(qa.fail).toBe(0);
    expect(qa.results.filter((r) => r.name.startsWith('text · ')).length).toBe(24);
    expect(qa.results.filter((r) => /^(drawer|reduced motion|motion) · /.test(r.name)).length).toBeGreaterThanOrEqual(20);
    expect(readdirSync(path.join(OUT, 'screens')).filter((f) => f.endsWith('.jpg'))).toHaveLength(REC.qa.screenshots);
  });

  it('the audit counts on the boards are the recorded ones', () => {
    const a = JSON.parse(read(path.join(OUT, 'boards/polish-audit.json'))) as { states: number; after: Record<string, number>; before: Record<string, number> };
    expect(a.states).toBe(REC.qa.text_audit.states);
    const map: Record<string, string> = { WRAPS: 'WRAPS', CLIPPED: 'CLIPPED', OVERLAPS: 'OVERLAPS', TRUNCATED_UNREACHABLE: 'TRUNCATED', BELOW_9PX: 'TINY', UNINTENDED_SIDEWAYS: 'SCROLLS_X' };
    for (const [k, v] of Object.entries(map)) {
      expect(a.after[v], k).toBe(REC.qa.text_audit.this_pass[k]);
      expect(a.before[v], k).toBe(REC.qa.text_audit.last_pass[k]);
    }
  });

  it('the boards and the twelve recordings (last pass and this one, MP4 and WebM) are here, and the review offers them', () => {
    for (const b of [...REC.evidence.boards, ...REC.evidence.boards_since_batch1]) expect(existsSync(path.join(OUT, 'boards', b)), b).toBe(true);
    const after = JSON.parse(read(path.join(OUT, 'recordings/recordings-after.json'))) as { id: string; marks: { at: number | null }[] }[];
    expect(after.map((r) => r.id)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']);
    expect(after.every((r) => r.marks.every((m) => m.at != null))).toBe(true);
    for (const r of after) for (const f of [`${r.id}-before.mp4`, `${r.id}-after.mp4`, `${r.id}-before.webm`, `${r.id}-after.webm`, `${r.id}-poster.jpg`]) expect(existsSync(path.join(OUT, 'recordings', f)), f).toBe(true);
    const review = ws('ws-review.js');
    for (const r of after) expect(review).toContain(`['${r.id}', '`);
    for (const b of REC.evidence.boards) expect(review).toContain(`['${b}', '`);
  });

  it('the approved roots are byte-for-byte unchanged (fsbw cdd43dfb)', () => {
    expect(sha(path.join(APP, 'design-authority/aio-office/studio.js'))).toBe('31f0f650cac2494e82670b52e5cb12dd7deedc9392916f2331dd2a10403f49e7');
    expect(sha(path.join(APP, 'design-authority/aio-office/studio.css'))).toBe('bdf2aa01354842a4829b8f715091d5d6a1512d0576b80b20d8b23c52509b5821');
  });
});
