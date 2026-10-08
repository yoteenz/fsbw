/**
 * P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.CREATIVE-DIRECTION-AND-WORKSPACE-RECOVERY1 — the four workspace proofs (record
 * vendored from SITE00) held to this repo: each proof has its workspace and signature composition in
 * design-authority/aio-office/workspaces/; the TRY demonstrations match; simulated actions say so and write nothing;
 * no balances or invented figures; the approved roots and the Batch 1 studio are byte-for-byte unchanged; the QA,
 * screenshots and boards it cites are here.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/office-workspace-proofs');
const WS = path.join(APP, 'design-authority/aio-office/workspaces');
const OUT = path.join(REPO, 'AIO_OFFICE_WORKSPACE_PROOFS');
const read = (p: string) => readFileSync(p, 'utf8');
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const ws = (f: string) => read(path.join(WS, f));

type Rec = {
  status: Record<string, string>;
  proofs: { id: string; workspace: string; live: string }[];
  demos: Record<string, string[]>;
  qa: { checks_run: number; failures: number; screenshots: number };
  assets: { generated: string };
};
const REC = JSON.parse(read(path.join(DOCS, 'WORKSPACE_PROOFS.json'))) as Rec;

describe('Vendored record', () => {
  it('matches its provenance byte for byte', () => {
    const prov = JSON.parse(read(path.join(DOCS, 'PROVENANCE.json'))) as { sha256: Record<string, string>; source: { commit: string } };
    expect(prov.source.commit).toMatch(/^[0-9a-f]{40}$/);
    const files = readdirSync(DOCS).filter((f) => f !== 'PROVENANCE.json').sort();
    expect(Object.keys(prov.sha256).sort()).toEqual(files);
    for (const f of files) expect(sha(path.join(DOCS, f)), f).toBe(prov.sha256[f]);
  });

  it('stays a candidate and does not expand', () => {
    expect(REC.status.proofs).toMatch(/CANDIDATES, AWAITING FOUNDER APPROVAL$/);
    expect(REC.status.expansion).toMatch(/^NOT STARTED/);
    expect(REC.assets.generated).toMatch(/^NONE/);
    expect(REC.proofs.map((p) => p.id)).toEqual(['fleet', 'books', 'comp', 'client']);
  });
});

describe('Record ↔ workspaces', () => {
  it('each proof has its workspace and its signature composition', () => {
    const sig: Record<string, [string, RegExp[]]> = {
      fleet: ['ws-fleet.js', [/function fleetView\(/, /function truckShape\(/, /function blueprint\(/, /class="fl-tag /]],
      books: ['ws-books.js', [/function booksView\(/, /function bkSpine\(/, /function bkTable\(/, /function bkFocus\(/]],
      comp: ['ws-compliance.js', [/function compView\(/, /function cpHorizon\(/, /function cpQueue\(/, /function cpCase\(/]],
      client: ['ws-client.js', [/function clientView\(/, /function clIdentity\(/, /function clServices\(/, /function clPanel\(/]],
    };
    for (const p of REC.proofs) for (const re of sig[p.id][1]) expect(ws(sig[p.id][0]), `${p.id} ${re}`).toMatch(re);
  });

  it('the review offers exactly the recorded TRY demonstrations', () => {
    const review = ws('ws-review.js');
    for (const [id, labels] of Object.entries(REC.demos)) for (const l of labels) expect(review, `${id}: ${l}`).toContain(`['${l}', [`);
  });

  it('keeps the four COMPLIANCE sections in one lane and the fleet proof labelled DESIGN PROOF', () => {
    const comp = ws('ws-compliance.js');
    for (const s of ["'EXPIRATIONS'", "'DOT / SAFETY'", "'AUDITS'", "'CORRECTIVE WORK'"]) expect(comp).toContain(s);
    expect(ws('ws-fleet.js')).toContain('DESIGN PROOF');
    expect(REC.proofs.find((p) => p.id === 'fleet')!.live).toMatch(/^DESIGN_ONLY/);
  });

  it('keeps the activation gate in Client 360 and founder-only billing', () => {
    const client = ws('ws-client.js');
    expect(client).toContain('PREBUILT · NOT ACTIVE YET');
    expect(client).toMatch(/\.\.\.\(FOUNDER \? \[\['billing', 'BILLING'/);
  });
});

describe('Simulated, sample and isolated', () => {
  it('says SIMULATED on every confirmation and hides founder-only actions from staff', () => {
    const core = ws('ws-core.js');
    expect(core).toContain('SIMULATED IN THIS REVIEW — NOTHING IS SAVED OR SENT');
    expect(core).toMatch(/if \(founder && !FOUNDER\) return '';/);
  });

  it('writes nothing anywhere: no network, storage or database calls in the workspaces', () => {
    for (const f of readdirSync(WS).filter((f) => /^ws-.*\.js$/.test(f))) expect(ws(f), f).not.toMatch(/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|supabase/i);
  });

  it('shows sample amounts only — no balances', () => {
    const data = ws('ws-data.js');
    expect([...data.matchAll(/amt: '([^']+)'/g)].map((m) => m[1]).sort()).toEqual(['142.00', '64.99', '86.40']);
    expect(data).not.toMatch(/balance\s*:/i);
    expect(ws('ws-books.js')).toContain('AMOUNTS ARE SAMPLES');
  });

  it('nothing in src imports the workspaces', () => {
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, f.name);
        if (f.isDirectory()) walk(p);
        else if (/\.(ts|tsx|js|jsx)$/.test(f.name) && !/\.test\.tsx?$/.test(f.name) && /aio-office\/workspaces/.test(read(p))) hits.push(p);
      }
    };
    walk(path.join(APP, 'src'));
    expect(hits).toEqual([]);
  });
});

describe('Approved work unchanged, evidence present', () => {
  it('the approved roots are byte-for-byte what they were before this sprint (fsbw cdd43dfb)', () => {
    expect(sha(path.join(APP, 'design-authority/aio-office/studio.js'))).toBe('31f0f650cac2494e82670b52e5cb12dd7deedc9392916f2331dd2a10403f49e7');
    expect(sha(path.join(APP, 'design-authority/aio-office/studio.css'))).toBe('bdf2aa01354842a4829b8f715091d5d6a1512d0576b80b20d8b23c52509b5821');
  });

  it('the QA summary, screenshots and boards it cites are here', () => {
    const qa = JSON.parse(read(path.join(OUT, 'qa-summary.json'))) as { pass: number; fail: number; results: { ok: boolean }[] };
    expect(qa.fail).toBe(REC.qa.failures);
    expect(qa.pass).toBe(REC.qa.checks_run);
    expect(qa.results.every((r) => r.ok)).toBe(true);
    expect(readdirSync(path.join(OUT, 'screens')).filter((f) => f.endsWith('.jpg'))).toHaveLength(REC.qa.screenshots);
    for (const id of ['fleet', 'books', 'comp', 'client']) for (const d of ['phone', 'tablet', 'desktop', 'wide']) expect(existsSync(path.join(OUT, `screens/${id}--${d}.jpg`)), `${id}--${d}`).toBe(true);
    for (const b of ['diagnosis-1-one-template', 'diagnosis-2-fleet', 'diagnosis-3-bookkeeping', 'diagnosis-4-compliance', 'diagnosis-5-client', 'before-after-fleet', 'before-after-books', 'before-after-comp', 'before-after-client', 'family-roots']) expect(existsSync(path.join(OUT, `boards/${b}.jpg`)), b).toBe(true);
  });
});
