import type { OrbConversationEntry, OrbRuntimeInput } from '../types';
import { buildOrbArrivalGreeting, buildOrbExecutiveBriefing } from '../briefings/briefing-engine';
import { buildOrbRecommendations } from '../recommendations/recommendation-engine';
import { orbEngineNow } from '../context/context-engine';
import { mutateOrbStore, readOrbStore } from '../persistence';

function seedConversationTimeline(input: OrbRuntimeInput): OrbConversationEntry[] {
  const timestamp = orbEngineNow();
  const briefing = buildOrbExecutiveBriefing(input);
  const topRec = buildOrbRecommendations()[0];
  return [
    {
      entryId: 'conv-arrival',
      kind: 'greeting',
      role: 'executive-advisor',
      speaker: 'orb',
      content: buildOrbArrivalGreeting(input),
      sourceSystems: ['Identity Engine™', 'Executive Headquarters™'],
      timestamp,
    },
    {
      entryId: 'conv-briefing',
      kind: 'briefing',
      role: 'executive-advisor',
      speaker: 'orb',
      content: briefing.paragraph,
      sourceSystems: briefing.sourceSystems,
      timestamp,
    },
    {
      entryId: 'conv-recommendation',
      kind: 'recommendation',
      role: 'chief-strategist',
      speaker: 'orb',
      content: topRec ? `${topRec.title} — ${topRec.reason}` : 'No recommendation staged.',
      sourceSystems: topRec?.sourceSystems,
      timestamp,
    },
  ];
}

export function listOrbConversationTimeline(): OrbConversationEntry[] {
  return readOrbStore().conversationTimeline;
}

export function appendOrbConversationEntry(
  entry: Omit<OrbConversationEntry, 'entryId' | 'timestamp'>
): OrbConversationEntry {
  const full: OrbConversationEntry = {
    ...entry,
    entryId: `conv-${Date.now()}`,
    timestamp: orbEngineNow(),
  };
  mutateOrbStore((store) => ({
    ...store,
    conversationTimeline: [full, ...store.conversationTimeline].slice(0, 100),
  }));
  return full;
}

export function seedOrbConversationTimeline(input: OrbRuntimeInput): void {
  const store = readOrbStore();
  if (store.conversationTimeline.length > 0) return;
  mutateOrbStore((current) => ({
    ...current,
    conversationTimeline: seedConversationTimeline(input),
  }));
}

export function recordFounderOrbMessage(content: string): OrbConversationEntry {
  return appendOrbConversationEntry({
    kind: 'system',
    role: 'executive-advisor',
    speaker: 'founder',
    content,
  });
}

export function recordOrbResponse(
  content: string,
  kind: OrbConversationEntry['kind'] = 'system',
  role: OrbConversationEntry['role'] = 'executive-advisor',
  sourceSystems?: string[]
): OrbConversationEntry {
  return appendOrbConversationEntry({
    kind,
    role,
    speaker: 'orb',
    content,
    sourceSystems,
  });
}
