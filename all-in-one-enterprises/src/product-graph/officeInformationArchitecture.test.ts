/**
 * P0.AIO.OFFICE-IA.FOUNDER-WORK-TREE-AND-CLIENT-OFFICE-CANONICALIZATION1 — the vendored office information architecture
 * held to this repo: the runtime product graph, the route files it cites, the migration authority manifest, and its
 * SITE00 provenance. Architecture only — nothing here changes a page, the nav, a route or the schema.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getOfficeInformationArchitecture, officeIaChildren, officeIaNode, officeRootNav } from './officeInformationArchitecture';
import { getRouteMetaRegistry, getRuntimeProductGraph } from './runtimeGraph';

const APP = path.resolve(__dirname, '../..');
const REPO = path.resolve(APP, '..');
const IA = getOfficeInformationArchitecture();
const isOfficeRoute = (p: string) => p === '/office' || p.startsWith('/office/');

describe('Office IA overlay — founder decision', () => {
  it('carries the sprint, the lineage mark and both root navs', () => {
    expect(IA.sprint).toBe('P0.AIO.OFFICE-IA.FOUNDER-WORK-TREE-AND-CLIENT-OFFICE-CANONICALIZATION1');
    expect(IA.lineage_id).toBe('SUPERSEDED_BY_AIO_OFFICE_WORK_TREE1');
    expect(officeRootNav('AIO_OFFICE')).toEqual(['HOME', 'INTAKE', 'WORK', 'REPORTS', 'MORE']);
    expect(officeRootNav('CLIENT_OFFICE')).toEqual(['MY BUSINESS', 'OPERATIONS', 'FINANCES', 'VAULT', 'INBOX', 'SERVICES', 'ACCOUNT']);
    expect(officeIaChildren('AIO_OFFICE.WORK').map((n) => n.label)).toContain('Filing & Fuel Taxes');
    expect(officeIaChildren('AIO_OFFICE.WORK.FILING_FUEL_TAXES')[0].label).toBe('IFTA');
  });

  it('keeps the staff / client firewall: no client sees AIO OFFICE, no client node routes into /office', () => {
    for (const n of IA.nodes.filter((x) => x.shell_id === 'AIO_OFFICE')) expect(n.visibility.CLIENT, n.node_id).toBe('HIDDEN');
    for (const n of IA.nodes.filter((x) => x.shell_id === 'CLIENT_OFFICE')) {
      expect(n.role, n.node_id).not.toBe('ENTRY');
      for (const r of n.routes) expect(isOfficeRoute(r.path), `${n.node_id} → ${r.path}`).toBe(false);
    }
  });

  it('is data only: no page, layout or nav imports it (live nav unchanged)', () => {
    const importers: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name) && !p.includes(`${path.sep}product-graph${path.sep}`) && readFileSync(p, 'utf8').includes('officeInformationArchitecture')) importers.push(p);
      }
    };
    walk(path.join(APP, 'src'));
    expect(importers).toEqual([]);
    expect(readFileSync(path.join(__dirname, 'officeInformationArchitecture.ts'), 'utf8')).not.toMatch(/from 'react'|\.tsx'/);
  });
});

describe('Office IA overlay ↔ runtime product graph', () => {
  const graph = getRuntimeProductGraph();
  const pg = IA.product_graph_map;

  it('maps every customer container and every family, and states today’s graph nav truthfully', () => {
    expect(pg.containers.map((c) => c.container).sort()).toEqual(Object.keys(graph.containers).sort());
    expect(pg.families.map((f) => f.family)).toEqual(graph.families.map((f) => f.id));
    for (const f of pg.families) expect(f.graph_nav, f.family).toBe(graph.families.find((g) => g.id === f.family)!.nav);
    for (const id of [...pg.containers.map((c) => c.ia_node), ...pg.families.flatMap((f) => [f.client_node, f.staff_node]), ...pg.role_projections.map((p) => p.ia_node)]) if (id) expect(officeIaNode(id), id).toBeDefined();
    expect(pg.role_projections.map((p) => p.projection).sort()).toEqual([...graph.role_projections].map(String).sort());
  });

  it('every route the architecture cites as EXISTING is in the graph, or is a declared gap the graph predates', () => {
    const known = new Set([...graph.nodes.map((n) => n.route), ...getRouteMetaRegistry().entries.map((e) => e.path)]);
    const covered = (p: string) => pg.route_gaps.some((g) => (g.exact ? p === g.prefix : p === g.prefix || p.startsWith(`${g.prefix}/`) || p === g.prefix.replace(/\/\*$/, '') || (g.prefix.endsWith('/*') && p.startsWith(g.prefix.slice(0, -1)))));
    const missing = [...new Set(IA.nodes.flatMap((n) => n.routes).filter((r) => r.status === 'EXISTING').map((r) => r.path))].filter((p) => !known.has(p) && !covered(p));
    expect(missing).toEqual([]);
  });

  it('client destinations never sit on graph routes that belong to the AIO_OFFICE projection', () => {
    const office = new Set(graph.nodes.filter((n) => n.role_projection === 'AIO_OFFICE').map((n) => n.route));
    for (const n of IA.nodes.filter((x) => x.shell_id === 'CLIENT_OFFICE')) for (const r of n.routes) expect(office.has(r.path), `${n.node_id} → ${r.path}`).toBe(false);
  });
});

describe('Office IA overlay ↔ source evidence', () => {
  const cites = (s: string) => [...s.matchAll(/(all-in-one-enterprises\/src\/[\w/.-]+\.(?:tsx?|json)):(\d+)(?:-(\d+))?/g)].map((m) => ({ file: m[1], from: +m[2], to: +(m[3] ?? m[2]) }));
  const lines = new Map<string, string[]>();
  const fileLines = (f: string) => {
    if (!lines.has(f)) lines.set(f, readFileSync(path.join(REPO, f), 'utf8').split('\n'));
    return lines.get(f)!;
  };

  it('every file:line it cites exists and is in range', () => {
    const all = [
      ...IA.nodes.flatMap((n) => [...n.evidence, ...n.routes.map((r) => r.evidence)]),
      ...IA.services.map((s) => s.canonical_data_source),
      ...IA.legacy.map((l) => l.ref),
    ].flatMap(cites);
    expect(all.length).toBeGreaterThan(150);
    for (const c of all) {
      expect(existsSync(path.join(REPO, c.file)), c.file).toBe(true);
      expect(c.to, `${c.file}:${c.from}-${c.to}`).toBeLessThanOrEqual(fileLines(c.file).length);
    }
  });

  it('each EXISTING route cited on a route-file line is declared on that line', () => {
    const pattern = (p: string) => new RegExp(`(^|/)${p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z]+/g, '[^/]+').replace(/\*/g, '.*')}$`);
    const bad: string[] = [];
    for (const n of IA.nodes) for (const r of n.routes.filter((x) => x.status === 'EXISTING')) {
      for (const c of cites(r.evidence).filter((x) => /Routes\.tsx$/.test(x.file))) {
        const window = fileLines(c.file).slice(c.from - 1, c.to);
        const paths = window.flatMap((l) => [...l.matchAll(/path="([^"]+)"/g)].map((m) => m[1]));
        const isIndex = (r.path === '/office' || r.path === '/portal') && window.some((l) => /<Route index|path="portal"/.test(l));
        const group = r.path.endsWith('/*') && paths.some((p) => `/office/${p}`.startsWith(r.path.slice(0, -1)));
        if (!isIndex && !group && !paths.some((p) => pattern(p).test(r.path))) bad.push(`${n.node_id} ${r.path} @ ${c.file}:${c.from}-${c.to}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('Office IA overlay ↔ migration authority manifest', () => {
  const manifest = JSON.parse(readFileSync(path.join(REPO, 'AIO_CLIENT_MIGRATION_AUTHORITY/authority-manifest.json'), 'utf8')) as { authority_id: string; status: string; route: string; superseded_by?: string }[];
  const MAS = IA.migration_authority_set;
  const homes = new Map<string, string[]>();
  for (const n of IA.nodes) for (const a of n.authority_refs.filter((x) => x.startsWith('AIO-MIG-'))) homes.set(a, [...(homes.get(a) ?? []), n.node_id]);

  it('records the manifest statuses as they are', () => {
    expect(manifest.length).toBe(MAS.total);
    expect(manifest.filter((a) => a.status === 'APPROVED_AUTHORITY').length).toBe(MAS.approved);
    expect(manifest.filter((a) => a.status === 'FOUNDER_REVIEW_REQUIRED').map((a) => a.authority_id)).toEqual(MAS.founder_review_required);
    expect(manifest.filter((a) => a.status === 'SUPERSEDED').map((a) => [a.authority_id, a.superseded_by])).toEqual(MAS.superseded.map((s) => [s.authority_id, s.superseded_by]));
  });

  it('re-associates every current authority exactly once, on a node that carries its route; superseded plates stay lineage', () => {
    for (const a of manifest) {
      const at = homes.get(a.authority_id) ?? [];
      if (a.status === 'SUPERSEDED') {
        expect(at, a.authority_id).toEqual([]);
        continue;
      }
      expect(at.length, a.authority_id).toBe(1);
      const node = officeIaNode(at[0])!;
      expect(a.route.startsWith('/office/migration') ? node.node_id.startsWith('AIO_OFFICE.INTAKE') : node.node_id === 'CLIENT_OFFICE.ACTIVATION', a.authority_id).toBe(true);
      expect(node.routes.map((r) => r.path), a.authority_id).toContain(a.route.split('#')[0]);
    }
  });
});

describe('Office IA docs ↔ SITE00 provenance', () => {
  const DOCS = path.join(APP, 'docs/aio/office-ia');
  const prov = JSON.parse(readFileSync(path.join(DOCS, 'PROVENANCE.json'), 'utf8')) as { sha256: Record<string, string> };

  it('the overlay is byte-identical to the copied AIO_OFFICE_IA.json and every copied file matches its sha256', () => {
    expect(readFileSync(path.join(__dirname, 'officeInformationArchitecture.json'), 'utf8')).toBe(readFileSync(path.join(DOCS, 'AIO_OFFICE_IA.json'), 'utf8'));
    expect(Object.keys(prov.sha256).length).toBe(24);
    for (const [f, sha] of Object.entries(prov.sha256)) expect(createHash('sha256').update(readFileSync(path.join(DOCS, f))).digest('hex'), f).toBe(sha);
  });
});
