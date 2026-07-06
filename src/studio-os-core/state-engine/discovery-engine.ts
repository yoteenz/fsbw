import { buildStateHistoryRecords } from './history-engine';
import { buildStateObjectCatalog } from './object-catalog';
import { buildLifecycleStateCatalog } from './state-catalog';
import { buildCanonicalTransitionRules } from './transition-engine';
import type { StateSearchHit } from './types';

export function queryStateEngine(query: string, organizationId: string, limit = 12): StateSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const hits: StateSearchHit[] = [];

  for (const s of buildLifecycleStateCatalog()) {
    const blob = `${s.label} ${s.state} ${s.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (s.state.includes(term)) score += 10;
      if (s.label.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'state', id: s.state, label: s.label, score, matchReason: 'lifecycle state' });
  }

  for (const o of buildStateObjectCatalog()) {
    const blob = `${o.label} ${o.objectType} ${o.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (o.objectType.includes(term)) score += 10;
      if (o.label.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'object', id: o.objectType, label: o.label, score, matchReason: 'managed object' });
  }

  for (const t of buildCanonicalTransitionRules()) {
    const blob = `${t.label} ${t.from} ${t.to}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (t.transitionId.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'transition', id: t.transitionId, label: t.label, score, matchReason: 'transition rule' });
  }

  for (const h of buildStateHistoryRecords(organizationId)) {
    const blob = `${h.objectName} ${h.currentState} ${h.previousState} ${h.reason}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (h.currentState.includes(term)) score += 10;
      if (h.objectName.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'history', id: h.recordId, label: h.objectName, score, matchReason: 'history record' });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainLifecycleState(state: string): string | null {
  const s = buildLifecycleStateCatalog().find((x) => x.state === state);
  if (!s) return null;
  return `${s.label} — ${s.description} Terminal: ${s.terminal ? 'yes' : 'no'}.`;
}

export function explainTransition(transitionId: string): string | null {
  const t = buildCanonicalTransitionRules().find((x) => x.transitionId === transitionId);
  if (!t) return null;
  return `${t.label}: ${t.from} → ${t.to}. Approval: ${t.requiresApproval ? 'required' : 'none'}. Policy enforced.`;
}
