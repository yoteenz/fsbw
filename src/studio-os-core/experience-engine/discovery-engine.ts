import { buildAdaptiveEnvironmentSettings } from './environment-engine';
import { buildExperienceModeCatalog, getExperienceMode } from './mode-catalog';
import { buildContextSignalReadings } from './context-engine';
import { buildExperienceTransitionRules } from './transition-engine';
import type { ExperienceSearchHit } from './types';

export function queryExperienceEngine(query: string, activeMode: string, limit = 12): ExperienceSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const hits: ExperienceSearchHit[] = [];

  for (const m of buildExperienceModeCatalog()) {
    const blob = `${m.label} ${m.modeId} ${m.description} ${m.atmosphere}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (m.modeId.includes(term)) score += 10;
      if (m.label.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'mode', id: m.modeId, label: m.label, score, matchReason: 'experience mode' });
  }

  for (const e of buildAdaptiveEnvironmentSettings(activeMode as import('./types').ExperienceModeId)) {
    const blob = `${e.label} ${e.control} ${e.currentValue}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (e.control.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'environment', id: e.control, label: e.label, score, matchReason: 'environment control' });
  }

  for (const c of buildContextSignalReadings()) {
    const blob = `${c.label} ${c.signal} ${c.currentReading}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (c.signal.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'context', id: c.signal, label: c.label, score, matchReason: 'context signal' });
  }

  for (const t of buildExperienceTransitionRules()) {
    const blob = `${t.trigger} ${t.description} ${t.toMode}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (t.transitionId.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'transition', id: t.transitionId, label: t.trigger, score, matchReason: 'experience transition' });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainExperienceMode(modeId: string): string | null {
  const m = getExperienceMode(modeId as import('./types').ExperienceModeId);
  if (!m) return null;
  return `${m.label} — ${m.description} Atmosphere: ${m.atmosphere}`;
}
