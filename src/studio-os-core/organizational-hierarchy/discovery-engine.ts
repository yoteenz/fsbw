import { explainNodeById, getSelectedNode } from './hierarchy-builder';
import type { HierarchySearchHit, OrganizationHierarchyProfile } from './types';

export function queryOrganizationalHierarchy(
  query: string,
  profile: OrganizationHierarchyProfile,
  limit = 8
): HierarchySearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: HierarchySearchHit[] = [];

  for (const node of profile.nodes) {
    const hay = `${node.label} ${node.nodeTypeLabel} ${node.department ?? ''} ${node.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'node',
        id: node.id,
        label: node.label,
        score: 70 + node.childIds.length * 2,
        matchReason: `${node.nodeTypeLabel}${node.department ? ` · ${node.department}` : ''}`,
      });
    }
  }

  for (const link of profile.links) {
    const hay = `${link.fromLabel} ${link.toLabel} ${link.linkTypeLabel} ${link.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'link',
        id: link.id,
        label: `${link.fromLabel} → ${link.toLabel}`,
        score: link.strength,
        matchReason: `${link.linkTypeLabel} · ${link.summary}`,
      });
    }
  }

  for (const route of profile.approvalRoutes) {
    if (route.label.toLowerCase().includes(q) || route.reason.toLowerCase().includes(q)) {
      hits.push({
        type: 'route',
        id: route.id,
        label: route.label,
        score: 88,
        matchReason: route.reason,
      });
    }
  }

  for (const insight of profile.insights) {
    if (insight.insight.toLowerCase().includes(q)) {
      hits.push({
        type: 'insight',
        id: insight.id,
        label: insight.insight.slice(0, 72),
        score: insight.severity === 'attention' ? 95 : insight.severity === 'watch' ? 80 : 65,
        matchReason: `${insight.category} · ${insight.severity}`,
      });
    }
  }

  const seen = new Set<string>();
  return hits
    .filter((h) => {
      const key = `${h.type}-${h.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function explainHierarchyNode(nodeId: string, profile: OrganizationHierarchyProfile): string | null {
  return explainNodeById(nodeId, profile);
}

export function getApprovalRoutingSummary(profile: OrganizationHierarchyProfile): string {
  if (!profile.approvalRoutes.length) return 'No approval routes configured yet.';
  return profile.approvalRoutes.map((r) => `${r.label}: ${r.steps.join(' → ')}`).join(' · ');
}

export function getMatrixSummary(profile: OrganizationHierarchyProfile): string {
  const matrix = profile.nodes.filter((n) => n.parentIds.length > 1);
  if (!matrix.length) return 'No matrix assignments detected.';
  return matrix.map((n) => `${n.label} supports ${n.parentIds.length} parent units`).join(' · ');
}

export function getManagerGapSummary(profile: OrganizationHierarchyProfile): string {
  const gaps = profile.insights.filter((i) => i.category === 'manager');
  if (!gaps.length) return 'All teams have active managers.';
  return gaps.map((i) => i.insight).join(' · ');
}

export function getSelectedNodeSummary(profile: OrganizationHierarchyProfile): string | null {
  const node = getSelectedNode(profile);
  if (!node) return null;
  return explainNodeById(node.id, profile);
}
