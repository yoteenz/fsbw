import type { CommandType } from './constants';
import type { FounderCommandRoute } from '../concierge-routing/types';

export type DockExpansionSize = 'compact' | 'medium' | 'large';

export type CommandHistoryEntry = {
  id: string;
  rawText: string;
  routedAt: string;
  primaryConcierge: string;
  intent: string;
  status: 'applied' | 'cancelled' | 'pending';
};

export type FavoriteCommand = {
  id: string;
  label: string;
  rawText: string;
};

export type RecurringCommand = {
  id: string;
  label: string;
  rawText: string;
  cadence: string;
};

export type ProactiveDockSuggestion = {
  id: string;
  insight: string;
  concierge: string;
  suggestedCommand?: string;
};

export type DockContextProfile = {
  contextId: string;
  label: string;
  portfolioMode: boolean;
  suggestedCommands: string[];
  commandTypes: CommandType[];
};

export type DockCapability = {
  id: string;
  moduleId: string;
  label: string;
  commandTypes: CommandType[];
  examplePhrases: string[];
};

export type CommandDockStore = {
  version: string;
  lastUpdatedAt: string;
  philosophy: string[];
  expansionSize: DockExpansionSize;
  dockInput: string;
  isFocused: boolean;
  processingActive: boolean;
  activeMicrointeraction: string | null;
  microinteractionQueue: string[];
  pendingRoute: FounderCommandRoute | null;
  askWhyAnswer: string | null;
  lastRoutingSummary: string | null;
  proactiveSuggestion: ProactiveDockSuggestion | null;
  recentCommands: CommandHistoryEntry[];
  favoriteCommands: FavoriteCommand[];
  recurringCommands: RecurringCommand[];
  recommendedAutomations: string[];
  showHistoryPanel: boolean;
  contextProfile: DockContextProfile | null;
};
