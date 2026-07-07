import type {
  PROFICIENCY_LEVELS,
  SKILL_CATEGORIES,
  SKILL_GRAPH_DOMAINS,
  SKILL_GRAPH_PHILOSOPHY,
  SKILL_RELATIONSHIP_TYPES,
} from './constants';

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
export type SkillRelationshipType = (typeof SKILL_RELATIONSHIP_TYPES)[number];
export type SkillGraphDomain = (typeof SKILL_GRAPH_DOMAINS)[number];
export type SkillPhilosophyLine = (typeof SKILL_GRAPH_PHILOSOPHY)[number];
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export type SkillHolder = {
  personId: string;
  personName: string;
  department: string;
  proficiency: ProficiencyLevel;
  proficiencyScore: number;
  canTeach: boolean;
  needsHelp: boolean;
};

export type OrganizationalSkillNode = {
  id: string;
  name: string;
  category: SkillCategory;
  categoryLabel: string;
  description: string;
  holders: SkillHolder[];
  holderCount: number;
  expertCount: number;
  mentorCount: number;
  learnersNeeded: number;
  demandScore: number;
  supplyScore: number;
  gapSeverity: 'none' | 'watch' | 'gap' | 'critical';
  searchableAsset: true;
};

export type SkillRelationshipEdge = {
  id: string;
  fromSkillId: string;
  fromSkillName: string;
  toSkillId: string;
  toSkillName: string;
  relationshipType: SkillRelationshipType;
  relationshipTypeLabel: string;
  summary: string;
  strength: number;
};

export type SkillIntelligenceInsight = {
  id: string;
  insight: string;
  category: 'gap' | 'mentorship' | 'collaboration' | 'demand' | 'outdated' | 'certification';
  department?: string;
  skillName?: string;
  severity: 'info' | 'watch' | 'attention' | 'urgent';
  recommendedAction: string;
};

export type DepartmentSkillSummary = {
  department: string;
  skillCount: number;
  expertCount: number;
  gapCount: number;
  topSkills: string[];
  missingSkills: string[];
};

export type SkillGraphDomainStatus = {
  domain: SkillGraphDomain;
  label: string;
  score: number;
  count: number;
  summary: string;
};

export type OrganizationSkillGraphProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  graphScore: number;
  skillsTracked: number;
  categoriesRepresented: number;
  mentorsAvailable: number;
  gapsDetected: number;
  highlyDemandedSkills: number;
  skills: OrganizationalSkillNode[];
  relationships: SkillRelationshipEdge[];
  insights: SkillIntelligenceInsight[];
  departmentSummaries: DepartmentSkillSummary[];
  domainStatuses: SkillGraphDomainStatus[];
  selectedSkillId: string | null;
  dockSkillLine: string;
  searchableOrganizationalAssets: true;
  syncedSources: string[];
  lastSyncedAt: string;
};

export type SkillGraphStore = {
  version: string;
  profiles: OrganizationSkillGraphProfile[];
};

export type SkillGraphDockAdvice = {
  response: string;
  concierge: string;
  graphScore?: number;
  skillsTracked?: number;
};

export type SkillGraphSearchHit = {
  type: 'skill' | 'person' | 'department' | 'insight';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
