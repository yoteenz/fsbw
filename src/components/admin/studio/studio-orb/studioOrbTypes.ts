/** Studio Orb™ presence states — Living Light™ communicates through motion. */
export type StudioOrbPresenceState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'learning'
  | 'opportunity'
  | 'completed'
  | 'discovery'
  | 'civilization-event'
  | 'legendary-discovery'
  | 'focus'
  | 'presentation'
  | 'launch'
  | 'emergency';

export type StudioOrbSurface =
  | 'command-dock'
  | 'page-guide'
  | 'life-culture'
  | 'voice-mode'
  | 'recommendations'
  | 'executive-workspace'
  | null;

export type StudioOrbPosition = {
  bottom: number;
  right: number;
};

export type StudioOrbRadialActionId =
  | 'command-dock'
  | 'page-guide'
  | 'life-culture'
  | 'notifications'
  | 'voice'
  | 'world-atlas'
  | 'search'
  | 'presentation'
  | 'founder-mode'
  | 'workspace-switcher'
  | 'quick-actions'
  | 'executive-timeline'
  | 'history'
  | 'emergency';

/** Premium 3D icon sculpture IDs — never emoji */
export type StudioOrbIconId =
  | 'command-dock'
  | 'page-guide'
  | 'life-culture'
  | 'daily-brief'
  | 'voice'
  | 'atlas'
  | 'museum'
  | 'marketplace'
  | 'knowledge'
  | 'innovation'
  | 'disabled';

export type StudioOrbRadialAction = {
  id: StudioOrbRadialActionId;
  label: string;
  iconId: StudioOrbIconId;
  enabled: boolean;
  hint?: string;
};

export const STUDIO_ORB_RADIAL_ACTIONS: StudioOrbRadialAction[] = [
  { id: 'command-dock', label: 'Command Dock', iconId: 'command-dock', enabled: true },
  { id: 'page-guide', label: 'Page Guide', iconId: 'page-guide', enabled: true },
  { id: 'life-culture', label: 'Life & Culture', iconId: 'life-culture', enabled: true },
  { id: 'notifications', label: 'Daily Brief', iconId: 'daily-brief', enabled: true },
  { id: 'voice', label: 'Voice Mode', iconId: 'voice', enabled: true },
  { id: 'world-atlas', label: 'World Atlas', iconId: 'atlas', enabled: true },
  { id: 'search', label: 'Search', iconId: 'disabled', enabled: false, hint: 'Soon' },
  { id: 'presentation', label: 'Presentation', iconId: 'disabled', enabled: false, hint: 'Soon' },
  { id: 'founder-mode', label: 'Founder Mode', iconId: 'disabled', enabled: false, hint: 'Soon' },
  { id: 'workspace-switcher', label: 'Workspaces', iconId: 'disabled', enabled: false, hint: 'Soon' },
  { id: 'quick-actions', label: 'Quick Actions', iconId: 'disabled', enabled: false, hint: 'Soon' },
  { id: 'executive-timeline', label: 'Timeline', iconId: 'disabled', enabled: false, hint: 'Soon' },
  { id: 'history', label: 'History', iconId: 'disabled', enabled: false, hint: 'Soon' },
  { id: 'emergency', label: 'Emergency', iconId: 'disabled', enabled: false, hint: 'Soon' },
];
