import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import {
  COMMUNICATION_CONTEXT_LABELS,
  COMMUNICATION_CONTEXTS,
  COMMUNICATION_STYLE_DESCRIPTIONS,
} from './constants';
import type { CommunicationContext, CommunicationStyleSnapshot } from './types';

const EXAMPLE_PHRASES: Record<(typeof COMMUNICATION_CONTEXTS)[number], string> = {
  'busy-day': '"Three priorities today. Everything else can wait."',
  'creative-session': '"Take your time — I\'ll hold operational noise until you\'re ready."',
  'executive-planning': '"Here\'s the strategic landscape — decisions ranked by impact."',
  'learning-mode': '"Let me walk you through why this works — no rush."',
  emergency: '"One action now. Details follow once stabilized."',
};

export function buildCommunicationStyles(organizationId: string): {
  styles: CommunicationStyleSnapshot[];
  activeContext: CommunicationContext;
} {
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const hour = new Date().getHours();
  let activeContext: CommunicationContext = 'learning-mode';

  if (cognitive?.loadState === 'critical') activeContext = 'emergency';
  else if (cognitive?.activeAttentionMode === 'creating') activeContext = 'creative-session';
  else if (cognitive?.activeAttentionMode === 'strategic-deep-work') activeContext = 'executive-planning';
  else if (cognitive?.loadState === 'elevated') activeContext = 'busy-day';
  else if (hour >= 9 && hour <= 11) activeContext = 'executive-planning';
  else if (hour >= 20 || hour <= 6) activeContext = 'creative-session';

  const styles = COMMUNICATION_CONTEXTS.map((context) => ({
    context,
    label: COMMUNICATION_CONTEXT_LABELS[context],
    active: context === activeContext,
    styleDescription: COMMUNICATION_STYLE_DESCRIPTIONS[context],
    examplePhrase: EXAMPLE_PHRASES[context],
  }));

  return { styles, activeContext };
}

export function activeCommunicationPhrase(context: CommunicationContext): string {
  return EXAMPLE_PHRASES[context];
}
