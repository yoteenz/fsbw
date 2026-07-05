/** Executive Organization V1.0 — living executive organization (Milestone 41). */

export type OrgHierarchyLevel =
  | 'founder'
  | 'chief-of-staff'
  | 'executive-leadership'
  | 'departments'
  | 'teams'
  | 'workers'
  | 'projects'
  | 'tasks';

export type ExecutiveId =
  | 'chief-of-staff'
  | 'chief-marketing-officer'
  | 'chief-creative-officer'
  | 'chief-operations-officer'
  | 'chief-financial-officer'
  | 'chief-technology-officer'
  | 'chief-product-officer'
  | 'chief-content-officer'
  | 'chief-brand-officer'
  | 'chief-legal-officer'
  | 'chief-growth-officer';

export type ExecutivePersonality = {
  communicationStyle: string[];
  leadershipStyle: string[];
  strengths: string[];
  preferences: string[];
  decisionTendencies: string[];
  expertise: string[];
  institutionalExperience: string[];
  dnaAlignment: string[];
};

export type ExecutiveScorecard = {
  quality: number;
  speed: number;
  innovation: number;
  communication: number;
  leadership: number;
  resourceUtilization: number;
  knowledgeContribution: number;
  crossFunctionalCollaboration: number;
  overallPct: number;
};

export type ExecutiveHeadquarters = {
  id: ExecutiveId;
  title: string;
  department: string;
  mission: string;
  departmentHealthPct: number;
  currentPriorities: string[];
  teamWorkloadPct: number;
  activeInitiatives: string[];
  pendingApprovals: number;
  departmentMetrics: { label: string; value: string }[];
  studioIntelligenceRecommendations: string[];
  recentDecisions: string[];
  knowledgeGrowth: string[];
  personality: ExecutivePersonality;
  scorecard: ExecutiveScorecard;
  reportsTo: 'founder' | 'chief-of-staff';
};

export type DepartmentTeam = {
  id: string;
  name: string;
  leadWorkerId: string;
  workerIds: string[];
  skills: string[];
};

export type DepartmentHeadquarters = {
  id: string;
  name: string;
  executiveId: ExecutiveId;
  objectives: string[];
  capacityPct: number;
  healthPct: number;
  backlogCount: number;
  knowledgeItems: string[];
  activeInitiatives: string[];
  crossFunctionalPartners: string[];
  teams: DepartmentTeam[];
  quarterlyObjectives: string[];
  keyResults: string[];
  completedMilestones: string[];
  playbookStandards: string[];
  playbookChecklists: string[];
};

export type WorkerRecord = {
  id: string;
  name: string;
  type: 'ai-specialist' | 'automation-agent' | 'human-employee' | 'freelancer' | 'agency';
  role: string;
  skills: string[];
  availabilityPct: number;
  performancePct: number;
  capacityPct: number;
  knowledgeAreas: string[];
  assignedExecutiveId: ExecutiveId;
  departmentId: string;
  teamId: string;
};

export type CollaborationRequest = {
  id: string;
  fromExecutiveId: ExecutiveId;
  toExecutiveId: ExecutiveId;
  request: string;
  status: 'pending' | 'in-progress' | 'complete';
  automated: boolean;
};

export type OrganizationalMemoryEntry = {
  id: string;
  departmentId: string;
  type: 'best-practice' | 'mistake' | 'workflow' | 'template' | 'case-study' | 'lesson';
  title: string;
  detail: string;
  transferable: boolean;
};

export type ExecutiveMeeting = {
  id: string;
  type: 'daily-briefing' | 'weekly-leadership' | 'monthly-review' | 'quarterly-strategy' | 'annual-planning';
  title: string;
  schedule: string;
  agenda: string[];
  moderator: 'chief-of-staff';
  founderAttendance: 'always' | 'optional' | 'scheduled-only';
  nextAt: string;
};

export type OrgGraphNode = {
  id: string;
  label: string;
  type: OrgHierarchyLevel | 'knowledge' | 'initiative' | 'dependency';
  connections: string[];
};

export type CompanyCulture = {
  mission: string;
  vision: string;
  values: string[];
  leadershipPrinciples: string[];
  brandPhilosophy: string[];
  decisionPhilosophy: string[];
  operatingPrinciples: string[];
  traditions: string[];
};

export type ExecutiveSuccessionPackage = {
  executiveId: ExecutiveId;
  inheritsHistory: boolean;
  inheritsKnowledge: boolean;
  inheritsStandards: boolean;
  inheritsPerformance: boolean;
  inheritsLeadershipPhilosophy: boolean;
  organizationalContext: string[];
};

export type ExecutiveOrganizationDashboard = {
  summary: string;
  executiveCount: number;
  departmentCount: number;
  teamCount: number;
  workerCount: number;
  activeCollaborations: number;
  overallOrgHealthPct: number;
  cultureMaturityPct: number;
};

export type ExecutiveOrganizationStore = {
  version: string;
  lastUpdatedAt: string;
  dashboard: ExecutiveOrganizationDashboard;
  hierarchyLevels: { level: OrgHierarchyLevel; label: string; description: string }[];
  executives: ExecutiveHeadquarters[];
  departments: DepartmentHeadquarters[];
  workers: WorkerRecord[];
  collaborations: CollaborationRequest[];
  organizationalMemory: OrganizationalMemoryEntry[];
  meetings: ExecutiveMeeting[];
  orgGraph: OrgGraphNode[];
  companyCulture: CompanyCulture;
  successionPackages: ExecutiveSuccessionPackage[];
  selectedExecutiveId: ExecutiveId | null;
  selectedDepartmentId: string | null;
};
