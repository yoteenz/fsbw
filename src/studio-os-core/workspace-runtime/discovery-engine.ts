import { buildRuntimeComponents } from './runtime-catalog';
import { buildRuntimeConfiguration } from './configuration-engine';
import { buildSandboxStatuses } from './sandbox-engine';
import type { RuntimeSearchHit } from './types';

export function queryWorkspaceRuntime(query: string, limit = 12): RuntimeSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const hits: RuntimeSearchHit[] = [];

  for (const c of buildRuntimeComponents()) {
    const blob = `${c.name} ${c.componentId} ${c.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (c.componentId.includes(term)) score += 10;
      if (c.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'component', id: c.componentId, label: c.name, score, matchReason: 'component' });
  }

  for (const cfg of buildRuntimeConfiguration()) {
    const blob = `${cfg.label} ${cfg.category} ${cfg.value}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (cfg.category.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'config', id: cfg.configId, label: cfg.label, score, matchReason: 'config' });
  }

  for (const s of buildSandboxStatuses()) {
    const blob = `${s.label} ${s.environment} ${s.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (s.environment.includes(term)) score += 10;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'sandbox', id: s.environment, label: s.label, score, matchReason: 'sandbox' });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainRuntimeComponent(componentId: string): string | null {
  const c = buildRuntimeComponents().find((x) => x.componentId === componentId);
  if (!c) return null;
  return `${c.name} — ${c.description} Status: ${c.status}. Isolated: yes.`;
}
