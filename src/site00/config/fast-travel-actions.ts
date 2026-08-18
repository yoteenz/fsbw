/**
 * SITE 00 Fast Travel — centralized contextual action resolver.
 * Consumed by mobile Fast Travel (future) and desktop ENTER 00 tiles.
 */

import { SITE00_CTRL_ROOM_PATH } from './mobile-directory-nav';
import { SITE00_ROUTES } from './routes';
import type {
  ActiveBuild,
  AttentionItem,
  EcosystemProject,
  EcosystemSite,
  NowItem,
  UpNextItem,
} from './seed/site00-ecosystem-seed';

export type FastTravelActionId =
  | 'action-required'
  | 'pending-approval'
  | 'continue-build'
  | 'next-milestone'
  | 'start-build'
  | 'evolve-site'
  | 'find-build-type'
  | 'create-idnty'
  | 'my-sites'
  | 'open-ctrl-room'
  | 'review-options'
  | 'start-something-new';

export type FastTravelAction = {
  id: FastTravelActionId;
  label: string;
  description: string;
  href: string;
  priority: number;
};

export type FastTravelActionsInput = {
  authState: { isSignedIn: boolean };
  currentRoute?: string;
  projects?: EcosystemProject[];
  sites?: EcosystemSite[];
  approvals?: AttentionItem[];
  blockers?: AttentionItem[];
  onboardingState?: {
    bldrResume?: { hasResume: boolean; href: string | null };
    evolveResume?: { hasResume: boolean; href: string | null };
  };
  /** Legacy aliases — mapped into blockers/approvals when omitted */
  attention?: AttentionItem[];
  now?: NowItem[];
  upNext?: UpNextItem[];
  activeBuilds?: ActiveBuild[];
};

const MAX_TILES = 4;

const BLOCKER_PATTERN = /required|connection|connect|block|due/i;
const APPROVAL_PATTERN = /approval|approve|concept|option/i;

function signedOutStarterTiles(): FastTravelAction[] {
  return [
    {
      id: 'start-build',
      label: 'START A BUILD',
      description: 'BEGIN SOMETHING NEW.',
      href: SITE00_ROUTES.bldrState,
      priority: 60,
    },
    {
      id: 'find-build-type',
      label: 'FIND MY BUILD TYPE',
      description: 'NOT SURE WHERE TO BEGIN?',
      href: SITE00_ROUTES.bldrState,
      priority: 80,
    },
    {
      id: 'evolve-site',
      label: 'EVOLVE A SITE',
      description: 'IMPROVE WHAT ALREADY EXISTS.',
      href: SITE00_ROUTES.evolve,
      priority: 70,
    },
    {
      id: 'create-idnty',
      label: 'CREATE IDNTY',
      description: 'ESTABLISH YOUR SITE 00 ACCESS.',
      href: SITE00_ROUTES.idntyState,
      priority: 75,
    },
  ];
}

function signedInStarterTiles(): FastTravelAction[] {
  return [
    {
      id: 'start-build',
      label: 'START A BUILD',
      description: 'BEGIN SOMETHING NEW.',
      href: SITE00_ROUTES.bldrState,
      priority: 60,
    },
    {
      id: 'find-build-type',
      label: 'FIND MY BUILD TYPE',
      description: 'NOT SURE WHERE TO BEGIN?',
      href: SITE00_ROUTES.bldrState,
      priority: 80,
    },
    {
      id: 'evolve-site',
      label: 'EVOLVE A SITE',
      description: 'UPGRADE WHAT ALREADY EXISTS.',
      href: SITE00_ROUTES.evolve,
      priority: 70,
    },
    {
      id: 'open-ctrl-room',
      label: 'OPEN CTRL ROOM',
      description: 'YOUR OPERATING ENVIRONMENT.',
      href: SITE00_CTRL_ROOM_PATH,
      priority: 55,
    },
  ];
}

function truncateDescription(text: string, max = 52): string {
  const upper = text.toUpperCase();
  return upper.length <= max ? upper : `${upper.slice(0, max - 1)}…`;
}

/** Rank contextual Fast Travel tiles — max 4, highest priority first. */
export function getFastTravelActions(input: FastTravelActionsInput): FastTravelAction[] {
  const { isSignedIn } = input.authState;

  if (!isSignedIn) {
    return signedOutStarterTiles().slice(0, MAX_TILES);
  }

  const attention = input.blockers ?? input.attention ?? [];
  const approvals = input.approvals ?? attention.filter((item) => APPROVAL_PATTERN.test(item.label));
  const now = input.now ?? [];
  const upNext = input.upNext ?? [];
  const activeBuilds = input.activeBuilds ?? [];
  const projects = input.projects ?? [];
  const sites = input.sites ?? [];
  const bldrResume = input.onboardingState?.bldrResume;
  const evolveResume = input.onboardingState?.evolveResume;

  const candidates: FastTravelAction[] = [];

  const criticalBlocker = attention.find((item) => item.urgent && BLOCKER_PATTERN.test(item.label));
  if (criticalBlocker) {
    candidates.push({
      id: 'action-required',
      label: 'ACTION REQUIRED',
      description: truncateDescription(criticalBlocker.label),
      href: criticalBlocker.href,
      priority: 10,
    });
  }

  const clientBlocker = attention.find(
    (item) => item.urgent && !BLOCKER_PATTERN.test(item.label) && !APPROVAL_PATTERN.test(item.label),
  );
  if (clientBlocker && !criticalBlocker) {
    candidates.push({
      id: 'action-required',
      label: 'ACTION REQUIRED',
      description: truncateDescription(clientBlocker.label),
      href: clientBlocker.href,
      priority: 20,
    });
  }

  const approvalItem =
    approvals.find((item) => APPROVAL_PATTERN.test(item.label)) ??
    now.find((item) => APPROVAL_PATTERN.test(item.label));

  if (approvalItem) {
    candidates.push({
      id: 'pending-approval',
      label: 'REVIEW PENDING APPROVAL',
      description: truncateDescription(approvalItem.label),
      href: approvalItem.href ?? SITE00_ROUTES.projects,
      priority: 30,
    });
  }

  const conceptApprovals = approvals.filter((item) => /concept|option/i.test(item.label));
  if (conceptApprovals.length >= 2) {
    candidates.push({
      id: 'review-options',
      label: 'REVIEW OPTIONS',
      description: `${conceptApprovals.length} CONCEPTS WAITING.`,
      href: conceptApprovals[0]?.href ?? SITE00_ROUTES.projects,
      priority: 35,
    });
  }

  if (bldrResume?.hasResume && bldrResume.href) {
    const build = activeBuilds[0];
    candidates.push({
      id: 'continue-build',
      label: 'CONTINUE BUILD',
      description: build
        ? `${build.name.toUpperCase()} · ${build.progress}%`
        : 'RESUME YOUR BUILD ASSESSMENT.',
      href: bldrResume.href,
      priority: 40,
    });
  } else if (evolveResume?.hasResume && evolveResume.href) {
    candidates.push({
      id: 'continue-build',
      label: 'CONTINUE EVOLVE',
      description: 'RESUME YOUR EVOLVE INTAKE.',
      href: evolveResume.href,
      priority: 40,
    });
  } else if (activeBuilds.length > 0) {
    const build = activeBuilds[0];
    candidates.push({
      id: 'continue-build',
      label: 'CONTINUE BUILD',
      description: `${build.name.toUpperCase()} · ${build.stage.toUpperCase()} · ${build.progress}%`,
      href: build.href,
      priority: 42,
    });
  }

  if (upNext.length > 0) {
    const milestone = upNext[0];
    candidates.push({
      id: 'next-milestone',
      label: 'NEXT MILESTONE',
      description: `${milestone.label.toUpperCase()} · ${milestone.date.toUpperCase()}`,
      href: SITE00_ROUTES.projects,
      priority: 50,
    });
  }

  const hasActiveProjects = projects.some(
    (project) => project.status === 'ACTIVE' || project.status === 'IN PROGRESS',
  );
  const hasPublishedSites = sites.some((site) => site.status === 'Published');
  const allProjectsComplete = projects.length > 0 && !hasActiveProjects;

  if (allProjectsComplete && hasPublishedSites) {
    candidates.push(
      {
        id: 'my-sites',
        label: 'MY SITES',
        description: 'VIEW YOUR DIGITAL PROPERTIES.',
        href: SITE00_ROUTES.controlSites,
        priority: 55,
      },
      {
        id: 'evolve-site',
        label: 'EVOLVE A SITE',
        description: 'UPGRADE WHAT ALREADY EXISTS.',
        href: SITE00_ROUTES.evolve,
        priority: 70,
      },
      {
        id: 'start-something-new',
        label: 'START A NEW BUILD',
        description: 'BEGIN SOMETHING NEW.',
        href: SITE00_ROUTES.bldrState,
        priority: 60,
      },
      {
        id: 'open-ctrl-room',
        label: 'OPEN CTRL ROOM',
        description: 'YOUR OPERATING ENVIRONMENT.',
        href: SITE00_CTRL_ROOM_PATH,
        priority: 65,
      },
    );
  } else if (!hasActiveProjects && activeBuilds.length === 0 && !bldrResume?.hasResume && !evolveResume?.hasResume) {
    candidates.push(...signedInStarterTiles());
  } else {
    candidates.push(
      {
        id: 'start-something-new',
        label: 'START SOMETHING NEW',
        description: 'BEGIN A NEW BUILD.',
        href: SITE00_ROUTES.bldrState,
        priority: 60,
      },
      {
        id: 'evolve-site',
        label: 'EVOLVE A SITE',
        description: 'UPGRADE WHAT ALREADY EXISTS.',
        href: SITE00_ROUTES.evolve,
        priority: 70,
      },
      {
        id: 'find-build-type',
        label: 'FIND MY BUILD TYPE',
        description: 'NOT SURE WHERE TO BEGIN?',
        href: SITE00_ROUTES.bldrState,
        priority: 80,
      },
      {
        id: 'open-ctrl-room',
        label: 'OPEN CTRL ROOM',
        description: 'WHAT NEEDS YOUR ATTENTION.',
        href: SITE00_CTRL_ROOM_PATH,
        priority: 55,
      },
    );
  }

  const seen = new Set<FastTravelActionId>();
  return candidates
    .sort((a, b) => a.priority - b.priority)
    .filter((action) => {
      if (seen.has(action.id)) return false;
      seen.add(action.id);
      return true;
    })
    .slice(0, MAX_TILES);
}
