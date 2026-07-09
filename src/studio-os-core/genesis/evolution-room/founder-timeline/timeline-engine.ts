import { listDiaryAnswers } from '../../live-validation-system/founder-diary/diary-engine';
import { listArchitecturalHistory } from '../../live-validation-system/genesis-learning/proposal-engine';
import { readEvolutionRoomStore } from '../persistence';
import type { ErFounderTimelineEntry } from '../types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildFounderTimeline(): ErFounderTimelineEntry[] {
  const store = readEvolutionRoomStore();
  const persisted = store.founderTimeline;

  const diaryEntries: ErFounderTimelineEntry[] = listDiaryAnswers(12).map((a) => ({
    entryId: id('founder'),
    date: a.recordedAt,
    title: 'Founder Reflection',
    category: 'reflection' as const,
    summary: a.response.slice(0, 160),
    evidence: a.sentiments.length ? [`Sentiments: ${a.sentiments.join(', ')}`] : [],
    sentiment: a.sentiments.includes('frustration') || a.sentiments.includes('stress')
      ? 'concern'
      : a.sentiments.includes('delight') || a.sentiments.includes('confidence')
        ? 'positive'
        : 'neutral',
  }));

  const historyEntries: ErFounderTimelineEntry[] = listArchitecturalHistory(8).map((h) => ({
    entryId: id('founder'),
    date: h.timestamp,
    title: h.action.replace(/-/g, ' '),
    category: 'decision' as const,
    summary: h.detail,
    evidence: [`Actor: ${h.actor}`],
    sentiment: h.action.includes('accepted') ? 'positive' : 'neutral',
  }));

  return [...persisted, ...diaryEntries, ...historyEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 24);
}
