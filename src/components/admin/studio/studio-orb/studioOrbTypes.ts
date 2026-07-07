/** Studio Orb™ presence states — communicates intelligence through motion. */
export type StudioOrbPresenceState =
  | 'idle'
  | 'thinking'
  | 'learning'
  | 'opportunity'
  | 'completed'
  | 'focus'
  | 'presentation'
  | 'launch'
  | 'emergency';

export type StudioOrbSurface = 'command-dock' | 'page-guide' | 'life-culture' | 'voice-mode' | null;

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
  | 'search'
  | 'presentation'
  | 'founder-mode'
  | 'workspace-switcher'
  | 'quick-actions'
  | 'executive-timeline'
  | 'history'
  | 'emergency';

export type StudioOrbRadialAction = {
  id: StudioOrbRadialActionId;
  label: string;
  icon: string;
  enabled: boolean;
  hint?: string;
};

export const STUDIO_ORB_RADIAL_ACTIONS: StudioOrbRadialAction[] = [
  { id: 'command-dock', label: 'Command Dock', icon: '💬', enabled: true },
  { id: 'page-guide', label: 'Page Guide', icon: '📖', enabled: true },
  { id: 'life-culture', label: 'Life & Culture', icon: '✦', enabled: true },
  { id: 'notifications', label: 'Notifications', icon: '🔔', enabled: false, hint: 'Soon' },
  { id: 'voice', label: 'Voice Mode', icon: '🎙', enabled: true },
  { id: 'search', label: 'Search', icon: '🔍', enabled: false, hint: 'Soon' },
  { id: 'presentation', label: 'Presentation', icon: '◻', enabled: false, hint: 'Soon' },
  { id: 'founder-mode', label: 'Founder Mode', icon: '★', enabled: false, hint: 'Soon' },
  { id: 'workspace-switcher', label: 'Workspaces', icon: '⬡', enabled: false, hint: 'Soon' },
  { id: 'quick-actions', label: 'Quick Actions', icon: '⚡', enabled: false, hint: 'Soon' },
  { id: 'executive-timeline', label: 'Timeline', icon: '📅', enabled: false, hint: 'Soon' },
  { id: 'history', label: 'History', icon: '🕐', enabled: false, hint: 'Soon' },
  { id: 'emergency', label: 'Emergency', icon: '◆', enabled: false, hint: 'Soon' },
];
