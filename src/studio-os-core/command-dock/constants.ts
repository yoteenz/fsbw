/** Command Dock V1.0 — executive command console for Studio OS (Milestone 82). */

export const COMMAND_DOCK_STORAGE_KEY = 'studioOsCommandDock_v1';
export const COMMAND_DOCK_VERSION = '1.0.0';
export const COMMAND_DOCK_ID = 'command-dock';

export const COMMAND_DOCK_PHILOSOPHY = [
  'You don\'t operate Studio OS. You lead it.',
  'Founders should not navigate software — they should lead organizations.',
  'The Command Dock is the executive command console — not a chatbot, search bar, or command palette.',
] as const;

export const FOUNDER_DISPLAY_NAME = 'Kateena';

export const COMMAND_TYPES = [
  'scheduling',
  'publishing',
  'campaigns',
  'projects',
  'approvals',
  'executive-requests',
  'organization-settings',
  'knowledge-search',
  'creative-requests',
  'production',
  'analytics',
  'revenue',
  'hiring',
  'meetings',
  'travel',
  'personal-life',
  'strategy',
  'automation',
] as const;

export type CommandType = (typeof COMMAND_TYPES)[number];

export const DOCK_COMMAND_EXAMPLES = [
  'Move tomorrow\'s meeting.',
  'Schedule a photoshoot.',
  'Prepare launch assets.',
  'Delay Noir by two weeks.',
  'Block Friday morning for strategy.',
  'Review today\'s content.',
  'Generate tomorrow\'s publishing schedule.',
  'Find time for a vacation.',
] as const;

export const MICROINTERACTION_PHASES = [
  'Chief Concierge coordinating…',
  'Brand Concierge reviewing…',
  'Growth Concierge forecasting…',
  'Technology Concierge updating…',
  'Knowledge Concierge researching…',
] as const;

export const DOCK_CONNECTED_SYSTEMS = [
  'Concierge Routing',
  'Executive Timeline',
  'Mission Control',
  'Production Studio',
  'Publishing',
  'Campaign Engine',
  'Organization Intelligence',
] as const;
