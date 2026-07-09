import { mutateStudioIntelligenceLayerStore, readStudioIntelligenceLayerStore } from '../persistence';
import type { XsilCanonCandidate, XsilCanonClass } from '../types';

/** Canon Engine™ — founder-approved canonization governance */
export function proposeCanonCandidate(input: Omit<XsilCanonCandidate, 'candidateId' | 'createdAt' | 'status' | 'founderReviewRequired'>): XsilCanonCandidate {
  const candidate: XsilCanonCandidate = {
    ...input,
    candidateId: `canon-${Date.now()}`,
    status: 'pending',
    founderReviewRequired: true,
    createdAt: new Date().toISOString(),
  };
  mutateStudioIntelligenceLayerStore((s) => ({
    ...s,
    canonRegistry: [candidate, ...s.canonRegistry].slice(0, 50),
  }));
  return candidate;
}

export function reviewCanonCandidate(
  candidateId: string,
  decision: 'approved' | 'rejected' | 'revision'
): XsilCanonCandidate | undefined {
  let updated: XsilCanonCandidate | undefined;
  mutateStudioIntelligenceLayerStore((s) => {
    const canonRegistry = s.canonRegistry.map((c) => {
      if (c.candidateId !== candidateId) return c;
      updated = { ...c, status: decision };
      return updated;
    });
    return { ...s, canonRegistry };
  });
  return updated;
}

export function classifyInformation(summary: string): XsilCanonClass {
  const lower = summary.toLowerCase();
  if (lower.includes('genesis') || lower.includes('amendment')) return 'genesis-amendment';
  if (lower.includes('brand')) return 'brand-canon';
  if (lower.includes('knowledge') || lower.includes('institute')) return 'knowledge-canon';
  if (lower.includes('experience') || lower.includes('dna')) return 'experience-dna';
  if (lower.includes('prompt')) return 'prompt-library-asset';
  if (lower.includes('experiment') || lower.includes('trial')) return 'experiment';
  if (lower.includes('archive')) return 'archive';
  if (lower.includes('platform')) return 'platform-pattern';
  if (lower.includes('company') || lower.includes('manual') || lower.includes('sop')) return 'company-canon';
  return 'temporary';
}

export function listPendingCanonReview(): XsilCanonCandidate[] {
  return readStudioIntelligenceLayerStore().canonRegistry.filter((c) => c.status === 'pending');
}

export function getCanonClassLabel(c: XsilCanonClass): string {
  return c.replace(/-/g, ' ');
}
