import { mutateLiveValidationSystemStore, readLiveValidationSystemStore } from '../persistence';
import type { LvsDiaryAnswer, LvsDiaryPrompt, LvsRuntimeInput } from '../types';

/** Founder Diary Engine™ — adaptive reflection prompts and answers */
export function listDiaryPrompts(limit = 50): LvsDiaryPrompt[] {
  return [...readLiveValidationSystemStore().diaryPrompts]
    .sort((a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime())
    .slice(0, limit);
}

export function listPendingDiaryPrompts(): LvsDiaryPrompt[] {
  return readLiveValidationSystemStore().diaryPrompts.filter(
    (p) => !p.answeredAt && !p.skipped
  );
}

export function listDiaryAnswers(limit = 50): LvsDiaryAnswer[] {
  return [...readLiveValidationSystemStore().diaryAnswers]
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, limit);
}

export function computeDiaryAnswerRate(): number {
  const store = readLiveValidationSystemStore();
  const asked = store.diaryPrompts.filter((p) => !p.skipped).length;
  if (asked === 0) return 0;
  const answered = store.diaryAnswers.length;
  return Math.round((answered / asked) * 100);
}

export function shouldAskDiaryPrompt(_input: LvsRuntimeInput): boolean {
  const store = readLiveValidationSystemStore();
  if (store.diaryPaused) return false;
  const pending = listPendingDiaryPrompts();
  if (pending.length >= 2) return false;
  const recent = store.diaryPrompts.filter((p) => {
    const hours = (Date.now() - new Date(p.askedAt).getTime()) / 3600000;
    return hours < 8;
  });
  return recent.length < 1;
}

export function buildAdaptiveDiaryPrompt(input: LvsRuntimeInput): LvsDiaryPrompt | null {
  if (!shouldAskDiaryPrompt(input)) return null;

  const store = readLiveValidationSystemStore();
  const recentEscape = store.escapeEvents[store.escapeEvents.length - 1];
  const lowHealth = store.systemHealth.find((h) => h.overallHealth < 65);

  if (recentEscape && recentEscape.confidence >= 0.6) {
    return {
      promptId: `diary-prompt-${Date.now()}`,
      question: `When you moved to ${recentEscape.destinationLabel} for ${recentEscape.context}, was Studio OS missing something — or was that the right external tool?`,
      triggerKind: 'escape-event',
      systemIds: [recentEscape.systemId],
      missionId: recentEscape.missionId,
      quickAnswers: ['Missing capability', 'Faster elsewhere', 'Intentional external tool', 'Not sure yet'],
      askedAt: new Date().toISOString(),
      skipped: false,
    };
  }

  if (lowHealth) {
    return {
      promptId: `diary-prompt-${Date.now()}`,
      question: `${lowHealth.officialName} feels underused lately. Is it friction, timing, or simply not part of today's work?`,
      triggerKind: 'low-system-health',
      systemIds: [lowHealth.systemId],
      quickAnswers: ['Friction', 'Not needed today', 'Still learning it', 'Needs improvement'],
      askedAt: new Date().toISOString(),
      skipped: false,
    };
  }

  return {
    promptId: `diary-prompt-${Date.now()}`,
    question: 'What felt most useful in Studio OS today — and what still pulled you elsewhere?',
    triggerKind: 'daily-reflection',
    systemIds: ['orb', 'executive-headquarters'],
    quickAnswers: ['Orb helped', 'HQ helped', 'Both helped', 'Still pulled elsewhere'],
    askedAt: new Date().toISOString(),
    skipped: false,
  };
}

export function recordDiaryAnswer(
  promptId: string,
  response: string,
  quickAnswer?: string
): LvsDiaryAnswer {
  const answer: LvsDiaryAnswer = {
    answerId: `diary-answer-${Date.now()}`,
    promptId,
    response,
    quickAnswer,
    sentiments: inferSentiments(response, quickAnswer),
    sentimentConfidence: 0.72,
    systemIds: [],
    shouldAffectValidation: true,
    shouldBecomeGenesisLearning: response.length > 20,
    recordedAt: new Date().toISOString(),
  };

  mutateLiveValidationSystemStore((store) => ({
    ...store,
    diaryAnswers: [...store.diaryAnswers, answer],
    diaryPrompts: store.diaryPrompts.map((p) =>
      p.promptId === promptId ? { ...p, answeredAt: answer.recordedAt } : p
    ),
  }));

  return answer;
}

function inferSentiments(
  response: string,
  quickAnswer?: string
): LvsDiaryAnswer['sentiments'] {
  const text = `${response} ${quickAnswer ?? ''}`.toLowerCase();
  const sentiments: LvsDiaryAnswer['sentiments'] = [];
  if (text.includes('friction') || text.includes('stress')) sentiments.push('frustration', 'stress');
  if (text.includes('help') || text.includes('useful')) sentiments.push('confidence', 'trust');
  if (text.includes('missing')) sentiments.push('confusion');
  if (text.includes('intentional')) sentiments.push('calm');
  if (sentiments.length === 0) sentiments.push('indifference');
  return sentiments;
}
