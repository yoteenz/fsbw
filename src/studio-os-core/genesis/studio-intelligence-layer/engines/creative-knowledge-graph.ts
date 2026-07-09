import { listCreativeForCompany } from '../registries/intelligence-registries';
import type { XsilCreativeNode } from '../types';

/** Creative Knowledge Graph™ */
export function exploreCreativeGraph(companyId: string, tag?: string): XsilCreativeNode[] {
  const nodes = listCreativeForCompany(companyId);
  if (!tag) return nodes;
  const q = tag.toLowerCase();
  return nodes.filter((n) => n.tags.some((t) => t.includes(q)) || n.title.toLowerCase().includes(q));
}

export function getRelatedCreativeNodes(nodeId: string, companyId: string): XsilCreativeNode[] {
  const nodes = listCreativeForCompany(companyId);
  const node = nodes.find((n) => n.nodeId === nodeId);
  if (!node) return [];
  return nodes.filter((n) => node.relatedNodeIds.includes(n.nodeId));
}

export function searchCreativeGraph(companyId: string, query: string): XsilCreativeNode[] {
  const q = query.trim().toLowerCase();
  return listCreativeForCompany(companyId).filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.nodeType.includes(q) ||
      n.tags.some((t) => t.includes(q))
  );
}

export function buildCreativeGraphSummary(companyId: string): { nodeCount: number; approved: number; types: string[] } {
  const nodes = listCreativeForCompany(companyId);
  return {
    nodeCount: nodes.length,
    approved: nodes.filter((n) => n.approvalStatus === 'approved').length,
    types: [...new Set(nodes.map((n) => n.nodeType))],
  };
}
