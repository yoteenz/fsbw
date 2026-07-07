/**
 * Studio Production Engine™ — canonical production departments (gate UX layer).
 */

export type ProductionDepartmentId =
  | 'discover'
  | 'development'
  | 'assembly'
  | 'production'
  | 'review'
  | 'expansion'
  | 'approval'
  | 'publishing'
  | 'intelligence'
  | 'learning';

export type ProductionDepartmentStatus = 'locked' | 'available' | 'current' | 'complete';

export type ProductionDepartmentDef = {
  id: ProductionDepartmentId;
  number: number;
  name: string;
  shortName: string;
  tagline: string;
  exitArtifact: string;
  purpose: string;
  nextAction: string;
  prerequisites: string;
};

export const PRODUCTION_DEPARTMENTS: ProductionDepartmentDef[] = [
  {
    id: 'discover',
    number: 1,
    name: 'DISCOVER DEPARTMENT',
    shortName: 'DISCOVER',
    tagline: 'Find the opportunity.',
    exitArtifact: 'Approved Creative Brief',
    purpose: 'Identify and validate the content opportunity before anything is produced.',
    nextAction: 'Review the creative brief, confirm objectives, then continue to Development.',
    prerequisites: 'An idea or campaign slot exists (Project 001 pilot is pre-assigned).',
  },
  {
    id: 'development',
    number: 2,
    name: 'DEVELOPMENT DEPARTMENT',
    shortName: 'DEVELOPMENT',
    tagline: 'Design the idea.',
    exitArtifact: 'Production Package',
    purpose: 'Turn the brief into storyboard, script, messaging, and creative direction.',
    nextAction: 'Approve the production package and hand off to Assembly.',
    prerequisites: 'Approved Creative Brief from Discover.',
  },
  {
    id: 'assembly',
    number: 3,
    name: 'ASSEMBLY DEPARTMENT',
    shortName: 'ASSEMBLY',
    tagline: 'Prepare production.',
    exitArtifact: 'Production Ready',
    purpose: 'Confirm talent, products, props, schedule, and dependencies.',
    nextAction: 'Mark production ready and enter the Production studio.',
    prerequisites: 'Approved Production Package from Development.',
  },
  {
    id: 'production',
    number: 4,
    name: 'PRODUCTION DEPARTMENT',
    shortName: 'PRODUCTION',
    tagline: 'Create the master asset.',
    exitArtifact: 'Master Content Asset v1',
    purpose: 'Start Project 001 production — register primary assets in the production studio.',
    nextAction: 'Create the master asset, then send to Review.',
    prerequisites: 'Production Ready status from Assembly.',
  },
  {
    id: 'review',
    number: 5,
    name: 'REVIEW DEPARTMENT',
    shortName: 'REVIEW',
    tagline: 'Perfect the experience.',
    exitArtifact: 'Quality Approved',
    purpose: 'Studio Intelligence and concierge QA before expansion.',
    nextAction: 'Run Studio Intelligence, then approve production when scores pass.',
    prerequisites: 'Master Content Asset v1 exists.',
  },
  {
    id: 'expansion',
    number: 6,
    name: 'EXPANSION DEPARTMENT',
    shortName: 'EXPANSION',
    tagline: 'Multiply the content.',
    exitArtifact: 'Derivative Asset Library',
    purpose: 'Generate Instagram and future channel derivatives from the master asset.',
    nextAction: 'Review derivative placeholders and continue to Approval.',
    prerequisites: 'Quality Approved master asset.',
  },
  {
    id: 'approval',
    number: 7,
    name: 'APPROVAL DEPARTMENT',
    shortName: 'APPROVAL',
    tagline: 'Authorize launch.',
    exitArtifact: 'Publishing Authorization',
    purpose: 'Final QA and schedule validation before publish.',
    nextAction: 'Confirm Instagram schedule and authorize publishing.',
    prerequisites: 'Derivative library ready · Instagram connection checked.',
  },
  {
    id: 'publishing',
    number: 8,
    name: 'PUBLISHING DEPARTMENT',
    shortName: 'PUBLISHING',
    tagline: 'Release to the world.',
    exitArtifact: 'Campaign Live',
    purpose: 'Publish or schedule Project 001 outputs to Instagram.',
    nextAction: 'Publish now or schedule, then proceed to Intelligence.',
    prerequisites: 'Publishing Authorization granted.',
  },
  {
    id: 'intelligence',
    number: 9,
    name: 'INTELLIGENCE DEPARTMENT',
    shortName: 'INTELLIGENCE',
    tagline: 'Measure impact.',
    exitArtifact: 'Performance Report',
    purpose: 'Track engagement, reach, and performance after publish.',
    nextAction: 'Review performance metrics and continue to Learning.',
    prerequisites: 'Campaign live or scheduled with confirmation.',
  },
  {
    id: 'learning',
    number: 10,
    name: 'LEARNING DEPARTMENT',
    shortName: 'LEARNING',
    tagline: 'Improve the next campaign.',
    exitArtifact: 'Continuous Improvement',
    purpose: 'Archive learnings to Knowledge Library and feed Studio Intelligence.',
    nextAction: 'Review AI learnings and return to Discover for Page 002.',
    prerequisites: 'Performance report available (or pilot placeholder after publish).',
  },
];

export function getProductionDepartment(id: ProductionDepartmentId): ProductionDepartmentDef {
  const found = PRODUCTION_DEPARTMENTS.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown production department: ${id}`);
  return found;
}

export function productionDepartmentIndex(id: ProductionDepartmentId): number {
  return PRODUCTION_DEPARTMENTS.findIndex((d) => d.id === id);
}

export function nextProductionDepartment(id: ProductionDepartmentId): ProductionDepartmentId | null {
  const idx = productionDepartmentIndex(id);
  if (idx < 0 || idx >= PRODUCTION_DEPARTMENTS.length - 1) return null;
  return PRODUCTION_DEPARTMENTS[idx + 1]!.id;
}

export function parseProductionDepartmentId(raw: string | undefined): ProductionDepartmentId | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/-department$/, '');
  return PRODUCTION_DEPARTMENTS.some((d) => d.id === normalized) ? (normalized as ProductionDepartmentId) : null;
}

export const DEFAULT_NDXBOOK_DEPARTMENT: ProductionDepartmentId = 'discover';
