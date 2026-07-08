/**
 * Collaborative Innovation Network™ — Orb Collaboration Curator.
 */

import type { CollaboratorRecommendation, JointInnovationRecord } from './types';

export type CollaborationCuratorLine = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
};

function uid(): string {
  return `curator-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const COLLABORATION_CURATOR_ROLE = 'Collaboration Curator';
export const COLLABORATION_CURATOR_GREETING =
  'Innovation District™ — founders co-invent here. I help you build relationships, not just projects.';
export const COLLABORATION_CURATOR_ACCENT = '#7c5cff';

export function buildCollaborationCuratorWelcomeLines(): CollaborationCuratorLine[] {
  return [
    {
      id: uid(),
      message:
        'When two or more founders collaborate, Studio OS treats it as invention — not shared editing.',
      priority: 'high',
    },
    {
      id: uid(),
      message:
        'Collaboration Genome™ temporarily combines Company, Creative, and Experience Genomes so AI understands each contribution.',
      priority: 'medium',
    },
    {
      id: uid(),
      message: 'Original innovations earn Innovation ID™, Joint Patent Record™, and transparent royalty splits.',
      priority: 'medium',
    },
  ];
}

export function buildCollaborationCuratorRecommendationLines(
  recommendations: CollaboratorRecommendation[]
): CollaborationCuratorLine[] {
  const top = [...recommendations].sort((a, b) => b.complementScore - a.complementScore)[0];
  if (!top) return [];
  return [
    {
      id: uid(),
      message: `I've identified three founders whose expertise complements yours — start with ${top.founderName} (${top.complementScore}% complement).`,
      priority: 'high',
    },
    {
      id: uid(),
      message: `I recommend inviting them into ${top.suggestedWorkspace}.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: top.rationale,
      priority: 'medium',
    },
  ];
}

export function buildCollaborationCuratorInnovationLines(
  innovation: JointInnovationRecord
): CollaborationCuratorLine[] {
  return [
    {
      id: uid(),
      message: `"${innovation.title}" appears to be an original innovation — Innovation ID™ ${innovation.innovationId}.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: innovation.published
        ? `Published as ${innovation.visibilityLabel} — royalties distribute automatically on every Marketplace purchase.`
        : 'Would you like to publish it? Private · Company Only · Invite Only · Marketplace · Open Source · Licensed.',
      priority: 'high',
    },
  ];
}

export function parseCollaborationCuratorIntent(text: string): 'recommend' | 'publish' | 'invite' | null {
  const t = text.toLowerCase();
  if (/complement|recommend|invite|collaborat/i.test(t)) return 'recommend';
  if (/publish|marketplace|original innovation/i.test(t)) return 'publish';
  if (/join|observe|teleport/i.test(t)) return 'invite';
  return null;
}
