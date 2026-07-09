import { getAudienceDna } from '../registries/intelligence-registries';
import type { XsilAudienceDnaRecord } from '../types';

/** Audience Intelligence Engine™ */
export function buildAudienceBrief(companyId: string): string {
  const a = getAudienceDna(companyId);
  if (!a) return 'Audience DNA not loaded';
  return `${a.segmentName}: ${a.psychographics}. Desire: ${a.desiredTransformation}. Triggers: ${a.emotionalTriggers.join(', ')}`;
}

export function scoreAudienceFit(companyId: string, message: string): number {
  const a = getAudienceDna(companyId);
  if (!a) return 50;
  const lower = message.toLowerCase();
  let score = 65;
  for (const t of [...a.emotionalTriggers, ...a.buyingMotivations]) {
    if (lower.includes(t.toLowerCase())) score += 5;
  }
  if (lower.includes(a.desiredTransformation.toLowerCase().slice(0, 12))) score += 10;
  return Math.max(0, Math.min(100, score));
}

export function summarizeAudience(a: XsilAudienceDnaRecord): string {
  return `${a.segmentName} · ${a.luxuryExpectations} · Pain: ${a.painPoints.slice(0, 2).join(', ')}`;
}
