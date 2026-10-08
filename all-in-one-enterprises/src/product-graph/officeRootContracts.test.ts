/**
 * P0.AIO.OFFICE-IA.FOUNDER-HOME-WORK-REPORTS-MORE.AUTHORITY-CONTRACTS1 — the AIO OFFICE root authority contracts
 * (HOME · WORK · REPORTS · MORE), vendored from SITE00, held to this repo: every cited file and line exists, every
 * identifier a source / record / metric / gap names sits on its cited lines, every route it names is declared, every
 * IA node it names exists in the vendored overlay, and every copied file matches its SITE00 provenance.
 * Contract only — nothing in src imports these docs; no page, nav, route, schema or auth change.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { officeIaNode } from './officeInformationArchitecture';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const DOCS = path.join(APP, 'docs/aio/office-contracts');

type Source = { source_id: string; label: string; owner_node: string; route: string | null; data_source: string; evidence: string[]; visibility: Record<string, string> };
type Region = { region_id: string; sources: Source[] };
type Action = { action_id: string; kind: string; owner_node: string; route: string | null; evidence: string[] };
type Contracts = {
  sprint: string;
  roots: { root_id: string; stance: string; owns: string[]; may_mutate: string[]; regions: Region[]; actions: Action[] }[];
  lanes: { lane_id: string; records: { record: string; evidence: string }[]; related: { node_id: string }[]; gaps: string[] }[];
  metrics: { metric_id: string; domain_node: string; classification: string; backing: string; state: string; source: string; derivation: string | null; evidence: string[] }[];
  more_entries: { entry_id: string; state: string; evidence: string[] }[];
  ownership: Record<string, string | null>[];
  permissions: { scope: string; access: Record<string, string> }[];
  client_safe: { staff_node: string; client_node: string; evidence: string[] }[];
  gaps: { gap_id: string; kind: string; gap: string; evidence: string[] }[];
  privileged_roles: { role: string; acts: { node_ids: string[]; evidence: string[] }[] }[];
};
const C = JSON.parse(readFileSync(path.join(DOCS, 'AIO_OFFICE_ROOT_CONTRACTS.json'), 'utf8')) as Contracts;
const shownAsData = (s: string) => s === 'AVAILABLE' || s === 'PARTIAL';

const CITE = /((?:all-in-one-enterprises|api)\/[\w/.-]+\.(?:tsx?|sql|json))(?::(\d+)(?:-(\d+))?)?/g;
const cites = (s: string) => [...s.matchAll(CITE)].map((m) => ({ file: m[1], from: m[2] ? +m[2] : null, to: m[2] ? +(m[3] ?? m[2]) : null }));
const lines = new Map<string, string[]>();
const fileLines = (f: string) => {
  if (!lines.has(f)) lines.set(f, readFileSync(path.join(REPO, f), 'utf8').split('\n'));
  return lines.get(f)!;
};
const windows = (evidence: string[]) => evidence.flatMap(cites).filter((c) => c.from !== null).map((c) => fileLines(c.file).slice(c.from! - 1, c.to!).join('\n'));
/** Code identifiers in contract prose: PascalCase / camelCase with an inner capital, or a Supabase table name. */
const identifiers = (t: string) => [...new Set([...t.matchAll(/\b(?:[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+|[a-z][a-z0-9]*(?:[A-Z][a-z0-9]*)+|aio_[a-z0-9_]+)\b/g)].map((m) => m[0]))];

function allEvidence(): string[] {
  return [
    ...C.roots.flatMap((r) => [...r.regions.flatMap((x) => x.sources.flatMap((s) => s.evidence)), ...r.actions.flatMap((a) => a.evidence)]),
    ...C.lanes.flatMap((l) => l.records.map((x) => x.evidence)),
    ...C.metrics.flatMap((m) => m.evidence),
    ...C.more_entries.flatMap((e) => e.evidence),
    ...C.client_safe.flatMap((x) => x.evidence),
    ...C.gaps.flatMap((g) => g.evidence),
    ...C.privileged_roles.flatMap((r) => r.acts.flatMap((a) => a.evidence)),
  ];
}

describe('Office root contracts ↔ source evidence', () => {
  it('every cited file exists and every cited line is in range', () => {
    const all = allEvidence().flatMap(cites);
    expect(all.length).toBeGreaterThan(300);
    for (const c of all) {
      expect(existsSync(path.join(REPO, c.file)), c.file).toBe(true);
      if (c.to !== null) expect(c.to, `${c.file}:${c.from}-${c.to}`).toBeLessThanOrEqual(fileLines(c.file).length);
    }
  });

  it('every identifier-bearing source, record, metric and gap names something on its cited lines', () => {
    const items: [string, string, string[]][] = [
      ...C.roots.flatMap((r) => r.regions.filter((x) => !x.region_id.endsWith('WORK_ACROSS_AIO')).flatMap((x) => x.sources.map((s) => [`source ${s.source_id}`, `${s.data_source} ${s.label}`, s.evidence] as [string, string, string[]]))),
      ...C.lanes.flatMap((l) => l.records.map((x) => [`record ${l.lane_id}`, x.record, [x.evidence]] as [string, string, string[]])),
      ...C.metrics.map((m) => [`metric ${m.metric_id}`, `${m.source} ${m.derivation ?? ''}`, m.evidence] as [string, string, string[]]),
      ...C.gaps.map((g) => [`gap ${g.gap_id}`, g.gap, g.evidence] as [string, string, string[]]),
    ];
    const bad: string[] = [];
    let checked = 0;
    for (const [name, text, evidence] of items) {
      const w = windows(evidence);
      const ids = identifiers(text);
      if (!w.length || !ids.length) continue;
      checked++;
      if (!ids.some((id) => w.some((win) => win.includes(id)))) bad.push(`${name}: none of ${ids.join(' ')} on ${evidence.join(' | ')}`);
    }
    expect(checked).toBeGreaterThan(120);
    expect(bad).toEqual([]);
  });

  it('every route a contract names is declared in OfficeRoutes; a cited route line declares it', () => {
    const routeFile = 'all-in-one-enterprises/src/office/routes/OfficeRoutes.tsx';
    const declared = fileLines(routeFile).flatMap((l) => [...l.matchAll(/path="([^"]+)"/g)].map((m) => m[1]));
    const re = (p: string) => new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z]+/g, '[^/]+')}$`);
    const matches = (rel: string, set: string[]) => set.some((p) => re(p).test(rel)) || set.some((p) => set.some((q) => re(`${p}/${q}`).test(rel)));
    const named: { id: string; route: string; evidence: string[] }[] = C.roots.flatMap((r) => [
      ...r.regions.flatMap((x) => x.sources.filter((s) => s.route).map((s) => ({ id: s.source_id, route: s.route!, evidence: s.evidence }))),
      ...r.actions.filter((a) => a.route).map((a) => ({ id: a.action_id, route: a.route!, evidence: a.evidence })),
    ]);
    expect(named.length).toBeGreaterThan(40);
    for (const n of named) {
      expect(n.route.startsWith('/office'), n.id).toBe(true);
      if (n.route !== '/office') expect(matches(n.route.replace(/^\/office\//, ''), declared), `${n.id} ${n.route}`).toBe(true);
      for (const c of n.evidence.flatMap(cites).filter((x) => x.file === routeFile && x.from !== null)) {
        const win = fileLines(routeFile).slice(c.from! - 1, c.to!).flatMap((l) => [...l.matchAll(/path="([^"]+)"/g)].map((m) => m[1]));
        expect(matches(n.route.replace(/^\/office\//, ''), win), `${n.id} ${n.route} @ ${c.from}-${c.to}`).toBe(true);
      }
    }
  });
});

describe('Office root contracts ↔ the vendored office IA', () => {
  it('every node a contract names exists in the IA overlay', () => {
    const ids = [
      ...C.roots.map((r) => r.root_id),
      ...C.roots.flatMap((r) => [...r.regions.flatMap((x) => x.sources.map((s) => s.owner_node)), ...r.actions.map((a) => a.owner_node)]),
      ...C.lanes.flatMap((l) => [l.lane_id, ...l.related.map((x) => x.node_id)]),
      ...C.metrics.map((m) => m.domain_node),
      ...C.more_entries.map((e) => e.entry_id),
      ...C.ownership.flatMap((o) => ['canonical_owner', 'home_projection', 'work_production', 'reports_aggregation', 'more_admin', 'client_safe_projection'].map((k) => o[k]).filter((x): x is string => !!x)),
      ...C.client_safe.flatMap((x) => [x.staff_node, x.client_node]),
      ...C.privileged_roles.flatMap((r) => r.acts.flatMap((a) => a.node_ids)),
    ];
    for (const id of ids) expect(officeIaNode(id), id).toBeDefined();
  });

  it('keeps HOME projection-only, REPORTS read-only, clients and providers out of AIO OFFICE', () => {
    const home = C.roots.find((r) => r.root_id === 'AIO_OFFICE.HOME')!;
    expect(home.owns).toEqual([]);
    expect(home.may_mutate).toEqual([]);
    expect(home.actions.every((a) => a.kind === 'ROUTE')).toBe(true);
    expect(C.roots.find((r) => r.root_id === 'AIO_OFFICE.REPORTS')!.may_mutate).toEqual([]);
    for (const p of C.permissions.filter((x) => x.scope.startsWith('AIO_OFFICE'))) expect([p.access.CLIENT, p.access.SERVICE_PROVIDER], p.scope).toEqual(['NONE', 'NONE']);
    for (const r of C.roots) for (const reg of r.regions) for (const s of reg.sources) expect(s.visibility.CLIENT, s.source_id).toBe('NONE');
  });

  it('shows no unsupported metric as data and no metric as production-backed', () => {
    for (const m of C.metrics) {
      if (m.classification === 'NOT_IMPLEMENTED' || m.classification === 'DERIVED_UNSUPPORTED') expect(shownAsData(m.state), m.metric_id).toBe(false);
      expect(m.backing, m.metric_id).not.toBe('PRODUCTION');
    }
  });

  it('keeps the known gaps and the verified privacy gaps recorded', () => {
    const ids = C.gaps.map((g) => g.gap_id);
    for (const g of ['G-ROAD-READY-NO-ENGAGEMENT-STATE', 'G-FOUNDER-ROLE-NOT-IMPLEMENTED', 'G-VEHICLES-NO-STAFF-SCREEN']) expect(ids, g).toContain(g);
    expect(C.gaps.filter((g) => g.kind === 'PRIVACY')).toHaveLength(12);
    expect(JSON.stringify(C)).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });
});

describe('Office root contracts ↔ SITE00 provenance', () => {
  const prov = JSON.parse(readFileSync(path.join(DOCS, 'PROVENANCE.json'), 'utf8')) as { sprint: string; sha256: Record<string, string> };

  it('every copied file matches its sha256, and the gate is ready for founder review', () => {
    expect(prov.sprint).toBe(C.sprint);
    expect(Object.keys(prov.sha256)).toHaveLength(19);
    expect(readdirSync(DOCS).sort()).toEqual([...Object.keys(prov.sha256), 'PROVENANCE.json'].sort());
    for (const [f, sha] of Object.entries(prov.sha256)) expect(createHash('sha256').update(readFileSync(path.join(DOCS, f))).digest('hex'), f).toBe(sha);
    const gate = JSON.parse(readFileSync(path.join(DOCS, 'QUALITY_GATE.json'), 'utf8')) as { checks: { key: string; value: string }[]; violations: string[] };
    expect(gate.violations).toEqual([]);
    expect(gate.checks.find((c) => c.key === 'READY_FOR_FOUNDER_CONTRACT_REVIEW')!.value).toBe('YES');
  });

  it('is docs only: nothing in src imports the contracts', () => {
    const importers: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && readFileSync(p, 'utf8').includes('office-contracts')) importers.push(p);
      }
    };
    walk(path.join(APP, 'src'));
    expect(importers).toEqual([]);
  });
});
