import { FOUNDER_DISPLAY_NAME } from '../command-dock/constants';
import { readFounderPilotModeStore } from './store';
import { INTELLIGENCE_MATURITY_TIERS } from './constants';

export type PilotDockBrief = {
  greeting: string;
  missionTitle: string;
  missionSteps: string[];
  footer: string;
};

export function buildFounderPilotDockBrief(organizationId: string, organizationName: string): PilotDockBrief | null {
  const store = readFounderPilotModeStore(organizationId);
  if (!store.enabled) return null;

  const h = new Date().getHours();
  const period = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const greeting = `Good ${period}, ${FOUNDER_DISPLAY_NAME}.`;

  const hasInstagram = store.milestones.some((m) => m.id === 'instagram-connected');
  const hasFirstPage = store.milestones.some((m) => m.id === 'first-page-written');
  const hasPublished = store.pagesPublished > 0;

  const missionSteps = hasPublished
    ? ['Review analytics from your latest publish.', 'Plan Page 002 while intelligence learns.', 'Schedule your next Instagram post.']
    : hasFirstPage
      ? ['Review your first page in the newsroom.', 'Approve production when ready.', 'Schedule your first Instagram post.']
      : hasInstagram
        ? ['Start Project 001 in the NDXBOOK production wing.', 'Move it through research → write → review.', 'Schedule your first output.']
        : ['Connect Instagram.', 'Start Project 001.', 'Review your first production.', 'Publish your first knowledge asset.'];

  return {
    greeting,
    missionTitle: `Welcome to ${organizationName}.`,
    missionSteps,
    footer: "I'll handle everything else.",
  };
}

export function buildIntelligenceMaturityMessage(publishedCount: number): string {
  const next = INTELLIGENCE_MATURITY_TIERS.find((t) => publishedCount < t.postsRequired);
  if (!next) return 'Autonomous publishing suggestions are available — your history is mature.';
  return `${next.label} — ${next.unlocks}`;
}
