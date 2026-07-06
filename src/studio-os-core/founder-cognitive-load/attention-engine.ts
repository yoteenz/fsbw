import { ATTENTION_MODE_LABELS, ATTENTION_MODES } from './constants';
import type { AttentionMode, AttentionModeSnapshot, LoadState } from './types';

function detectActiveMode(loadState: LoadState): AttentionMode {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  if (hour >= 9 && hour <= 11 && day >= 1 && day <= 5) return 'in-meetings';
  if (hour >= 14 && hour <= 16) return 'strategic-deep-work';
  if (hour >= 20 || hour <= 6) return 'creating';
  if (hour >= 12 && hour <= 13) return 'reviewing';
  if (day === 0 || day === 6) return 'traveling';
  if (loadState === 'elevated' || loadState === 'critical') return 'presenting';
  return 'reviewing';
}

const COMMUNICATION_STYLES: Record<(typeof ATTENTION_MODES)[number], string> = {
  creating: 'Minimal interruptions · async summaries only · protect creative flow',
  reviewing: 'Concise bullet summaries · batch related items · no pop-up alerts',
  presenting: 'Non-essential activity hidden · only urgent escalations surface',
  traveling: 'Deferred notifications · single end-of-day briefing prepared',
  'in-meetings': 'Silent mode · post-meeting digest queued · approvals batched',
  'strategic-deep-work': 'Deep focus shield · Command Dock whispers, never shouts',
};

export function buildAttentionModes(loadState: LoadState): {
  modes: AttentionModeSnapshot[];
  activeMode: AttentionMode;
} {
  const activeMode = detectActiveMode(loadState);

  const modes = ATTENTION_MODES.map((mode) => ({
    mode,
    label: ATTENTION_MODE_LABELS[mode],
    detected: mode === activeMode,
    communicationStyle: COMMUNICATION_STYLES[mode],
  }));

  return { modes, activeMode };
}

export function communicationAdjustment(activeMode: AttentionMode): string {
  return COMMUNICATION_STYLES[activeMode];
}
