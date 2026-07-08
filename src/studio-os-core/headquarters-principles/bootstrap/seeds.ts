import { HEADQUARTERS_PRINCIPLES_VERSION } from '../constants';
import { buildSubsystemMaturityRecord } from '../maturity/registry';
import type {
  InternalValidationStatus,
  PlatformMaturityStage,
  SubsystemMaturityRecord,
  UsageLevel,
} from '../types';

export type SubsystemMaturitySeed = {
  subsystemId: string;
  title: string;
  description: string;
  currentStage: PlatformMaturityStage;
  internalValidation: InternalValidationStatus;
  founderUsage: UsageLevel;
  companyUsage: UsageLevel;
  dependencies: string[];
  codexArticleIds: string[];
  routePath?: string;
  moduleKey?: string;
  hasDocs?: boolean;
};

const SUBSYSTEM_SEEDS: SubsystemMaturitySeed[] = [
  {
    subsystemId: 'mission-control',
    title: 'Mission Control™',
    description: 'Executive operating room for missions, departments, and approvals.',
    currentStage: 'company-capability',
    internalValidation: 'passed',
    founderUsage: 'daily',
    companyUsage: 'daily',
    dependencies: [],
    codexArticleIds: [],
    routePath: '/admin/studio/world/command-center',
    moduleKey: 'mission-control',
    hasDocs: true,
  },
  {
    subsystemId: 'studio-world-codex',
    title: 'Studio World Codex™',
    description: 'Constitutional memory — every major feature becomes law before implementation.',
    currentStage: 'company-capability',
    internalValidation: 'passed',
    founderUsage: 'embedded',
    companyUsage: 'daily',
    dependencies: ['mission-control'],
    codexArticleIds: ['ARTICLE-C01', 'ARTICLE-C02', 'ARTICLE-C04'],
    routePath: '/admin/studio/codex',
    moduleKey: 'studio-world-codex',
    hasDocs: true,
  },
  {
    subsystemId: 'institute-of-knowledge',
    title: 'The Institute of Knowledge™',
    description: 'First governs Studio OS architecture; later expands into profession knowledge.',
    currentStage: 'founder-workflow',
    internalValidation: 'in-progress',
    founderUsage: 'daily',
    companyUsage: 'occasional',
    dependencies: ['studio-world-codex'],
    codexArticleIds: ['ARTICLE-C03'],
    routePath: '/admin/studio/institute',
    moduleKey: 'institute-of-knowledge',
    hasDocs: true,
  },
  {
    subsystemId: 'studio-foundry',
    title: 'Studio Foundry™',
    description: 'First builds Studio OS assets; then becomes a creator platform.',
    currentStage: 'founder-workflow',
    internalValidation: 'in-progress',
    founderUsage: 'daily',
    companyUsage: 'occasional',
    dependencies: ['studio-world-codex'],
    codexArticleIds: ['ARTICLE-A02'],
    routePath: '/admin/studio/studio-foundry',
    hasDocs: true,
  },
  {
    subsystemId: 'knowledge-core',
    title: 'Knowledge Core™',
    description: 'Operational institutional memory and semantic discovery layer.',
    currentStage: 'company-capability',
    internalValidation: 'passed',
    founderUsage: 'daily',
    companyUsage: 'occasional',
    dependencies: ['studio-world-codex', 'institute-of-knowledge'],
    codexArticleIds: ['ARTICLE-K22'],
    routePath: '/admin/studio/knowledge-core',
    hasDocs: true,
  },
  {
    subsystemId: 'profession-brains',
    title: 'Profession Brains™',
    description: 'First help operate Frontal Slayer; then become reusable across industries.',
    currentStage: 'founder-workflow',
    internalValidation: 'in-progress',
    founderUsage: 'daily',
    companyUsage: 'occasional',
    dependencies: ['knowledge-core', 'institute-of-knowledge'],
    codexArticleIds: ['ARTICLE-B01'],
    routePath: '/admin/studio/profession-brain',
    hasDocs: true,
  },
  {
    subsystemId: 'career-worlds',
    title: 'Career Worlds™',
    description: 'First power Frontal Slayer Academy; then expand into additional professions.',
    currentStage: 'founder-workflow',
    internalValidation: 'in-progress',
    founderUsage: 'occasional',
    companyUsage: 'occasional',
    dependencies: ['profession-brains'],
    codexArticleIds: ['ARTICLE-E02'],
    routePath: '/admin/studio/career-worlds',
    moduleKey: 'career-worlds',
    hasDocs: true,
  },
  {
    subsystemId: 'professional-memory',
    title: 'Professional Memory™',
    description: 'First improves founder productivity; then expands into education and simulation.',
    currentStage: 'internal-tool',
    internalValidation: 'pending',
    founderUsage: 'occasional',
    companyUsage: 'none',
    dependencies: ['profession-brains', 'career-worlds'],
    codexArticleIds: ['ARTICLE-E04'],
    routePath: '/admin/studio/professional-memory-wisdom-engine',
    hasDocs: true,
  },
  {
    subsystemId: 'studio-exchange',
    title: 'Studio Exchange™',
    description: 'First distributes Studio OS assets; then expands into a public creator economy.',
    currentStage: 'internal-tool',
    internalValidation: 'pending',
    founderUsage: 'occasional',
    companyUsage: 'none',
    dependencies: ['career-worlds', 'studio-foundry'],
    codexArticleIds: ['ARTICLE-E05'],
    routePath: '/admin/studio/studio-exchange',
    moduleKey: 'studio-exchange',
    hasDocs: true,
  },
  {
    subsystemId: 'asset-factory',
    title: 'Asset Factory™',
    description: 'Manufacturing pipeline for approved blueprints and studio assets.',
    currentStage: 'founder-workflow',
    internalValidation: 'in-progress',
    founderUsage: 'occasional',
    companyUsage: 'none',
    dependencies: ['studio-foundry'],
    codexArticleIds: [],
    routePath: '/admin/studio/asset-factory',
    moduleKey: 'asset-factory',
    hasDocs: true,
  },
  {
    subsystemId: 'executive-council',
    title: 'Executive Council™',
    description: 'Collaborative executive intelligence — many minds, one briefing.',
    currentStage: 'founder-workflow',
    internalValidation: 'in-progress',
    founderUsage: 'daily',
    companyUsage: 'occasional',
    dependencies: ['mission-control', 'knowledge-core'],
    codexArticleIds: [],
    routePath: '/admin/studio/executive-council',
    hasDocs: true,
  },
  {
    subsystemId: 'world-atlas',
    title: 'Studio World Atlas™',
    description: 'Constitutional Atlas™ — spatial navigation replaces menu-first discovery.',
    currentStage: 'company-capability',
    internalValidation: 'passed',
    founderUsage: 'daily',
    companyUsage: 'occasional',
    dependencies: ['mission-control'],
    codexArticleIds: ['ARTICLE-W05'],
    routePath: '/admin/studio/world-atlas',
    hasDocs: true,
  },
];

export function bootstrapHeadquartersPrinciplesStore(): {
  version: string;
  subsystems: SubsystemMaturityRecord[];
  bootstrappedAt: string;
} {
  const subsystems = SUBSYSTEM_SEEDS.map((seed) =>
    buildSubsystemMaturityRecord(seed, SUBSYSTEM_SEEDS)
  );

  return {
    version: HEADQUARTERS_PRINCIPLES_VERSION,
    subsystems,
    bootstrappedAt: new Date().toISOString(),
  };
}

export function getSubsystemMaturitySeeds(): SubsystemMaturitySeed[] {
  return [...SUBSYSTEM_SEEDS];
}

export function getSubsystemSeedCount(): number {
  return SUBSYSTEM_SEEDS.length;
}
