import type { GoldenReference } from './types';
import { SCREEN_SEEDS } from './diff-engine';

export function buildGoldenReferences(organizationId: string): GoldenReference[] {
  void organizationId;
  const now = new Date();

  return SCREEN_SEEDS.map((screen, idx) => ({
    id: `golden-${screen.screenId}`,
    screenId: screen.screenId,
    screenLabel: screen.screenLabel,
    route: screen.route,
    approvedAt: new Date(now.getTime() - 86400000 * (30 + idx * 3)).toISOString(),
    approvedBy: idx === 0 ? 'Creative Director' : idx < 4 ? 'Design Compliance Engine' : 'Platform Governance',
    referenceVersion: `v1.${idx}.0-golden`,
    pixelDiffPct: idx === 0 ? 0 : idx < 3 ? 0.2 : 0.5,
    status: idx < 6 ? 'active' : idx === 6 ? 'pending-review' : 'active',
    description: `Golden Reference™ for ${screen.screenLabel} — canonical approved Studio OS visual baseline. Future builds compared before deployment.`,
  }));
}

export function getActiveGoldenReferences(references: GoldenReference[]): GoldenReference[] {
  return references.filter((r) => r.status === 'active');
}

export function getGoldenReferenceForScreen(references: GoldenReference[], screenId: string): GoldenReference | null {
  return references.find((r) => r.screenId === screenId && r.status === 'active') ?? null;
}

export function countActiveGoldenReferences(references: GoldenReference[]): number {
  return references.filter((r) => r.status === 'active').length;
}
