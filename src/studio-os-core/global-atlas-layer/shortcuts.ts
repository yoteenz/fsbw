/**
 * Global Atlas Layer™ — intelligent shortcuts (recent, frequent, recommended).
 */

import { buildAtlasCatalog, getAtlasNode } from '../studio-world-atlas/catalog';
import type { AtlasNode } from '../studio-world-atlas/types';
import { resolveAtlasContextForPath } from './context';
import { resolveGlobalAtlasLocation } from './location-resolver';
import { listGlobalAtlasVisits } from './store';
import type { GlobalAtlasShortcut } from './types';

function visitCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of listGlobalAtlasVisits(32)) {
    counts.set(v.path, (counts.get(v.path) ?? 0) + 1);
  }
  return counts;
}

function nodeByDisplayName(catalog: AtlasNode[], names: string[]): AtlasNode | undefined {
  for (const name of names) {
    const hit = catalog.find(
      (n) => n.displayName.toLowerCase().includes(name.toLowerCase()) && n.travelPath
    );
    if (hit) return hit;
  }
  return undefined;
}

export function buildGlobalAtlasShortcuts(pathname: string, companyName = 'Frontal Slayer'): GlobalAtlasShortcut[] {
  const catalog = buildAtlasCatalog(companyName);
  const context = resolveAtlasContextForPath(pathname);
  const location = resolveGlobalAtlasLocation(pathname, companyName);
  const counts = visitCounts();
  const shortcuts: GlobalAtlasShortcut[] = [];
  const seen = new Set<string>();

  const push = (s: GlobalAtlasShortcut) => {
    if (seen.has(s.id)) return;
    seen.add(s.id);
    shortcuts.push(s);
  };

  if (location.nodeId !== 'atlas-world-root') {
    push({
      id: 'current-here',
      label: 'You are here',
      nodeId: location.nodeId,
      travelPath: pathname,
      kind: 'continue',
    });
  }

  const last = listGlobalAtlasVisits(1)[0];
  if (last && last.path !== pathname) {
    push({
      id: `continue-${last.path}`,
      label: 'Continue where I left off',
      nodeId: last.nodeId,
      travelPath: last.path,
      kind: 'continue',
    });
  }

  for (const visit of listGlobalAtlasVisits(8)) {
    if (visit.path === pathname) continue;
    push({
      id: `recent-${visit.path}`,
      label: visit.label.split(' → ').pop() ?? visit.label,
      nodeId: visit.nodeId,
      travelPath: visit.path,
      kind: 'recent',
      visitCount: counts.get(visit.path) ?? 1,
    });
  }

  const frequent = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  for (const [path, count] of frequent) {
    if (path === pathname) continue;
    const visit = listGlobalAtlasVisits(32).find((v) => v.path === path);
    if (!visit) continue;
    push({
      id: `freq-${path}`,
      label: `Frequent · ${visit.label.split(' → ').pop() ?? visit.label}`,
      nodeId: visit.nodeId,
      travelPath: path,
      kind: 'frequent',
      visitCount: count,
    });
  }

  for (const dest of context.priorityDestinations) {
    const node = nodeByDisplayName(catalog, [dest]);
    if (!node || node.id === location.nodeId) continue;
    push({
      id: `rec-${node.id}`,
      label: dest,
      nodeId: node.id,
      travelPath: node.travelPath,
      kind: 'recommended',
    });
  }

  const cds = getAtlasNode('flagship-creative-direction-studio', catalog);
  if (cds && !seen.has(`rec-${cds.id}`)) {
    push({
      id: `rec-${cds.id}`,
      label: 'Creative Direction Studio™',
      nodeId: cds.id,
      travelPath: cds.travelPath,
      kind: 'recommended',
    });
  }

  return shortcuts.slice(0, 10);
}
