import { buildWorkflowNodeCatalog } from './node-catalog';
import { buildWorkflowProcessTemplates, buildOrganizationWorkflows } from './process-catalog';
import { buildTestingCapabilities } from './testing-engine';
import { buildWorkflowAnalyticsMetrics } from './analytics-engine';
import type { WorkflowSearchHit } from './types';

export function queryWorkflowEngine(query: string, organizationId: string, limit = 12): WorkflowSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const hits: WorkflowSearchHit[] = [];

  for (const n of buildWorkflowNodeCatalog()) {
    const blob = `${n.label} ${n.nodeType} ${n.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (n.nodeType.includes(term)) score += 10;
      if (n.label.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'node', id: n.nodeType, label: n.label, score, matchReason: 'builder node' });
  }

  for (const p of buildWorkflowProcessTemplates()) {
    const blob = `${p.name} ${p.processId} ${p.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (p.processId.includes(term)) score += 10;
      if (p.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'process', id: p.processId, label: p.name, score, matchReason: 'process template' });
  }

  for (const w of buildOrganizationWorkflows(organizationId)) {
    const blob = `${w.name} ${w.workflowId} ${w.processType}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (w.workflowId.includes(term)) score += 10;
      if (w.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'workflow', id: w.workflowId, label: w.name, score, matchReason: 'active workflow' });
  }

  for (const t of buildTestingCapabilities()) {
    const blob = `${t.label} ${t.mode} ${t.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (t.mode.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'testing', id: t.mode, label: t.label, score, matchReason: 'testing mode' });
  }

  for (const m of buildWorkflowAnalyticsMetrics()) {
    const blob = `${m.label} ${m.metricId} ${m.detail}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (m.metricId.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'analytics', id: m.metricId, label: m.label, score, matchReason: 'analytics metric' });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainWorkflowNode(nodeType: string): string | null {
  const n = buildWorkflowNodeCatalog().find((x) => x.nodeType === nodeType);
  if (!n) return null;
  return `${n.label} — ${n.description} Drag-and-drop in visual builder. Category: ${n.category}.`;
}

export function explainProcessTemplate(processId: string): string | null {
  const p = buildWorkflowProcessTemplates().find((x) => x.processId === processId);
  if (!p) return null;
  return `${p.name} — ${p.description} ${p.nodeCount} nodes · ${p.status}.`;
}
