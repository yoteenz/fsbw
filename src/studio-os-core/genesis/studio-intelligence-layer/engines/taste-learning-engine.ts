import { mutateStudioIntelligenceLayerStore } from '../persistence';
import { getTasteGenome } from '../registries/intelligence-registries';
import type { XsilTasteGenomeRecord } from '../types';

/** Taste Learning Engine™ — founder creative fingerprint */
export function learnTasteFromFeedback(
  companyId: string,
  label: string,
  approved: boolean,
  rationale?: string
): XsilTasteGenomeRecord | undefined {
  const store = mutateStudioIntelligenceLayerStore((s) => {
    const idx = s.tasteRegistry.findIndex((t) => t.companyId === companyId);
    if (idx < 0) return s;
    const current = s.tasteRegistry[idx];
    const next: XsilTasteGenomeRecord = {
      ...current,
      updatedAt: new Date().toISOString(),
      approvedPatterns: approved
        ? [
            ...current.approvedPatterns,
            { patternId: `ap-${Date.now()}`, label, confidence: 70 },
          ].slice(-20)
        : current.approvedPatterns,
      rejectedPatterns: approved
        ? current.rejectedPatterns
        : [
            ...current.rejectedPatterns,
            { patternId: `rp-${Date.now()}`, label, rationale: rationale ?? 'Founder rejected' },
          ].slice(-20),
    };
    const tasteRegistry = [...s.tasteRegistry];
    tasteRegistry[idx] = next;
    return { ...s, tasteRegistry };
  });
  return store.tasteRegistry.find((t) => t.companyId === companyId);
}

export function scoreTasteFit(companyId: string, artifactSummary: string): number {
  const taste = getTasteGenome(companyId);
  if (!taste) return 50;
  const lower = artifactSummary.toLowerCase();
  let score = taste.luxuryLevel;
  for (const p of taste.approvedPatterns) {
    if (lower.includes(p.label.toLowerCase().slice(0, 8))) score += 4;
  }
  for (const p of taste.rejectedPatterns) {
    if (lower.includes(p.label.toLowerCase().slice(0, 8))) score -= 12;
  }
  return Math.max(0, Math.min(100, score));
}

export function buildTasteSummary(taste: XsilTasteGenomeRecord): string {
  return [
    `Luxury ${taste.luxuryLevel}/100`,
    `Typography: ${taste.typography.join(', ')}`,
    `Approved: ${taste.approvedPatterns.slice(0, 3).map((p) => p.label).join(', ')}`,
    `Rejected: ${taste.rejectedPatterns.slice(0, 2).map((p) => p.label).join(', ')}`,
  ].join(' · ');
}
