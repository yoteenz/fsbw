import type { AchievementRecord, ProfessionalMemoryRecord } from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function achievementsFromMemories(memories: ProfessionalMemoryRecord[]): AchievementRecord[] {
  return memories
    .filter((memory) =>
      memory.signals.some((signal) =>
        ['achievement', 'certification', 'award', 'promotion', 'competition'].includes(signal)
      )
    )
    .map((memory) => ({
      id: uid('achievement'),
      learnerId: memory.learnerId,
      profession: memory.profession,
      worldId: memory.worldId,
      title: memory.title,
      earnedAt: memory.occurredAt,
      category: inferAchievementCategory(memory),
      importance: memory.importance,
      memoryId: memory.id,
      summary: memory.summary,
    }));
}

function inferAchievementCategory(
  memory: ProfessionalMemoryRecord
): AchievementRecord['category'] {
  if (memory.signals.includes('certification')) return 'certification';
  if (memory.signals.includes('promotion')) return 'promotion';
  if (memory.signals.includes('competition')) return 'competition';
  if (memory.signals.includes('community-contribution')) return 'community';
  if (memory.signals.includes('award')) return 'award';
  return 'milestone';
}

export function upsertAchievement(
  achievements: AchievementRecord[],
  achievement: AchievementRecord
): AchievementRecord[] {
  return [...achievements.filter((item) => item.id !== achievement.id), achievement];
}

export function topAchievements(
  achievements: AchievementRecord[],
  limit = 5
): AchievementRecord[] {
  return [...achievements].sort((a, b) => b.importance - a.importance).slice(0, limit);
}
