import type { CommunicationStyle } from './types';

const STYLE_PREFIX: Record<CommunicationStyle, string> = {
  executive: '',
  professional: '',
  teacher: 'Here is what I am observing: ',
  coach: 'A thoughtful next step: ',
  advisor: 'My recommendation: ',
  encouraging: 'You are making progress — ',
  minimal: '',
  friendly: '',
  collaborative: 'Together, ',
};

/** Adapt Studio Intelligence™ copy while preserving factual content. */
export function adaptIntelligenceVoice(text: string, style: CommunicationStyle): string {
  if (!text.trim()) return text;
  const prefix = STYLE_PREFIX[style];
  if (!prefix) return text;
  if (text.startsWith(prefix.trim())) return text;
  return `${prefix}${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

export function resolveCommunicationStyle(
  layers: Array<{ communicationStyle: CommunicationStyle }>
): CommunicationStyle {
  for (const layer of layers) {
    if (layer.communicationStyle) return layer.communicationStyle;
  }
  return 'professional';
}
