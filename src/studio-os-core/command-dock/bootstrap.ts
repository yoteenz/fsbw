import { COMMAND_DOCK_PHILOSOPHY } from './constants';
import { bootstrapCommandDockStore } from './store';
import type { CommandDockStore } from './types';

export function buildCommandDockSeed(): Partial<CommandDockStore> {
  return {
    philosophy: [...COMMAND_DOCK_PHILOSOPHY],
    favoriteCommands: [
      { id: 'fav-1', label: 'CLEAR AFTERNOON', rawText: 'Clear my afternoon.' },
      { id: 'fav-2', label: 'DEEP WORK FRIDAY', rawText: 'Block Friday morning for strategy.' },
      { id: 'fav-3', label: 'TODAY\'S CONTENT', rawText: 'Review today\'s content.' },
    ],
    recurringCommands: [
      { id: 'rec-1', label: 'MORNING PRIORITIES', rawText: 'What are today\'s priorities?', cadence: 'Every weekday · 8 AM' },
      { id: 'rec-2', label: 'PUBLISHING SCHEDULE', rawText: 'Generate tomorrow\'s publishing schedule.', cadence: 'Every evening' },
    ],
    recommendedAutomations: [
      'Auto-defer non-critical meetings during travel weeks',
      'Soft-approve routine publishing when confidence exceeds 90%',
    ],
    proactiveSuggestion: {
      id: 'pro-1',
      insight: 'Brand Concierge recommends reviewing today\'s thumbnail before publish.',
      concierge: 'Brand Concierge',
      suggestedCommand: 'Review today\'s content.',
    },
    recentCommands: [],
  };
}

export function bootstrapCommandDockPlatform(): void {
  bootstrapCommandDockStore(buildCommandDockSeed());
}
