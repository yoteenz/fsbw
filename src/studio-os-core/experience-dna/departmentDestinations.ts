import type { ProductionDepartmentId } from '../content-pipeline/departments';
import type { DepartmentDestination, DepartmentDestinationId, HeadquartersProgression } from './types';

export const DEPARTMENT_DESTINATIONS: Record<DepartmentDestinationId, DepartmentDestination> = {
  discover: {
    id: 'discover',
    buildingName: 'Opportunity House',
    lotZone: 'North Campus · Development Row',
    atmosphere: 'Quiet briefing light · strategy walls · morning calm',
    departmentHead: 'Strategy Concierge™',
    arrivalLine: 'You enter Opportunity House — the project scouts its reason to exist.',
    ambientOverlay: 'Campaign signals · audience pulse · brief drafts in ambient view',
    milestoneLabel: 'Brief chartered',
    toolsIdentity: 'Creative brief · opportunity validation · north star alignment',
  },
  development: {
    id: 'development',
    buildingName: "Writers' Bungalow",
    lotZone: 'North Campus · Story Row',
    atmosphere: 'Warm lamp light · script boards · editorial focus',
    departmentHead: 'Editorial Concierge™',
    arrivalLine: "You enter the Writers' Bungalow — story and message take shape.",
    ambientOverlay: 'Storyboard strips · hook variants · tone markers',
    milestoneLabel: 'Package drafted',
    toolsIdentity: 'Storyboard · script · messaging · creative direction',
  },
  assembly: {
    id: 'assembly',
    buildingName: 'Prep Stage',
    lotZone: 'Central Lot · Logistics Yard',
    atmosphere: 'Checklist energy · props · schedule boards',
    departmentHead: 'Operations Concierge™',
    arrivalLine: 'You enter Prep Stage — talent, props, and dependencies align.',
    ambientOverlay: 'Call sheets · social connection status · readiness flags',
    milestoneLabel: 'Production ready',
    toolsIdentity: 'Checklists · dependencies · schedule · connections',
  },
  production: {
    id: 'production',
    buildingName: 'Master Stage',
    lotZone: 'Central Lot · Sound Stage A',
    atmosphere: 'Live studio · canvas glow · creation in progress',
    departmentHead: 'Visual Concierge™',
    arrivalLine: 'You enter Master Stage — the Master Content Asset is born here.',
    ambientOverlay: 'Editor · preview · asset library · prompt history',
    milestoneLabel: 'Master asset created',
    toolsIdentity: 'Infinite canvas · editor · live preview · asset library',
  },
  review: {
    id: 'review',
    buildingName: 'Screening Room',
    lotZone: 'Quality Wing · Review Row',
    atmosphere: 'Controlled light · concierge board · precision',
    departmentHead: 'Studio Intelligence™',
    arrivalLine: 'You enter the Screening Room — experience is perfected before expansion.',
    ambientOverlay: 'Review scores · founder notes · concierge dimensions',
    milestoneLabel: 'Quality approved',
    toolsIdentity: 'Studio Intelligence · concierge review board · approval',
  },
  expansion: {
    id: 'expansion',
    buildingName: 'Derivative Foundry',
    lotZone: 'Quality Wing · Expansion Bay',
    atmosphere: 'Multiplication energy · format racks · channel adapters',
    departmentHead: 'Marketing Concierge™',
    arrivalLine: 'You enter Derivative Foundry — one master becomes many assets.',
    ambientOverlay: 'Derivative library · format previews · channel packs',
    milestoneLabel: 'Library multiplied',
    toolsIdentity: 'Derivative generation · channel formats · expansion grid',
  },
  approval: {
    id: 'approval',
    buildingName: 'Authorization Hall',
    lotZone: 'Launch Row · Governance',
    atmosphere: 'Formal calm · sign-off desk · launch readiness',
    departmentHead: 'Brand Concierge™',
    arrivalLine: 'You enter Authorization Hall — launch is authorized with confidence.',
    ambientOverlay: 'Approval grid · connection checks · schedule validation',
    milestoneLabel: 'Launch authorized',
    toolsIdentity: 'Final QA · schedule · authorization grid',
  },
  publishing: {
    id: 'publishing',
    buildingName: 'Mission Control Spire',
    lotZone: 'Launch Row · Distribution Tower',
    atmosphere: 'Launch energy · queue monitors · world-facing',
    departmentHead: 'Social Media Concierge™',
    arrivalLine: 'You enter Mission Control Spire — the campaign meets the world.',
    ambientOverlay: 'Publishing queue · Instagram status · go-live controls',
    milestoneLabel: 'Campaign live',
    toolsIdentity: 'Schedule · publish · mission control queue',
  },
  intelligence: {
    id: 'intelligence',
    buildingName: 'Analytics Observatory',
    lotZone: 'South Campus · Intelligence Row',
    atmosphere: 'Data calm · performance rings · measured impact',
    departmentHead: 'Studio Intelligence™',
    arrivalLine: 'You enter Analytics Observatory — impact becomes visible.',
    ambientOverlay: 'Reach · saves · engagement · performance tiles',
    milestoneLabel: 'Performance measured',
    toolsIdentity: 'Live analytics · performance report · impact tiles',
  },
  learning: {
    id: 'learning',
    buildingName: 'Archive & Institute',
    lotZone: 'South Campus · Legacy Row',
    atmosphere: 'Reflective · institutional memory · quiet mastery',
    departmentHead: 'Knowledge Concierge™',
    arrivalLine: 'You enter Archive & Institute — learnings become institutional knowledge.',
    ambientOverlay: 'Learnings · knowledge library · next campaign seeds',
    milestoneLabel: 'Knowledge archived',
    toolsIdentity: 'Learnings · archive · continuous improvement',
  },
};

export function getDepartmentDestination(deptId: ProductionDepartmentId): DepartmentDestination {
  return DEPARTMENT_DESTINATIONS[deptId];
}

export function resolveHeadquartersProgression(
  completedCount: number,
  totalDepartments = 10,
  currentDept?: ProductionDepartmentId
): HeadquartersProgression {
  const ratio = completedCount / totalDepartments;
  let masteryTier: HeadquartersProgression['masteryTier'] = 'developing';
  if (ratio >= 0.85) masteryTier = 'premiere-ready';
  else if (ratio >= 0.55) masteryTier = 'on-lot';
  else if (ratio >= 0.25) masteryTier = 'in-production';

  const nextUnlockLabel =
    currentDept && DEPARTMENT_DESTINATIONS[currentDept]
      ? `Next building · ${DEPARTMENT_DESTINATIONS[currentDept].buildingName}`
      : null;

  return {
    completedCount,
    totalDepartments,
    masteryTier,
    nextUnlockLabel,
  };
}

export function countCompletedDepartments(
  statuses: Record<ProductionDepartmentId, string>
): number {
  return Object.values(statuses).filter((s) => s === 'complete').length;
}

export const MASTERY_TIER_LABELS: Record<HeadquartersProgression['masteryTier'], string> = {
  developing: 'DEVELOPING ON LOT',
  'in-production': 'IN PRODUCTION',
  'on-lot': 'ON LOT · ADVANCING',
  'premiere-ready': 'PREMIERE READY',
};
