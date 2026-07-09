import { listEscapePatterns } from '../../live-validation-system/escape-velocity/escape-velocity-engine';
import { readEvolutionRoomStore, mutateEvolutionRoomStore } from '../persistence';
import type { ErAutomationSuggestion } from '../types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SEED_AUTOMATION: Omit<ErAutomationSuggestion, 'suggestionId'>[] = [
  {
    title: 'Monthly Evolution Brief auto-generation',
    repeatedTask: 'Compile validation signals into executive brief',
    estimatedMinutesSaved: 45,
    confidence: 0.9,
    riskLevel: 'low',
    approvalRequired: true,
  },
  {
    title: 'Genesis proposal queue digest',
    repeatedTask: 'Summarize queued proposals before Evolution Council',
    estimatedMinutesSaved: 20,
    confidence: 0.85,
    riskLevel: 'low',
    approvalRequired: true,
  },
  {
    title: 'Launch Stack progress snapshot',
    repeatedTask: 'Weekly Launch Stack status rollup for Mission Control',
    estimatedMinutesSaved: 15,
    confidence: 0.88,
    riskLevel: 'low',
    approvalRequired: false,
  },
];

export function seedAutomationSuggestions(): void {
  const store = readEvolutionRoomStore();
  if (store.automationSuggestions.length > 0) return;
  mutateEvolutionRoomStore((s) => ({
    ...s,
    automationSuggestions: SEED_AUTOMATION.map((a) => ({ ...a, suggestionId: id('auto') })),
  }));
}

export function listAutomationSuggestions(): ErAutomationSuggestion[] {
  seedAutomationSuggestions();
  const base = readEvolutionRoomStore().automationSuggestions;

  const escapeAutomations: ErAutomationSuggestion[] = listEscapePatterns()
    .filter((p) => p.recommendedOutcome === 'replace' && p.occurrenceCount >= 2)
    .slice(0, 3)
    .map((p) => ({
      suggestionId: id('auto'),
      title: `Automate ${p.destinationCategory} capture`,
      repeatedTask: `Founder repeatedly escapes to ${p.destinationCategory}`,
      estimatedMinutesSaved: p.occurrenceCount * 8,
      confidence: Math.min(0.9, 0.5 + p.occurrenceCount * 0.08),
      riskLevel: 'medium' as const,
      approvalRequired: true,
    }));

  return [...base, ...escapeAutomations];
}
