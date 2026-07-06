import {
  readMemoryEngineStore,
  writeMemoryEngineStore,
  getOrganizationMemoryProfile,
} from '../memory-engine/store';
import type { MemoryRecord } from '../memory-engine/types';
import { WISDOM_LEARNING_TARGETS } from './constants';
import type { OrganizationalLearningImpact, WisdomEntry, WisdomLearningTarget } from './types';

const LEARNING_LABELS: Record<WisdomLearningTarget, string> = {
  'profession-brain': 'Profession Brain™',
  'digital-concierges': 'Digital Concierges',
  'studio-institute': 'Studio Institute™',
  automation: 'Automation',
  'executive-council': 'Executive Council',
  'future-recommendations': 'Future Recommendations',
};

const LEARNING_DESCRIPTIONS: Record<WisdomLearningTarget, string> = {
  'profession-brain': 'Wisdom enriches institutional expertise and SOP coverage.',
  'digital-concierges': 'Concierges reference preserved wisdom in founder guidance.',
  'studio-institute': 'Lessons become training modules for future generations.',
  automation: 'Repeatable wisdom informs workflow and Digital Staff rules.',
  'executive-council': 'Council deliberations consult organizational wisdom library.',
  'future-recommendations': 'Compounding wisdom improves every proactive recommendation.',
};

export function computeLearningImpacts(entries: WisdomEntry[]): OrganizationalLearningImpact[] {
  return WISDOM_LEARNING_TARGETS.map((target) => {
    const impactCount = entries.filter((e) => e.syncedTo.includes(target)).length;
    return {
      target,
      label: LEARNING_LABELS[target],
      impactCount,
      description: LEARNING_DESCRIPTIONS[target],
    };
  });
}

export function defaultSyncedTargets(category: WisdomEntry['category']): WisdomLearningTarget[] {
  const base: WisdomLearningTarget[] = ['future-recommendations', 'digital-concierges'];
  if (category === 'profession-brain' || category === 'lessons-learned') {
    return [...base, 'profession-brain', 'studio-institute'];
  }
  if (category === 'leadership' || category === 'growth') {
    return [...base, 'executive-council', 'profession-brain'];
  }
  if (category === 'operations') {
    return [...base, 'automation', 'profession-brain'];
  }
  return [...base, 'studio-institute'];
}

export function syncWisdomToMemoryEngine(organizationId: string, entry: WisdomEntry): void {
  const profile = getOrganizationMemoryProfile(organizationId);
  if (!profile) return;

  const memoryRecord: MemoryRecord = {
    id: `mem-wisdom-${entry.id}`,
    type: 'lesson',
    title: `Wisdom: ${entry.wisdom.slice(0, 60)}`,
    summary: `${entry.wisdom} — ${entry.whyItMatters}`,
    outcome: 'success',
    occurredAt: entry.capturedAt,
    tags: ['wisdom-capture', entry.category, ...entry.searchableTags.slice(0, 4)],
    sourceModule: 'wisdom-capture',
    wouldRepeat: true,
  };

  const store = readMemoryEngineStore();
  const nextProfiles = store.profiles.map((p) => {
    if (p.organizationId !== organizationId) return p;
    if (p.records.some((r) => r.id === memoryRecord.id)) return p;
    return {
      ...p,
      records: [memoryRecord, ...p.records],
      totalLessonsCaptured: p.totalLessonsCaptured + 1,
      updatedAt: new Date().toISOString(),
    };
  });

  writeMemoryEngineStore({ ...store, profiles: nextProfiles });
}

export function computeWisdomDepthScore(entryCount: number, pendingCount: number): number {
  return Math.min(98, Math.max(0, 20 + entryCount * 6 - pendingCount * 2));
}
