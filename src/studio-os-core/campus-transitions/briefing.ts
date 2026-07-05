import { getWorkspaceSnapshot } from '../workspace-registry/store';
import { loadWorkspace } from '../workspace/loader';
import type { CampusArrivalBriefing } from './types';

const FOUNDER_FIRST_NAME = 'Kateena';

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${FOUNDER_FIRST_NAME}.`;
  if (h < 17) return `Good afternoon, ${FOUNDER_FIRST_NAME}.`;
  return `Good evening, ${FOUNDER_FIRST_NAME}.`;
}

function welcomeBackGreeting(displayName: string): string {
  const variants = [
    `Welcome back, ${FOUNDER_FIRST_NAME}.`,
    `${displayName} headquarters is ready for you, ${FOUNDER_FIRST_NAME}.`,
    `You've arrived at ${displayName}, ${FOUNDER_FIRST_NAME}.`,
  ];
  const daySeed = new Date().getDate() % variants.length;
  return variants[daySeed] ?? variants[0];
}

export function buildCampusArrivalBriefing(workspaceId: string): CampusArrivalBriefing {
  const snapshot = getWorkspaceSnapshot(workspaceId);
  const schema = loadWorkspace(workspaceId)?.schema;
  const displayName = schema?.displayName ?? workspaceId.toUpperCase();

  const greeting = snapshot ? welcomeBackGreeting(displayName) : timeGreeting();

  const conciergeLines: string[] = [];
  if (snapshot) {
    if (snapshot.unreadExecutiveUpdates > 0) {
      conciergeLines.push(
        `${snapshot.unreadExecutiveUpdates} executive update${snapshot.unreadExecutiveUpdates === 1 ? '' : 's'} ${snapshot.unreadExecutiveUpdates === 1 ? 'is' : 'are'} waiting.`
      );
    }
    if (snapshot.pendingApprovals > 0) {
      conciergeLines.push(
        `${snapshot.pendingApprovals} approval${snapshot.pendingApprovals === 1 ? '' : 's'} require your judgment before production continues.`
      );
    }
    if (snapshot.recentActivity) {
      conciergeLines.push(snapshot.recentActivity.endsWith('.') ? snapshot.recentActivity : `${snapshot.recentActivity}.`);
    }
    if (snapshot.conciergeStatus === 'briefing-ready') {
      conciergeLines.push('Chief Concierge has prepared today\'s operational summary.');
    }
  }

  if (conciergeLines.length === 0) {
    conciergeLines.push(
      'Brand Concierge completed creative review.',
      'Growth Concierge identified publishing opportunities.',
      'Technology Concierge completed today\'s render queue.'
    );
  }

  const priorities = snapshot?.todaysBriefing
    ? snapshot.todaysBriefing.split(' · ').filter(Boolean)
    : ['Review Mission Control priorities', 'Scan executive updates', 'Confirm production readiness'];

  return {
    greeting,
    conciergeLines: conciergeLines.slice(0, 4),
    priorities,
    executiveUpdates: snapshot
      ? [`${snapshot.unreadExecutiveUpdates} unread executive update${snapshot.unreadExecutiveUpdates === 1 ? '' : 's'}`]
      : ['Executive council summary prepared'],
    urgentApprovals: snapshot?.pendingApprovals
      ? [`${snapshot.pendingApprovals} pending approval${snapshot.pendingApprovals === 1 ? '' : 's'}`]
      : ['No urgent approvals blocking production'],
    productionStatus: [
      snapshot?.recentActivity?.includes('Render') || snapshot?.recentActivity?.includes('render')
        ? 'Production floor active · render pipeline in progress'
        : 'Production floor standing by · Screening Room prepared when ready',
    ],
    publishingSchedule: [
      displayName.includes('NDXBOOK') || workspaceId === 'ai-media'
        ? 'Growth Concierge recommends 2:00 PM publish window for peak retention'
        : 'Publishing schedule clear until founder review completes',
    ],
    organizationalHealth: snapshot
      ? [`Organizational health ${snapshot.organizationalHealthPct}% · autonomy ${snapshot.autonomyLevel.replace(/-/g, ' ')}`]
      : ['Organizational health stable'],
    recentAchievements: snapshot?.revenueSnapshot ? [snapshot.revenueSnapshot] : ['Recent achievements logged in Mission Control'],
    upcomingMilestones: [
      schema?.moduleCopy?.['mission-control']?.subtitle?.slice(0, 72) ?? 'Mission Control awaiting your direction',
    ],
  };
}
