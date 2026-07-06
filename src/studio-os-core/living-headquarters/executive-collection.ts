import { EXECUTIVE_ARTIFACT_MAP } from './constants';
import type { ExecutiveArtifact } from './types';

type MilestoneLike = { id: string; label: string; recordedAt: string };

/** Executive Collection™ — earned physical artifacts inside Headquarters. */
export function buildExecutiveCollection(milestones: MilestoneLike[]): ExecutiveArtifact[] {
  const artifacts: ExecutiveArtifact[] = [];

  for (const m of milestones) {
    const def = EXECUTIVE_ARTIFACT_MAP[m.id];
    if (!def) continue;
    artifacts.push({
      id: `artifact-${m.id}`,
      label: def.label,
      kind: def.kind,
      milestoneId: m.id,
      unlockedAt: m.recordedAt,
      description: def.description,
    });
  }

  return artifacts.sort(
    (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
  );
}
