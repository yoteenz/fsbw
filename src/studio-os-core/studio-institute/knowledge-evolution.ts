import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';

export type KnowledgeEvolutionEvent = {
  id: string;
  source: 'brain-update' | 'regulation' | 'workflow' | 'lesson' | 'shortcut' | 'improvement';
  title: string;
  impact: string;
  compounded: boolean;
};

export function buildKnowledgeEvolutionTimeline(
  profile: OrganizationProfessionBrainProfile
): KnowledgeEvolutionEvent[] {
  const events: KnowledgeEvolutionEvent[] = [];

  for (const brain of profile.brains) {
    events.push({
      id: `evo-${brain.id}`,
      source: 'brain-update',
      title: `${brain.label} knowledge compounded`,
      impact: `${brain.knowledgeEntries.length} entries · ${brain.judgmentPatterns.length} judgment patterns feeding future lessons.`,
      compounded: true,
    });
  }

  for (const entry of profile.brains.flatMap((b) => b.knowledgeEntries).filter((e) => e.kind === 'regulation')) {
    events.push({
      id: `evo-reg-${entry.id}`,
      source: 'regulation',
      title: entry.title,
      impact: 'Regulation change triggers automatic lesson refresh across Institute.',
      compounded: true,
    });
  }

  for (const signal of profile.livingSignals) {
    events.push({
      id: `evo-live-${signal.id}`,
      source: 'improvement',
      title: signal.phrase,
      impact: signal.resolved ? 'Resolved — Institute synchronized.' : 'Pending — generate training lesson?',
      compounded: signal.resolved,
    });
  }

  return events.slice(0, 16);
}

export function summarizeEvolution(events: KnowledgeEvolutionEvent[]): string {
  const compounded = events.filter((e) => e.compounded).length;
  return `${compounded} knowledge evolutions compounded · Institute grows as the organization grows.`;
}
