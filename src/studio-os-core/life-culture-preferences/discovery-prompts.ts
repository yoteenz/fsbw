import { hasAnyLifeCultureConfiguration } from './store';
import type { LifeCulturePreferencesStore } from './types';

export type GentleDiscoveryPrompt = {
  id: string;
  message: string;
  ctaLabel: string;
};

export function buildGentleDiscoveryPrompts(
  store: LifeCulturePreferencesStore,
  options?: { organizationAnniversarySoon?: boolean }
): GentleDiscoveryPrompt[] {
  const prompts: GentleDiscoveryPrompt[] = [];

  if (!hasAnyLifeCultureConfiguration(store) && !store.discoveryDismissedIds.includes('intro-life-culture')) {
    prompts.push({
      id: 'intro-life-culture',
      message:
        "I haven't personalized your Life & Culture Preferences™ yet. Would you like to tell me about the moments that matter most to you?",
      ctaLabel: 'Open Life & Culture Preferences',
    });
  }

  if (options?.organizationAnniversarySoon && !store.discoveryDismissedIds.includes('org-anniversary-ask')) {
    const orgPref = store.layers.organization.holidayResponses['org-anniversary'];
    if (!orgPref || orgPref === 'unset' || orgPref === 'ask-each-time') {
      prompts.push({
        id: 'org-anniversary-ask',
        message:
          "I noticed your organization's anniversary is approaching. Would you like Headquarters to recognize it?",
        ctaLabel: 'Set preference',
      });
    }
  }

  return prompts.filter((p) => !store.discoveryDismissedIds.includes(p.id)).slice(0, 2);
}
