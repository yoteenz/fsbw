import {
  ensureOrganizationInnovationExpeditionsProfile,
  getOrganizationInnovationExpeditionsProfile,
} from './store';
import { summarizeInnovationExpeditions } from './expeditions-builder';
import type { InnovationExpeditionsDockAdvice } from './types';

export function resolveInnovationExpeditionsAdvice(
  input: string,
  organizationId: string
): InnovationExpeditionsDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationInnovationExpeditionsProfile(organizationId) ??
    ensureOrganizationInnovationExpeditionsProfile(organizationId);

  if (/innovation expedition|guided tour|guided exploration|expedition hall|knowledge network/i.test(trimmed)) {
    return {
      response: summarizeInnovationExpeditions(profile),
      concierge: 'Expedition Guide',
      expeditionScore: profile.expeditionScore,
    };
  }

  if (/luxury beauty|industry expedition|walk through/i.test(trimmed)) {
    const exp = profile.expeditions.find((e) => e.id === 'exp-luxury-beauty');
    return {
      response: exp
        ? `${exp.title} — ${exp.stopCount} stops · ${exp.principleSummary}`
        : profile.dockExpeditionLine,
      concierge: 'Expedition Guide',
    };
  }

  if (/customer experience evolution|cx evolution/i.test(trimmed)) {
    const exp = profile.expeditions.find((e) => e.id === 'exp-cx-evolution');
    return {
      response: exp ? `${exp.title} — learn inside Headquarters™, not documents.` : profile.dockExpeditionLine,
      concierge: 'Expedition Guide',
    };
  }

  if (/blueprint expedition|fork|lineage tour/i.test(trimmed)) {
    const exp = profile.expeditions.find((e) => e.id === 'exp-luxury-cx-blueprint');
    return {
      response: exp
        ? `Follow ${exp.title} — original invention through Marketplace adoption.`
        : profile.dockExpeditionLine,
      concierge: 'Expedition Guide',
    };
  }

  if (/community expedition|founder talk|museum night|live event/i.test(trimmed)) {
    const event = profile.liveEvents[0];
    return {
      response: event
        ? `Next: ${event.title} — ${event.seatsRemaining} seats · ${profile.communityExpeditions.length} community expeditions.`
        : 'Community Expeditions™ — founders teach founders.',
      concierge: 'Expedition Guide',
    };
  }

  if (/beginner|intermediate|advanced|founder path|enterprise path/i.test(trimmed)) {
    return {
      response: `Active path: ${profile.activePathLevel}™ — every expedition adapts to your journey.`,
      concierge: 'Expedition Guide',
    };
  }

  if (/reward|certificate|collectible|unlock/i.test(trimmed)) {
    const count = profile.unlockedRewards.filter((r) => r.unlocked).length;
    return {
      response: `${count} rewards unlocked — completing expeditions expands Studio World.`,
      concierge: 'Expedition Guide',
    };
  }

  return null;
}

export function buildProactiveExpeditionSuggestion(organizationId: string): string | null {
  return getOrganizationInnovationExpeditionsProfile(organizationId)?.dockExpeditionLine ?? null;
}
