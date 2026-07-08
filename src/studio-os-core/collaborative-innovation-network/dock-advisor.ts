import {
  ensureOrganizationCollaborativeInnovationNetworkProfile,
  getOrganizationCollaborativeInnovationNetworkProfile,
} from './store';
import { summarizeCollaborativeInnovationNetwork } from './network-builder';
import type { CollaborativeInnovationNetworkDockAdvice } from './types';

export function resolveCollaborativeInnovationNetworkAdvice(
  input: string,
  organizationId: string
): CollaborativeInnovationNetworkDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationCollaborativeInnovationNetworkProfile(organizationId) ??
    ensureOrganizationCollaborativeInnovationNetworkProfile(organizationId);

  if (
    /collaborative innovation|innovation network|co-invent|invent together|shared innovation/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeCollaborativeInnovationNetwork(profile),
      concierge: 'Collaboration Curator',
      innovationNetworkScore: profile.innovationNetworkScore,
      liveCollaborators: profile.summary.liveCollaborators,
    };
  }

  if (/complement|recommend.*founder|compatible.*genome/i.test(trimmed)) {
    const top = profile.recommendations.sort((a, b) => b.complementScore - a.complementScore)[0];
    return {
      response: top
        ? `${top.headline} ${top.rationale} Invite into ${top.suggestedWorkspace}.`
        : profile.dockCollaborationLine,
      concierge: 'Collaboration Curator',
    };
  }

  if (/original innovation|publish|joint patent|royalt/i.test(trimmed)) {
    const pending = profile.jointInnovations.find((j) => !j.published);
    const published = profile.jointInnovations.find((j) => j.published);
    const target = pending ?? published;
    return {
      response: target
        ? `"${target.title}" — ${target.innovationId}. ${target.published ? `Published ${target.visibilityLabel}.` : 'Ready to publish with transparent contribution percentages.'}`
        : profile.dockCollaborationLine,
      concierge: 'Collaboration Curator',
    };
  }

  if (/live collab|presence|who is in|collaborators in/i.test(trimmed)) {
    const lines = profile.liveCollaborators
      .filter((p) => p.status === 'active')
      .map((p) => `${p.role} inside ${p.currentRoomLabel}`)
      .join(' · ');
    return {
      response: lines || profile.dockCollaborationLine,
      concierge: 'Collaboration Curator',
      liveCollaborators: profile.summary.liveCollaborators,
    };
  }

  return null;
}

export function buildProactiveCollaborationSuggestion(
  organizationId: string
): string | null {
  const profile = getOrganizationCollaborativeInnovationNetworkProfile(organizationId);
  if (!profile) return null;
  return profile.dockCollaborationLine;
}
