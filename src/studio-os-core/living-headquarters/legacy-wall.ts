import { FRONTAL_SLAYER_LEGACY_DEMO, LEGACY_WALL_MILESTONE_MAP } from './constants';
import type { LegacyWallEntry, LivingHeadquartersInput } from './types';

type MilestoneLike = { id: string; label: string; description: string; recordedAt: string };

function entryFromMilestone(m: MilestoneLike): LegacyWallEntry | null {
  const mapped = LEGACY_WALL_MILESTONE_MAP[m.id];
  if (mapped) {
    return {
      id: `wall-${m.id}`,
      label: mapped.label,
      engravedAt: m.recordedAt,
      category: mapped.category,
      detail: mapped.detail ?? m.description,
    };
  }
  return {
    id: `wall-${m.id}`,
    label: m.label,
    engravedAt: m.recordedAt,
    category: 'award',
    detail: m.description,
  };
}

/** Legacy Wall™ — permanent architectural history, sorted newest engravings first. */
export function buildLegacyWall(
  input: LivingHeadquartersInput,
  milestones: MilestoneLike[]
): LegacyWallEntry[] {
  const byId = new Map<string, LegacyWallEntry>();

  for (const m of milestones) {
    const entry = entryFromMilestone(m);
    if (entry) byId.set(entry.id, entry);
  }

  if (input.supplementalWallEntries) {
    for (const e of input.supplementalWallEntries) byId.set(e.id, e);
  }

  if (input.organizationId === 'frontal-slayer' && byId.size < 3) {
    for (const e of FRONTAL_SLAYER_LEGACY_DEMO) byId.set(e.id, e);
  }

  if ((input.pagesPublished ?? 0) >= 100 && !byId.has('wall-first-100-pages')) {
    byId.set('wall-first-100-pages', {
      id: 'wall-first-100-pages',
      label: '100 Knowledge Assets',
      engravedAt: new Date().toISOString(),
      category: 'knowledge',
    });
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.engravedAt).getTime() - new Date(a.engravedAt).getTime()
  );
}
