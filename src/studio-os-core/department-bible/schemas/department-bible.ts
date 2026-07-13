import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';

export const DEPARTMENT_BIBLE_VERSION = 'department-bible.v1' as const;

export type DepartmentRole =
  | 'admin'
  | 'founder'
  | 'guest'
  | 'marketplace-creator'
  | 'municipal-inspector'
  | 'ai-worker'
  | 'automation'
  | 'system';

export type DepartmentBible = {
  bibleVersion: typeof DEPARTMENT_BIBLE_VERSION;
  bibleRevision: number;
  departmentId: CanonicalMainDepartmentId;
  officialName: string;
  mission: string;
  purpose: string;
  responsibilities: string[];
  nonResponsibilities: string[];
  primaryUsers: string[];
  secondaryUsers: string[];
  allowedRoles: DepartmentRole[];
  restrictedRoles: DepartmentRole[];
  departmentPhilosophy: string;
  corePrinciples: string[];
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  upstreamDepartments: CanonicalMainDepartmentId[];
  downstreamDepartments: CanonicalMainDepartmentId[];
  requiredAiWorkers: string[];
  requiredServices: string[];
  requiredInfrastructure: string[];
  lifecycleStates: string[];
  requiredApprovals: string[];
  failureModes: string[];
  recoveryStrategy: string;
  securityClassification: 'studio-world-admin' | 'founder-read' | 'system' | 'public-read';
  marketplaceParticipation: boolean;
  auditRules: string[];
  costModel: string;
  performanceTargets: string[];
  accessibilityTargets: string[];
  expansionRules: string[];
  futureVision: string;
  handsWorkTo: CanonicalMainDepartmentId[];
  receivesWorkFrom: CanonicalMainDepartmentId[];
};
