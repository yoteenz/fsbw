import type { BlueprintDefinition, BlueprintModuleId } from './types';

const CORE_PACKAGES = [
  'dashboard',
  'modules',
  'memory-bible',
  'creative-dna',
  'writing-bible',
  'knowledge-graph',
  'growth-network',
  'labs',
  'ai-media-network',
  'talent-network',
  'marketplace',
  'business-model-engine',
  'ecosystem',
  'governance',
  'interactive-manual',
  'onboarding-tutorial',
  'prompt-library',
  'automation',
  'storage',
  'analytics',
  'approval-workflows',
  'asset-folders',
  'ai-directors',
  'documentation',
  'workflow-templates',
  'reporting-dashboards',
] as const;

const MEDIA_OPTIONAL: BlueprintModuleId[] = [
  'content-pipeline',
  'campaigns',
  'asset-factory',
  'distribution',
  'revenue',
  'social-accounts',
  'system-health',
  'promotion-center',
  'executive-ai-director',
];

const ECOMMERCE_OPTIONAL: BlueprintModuleId[] = [
  'asset-factory',
  'campaigns',
  'distribution',
  'revenue',
  'analytics',
  'promotion-center',
  'executive-ai-director',
];

function blueprint(
  partial: Omit<BlueprintDefinition, 'provisioningPackages' | 'version' | 'tags'> & {
    provisioningPackages?: string[];
    version?: string;
    tags?: string[];
  }
): BlueprintDefinition {
  return {
    version: partial.version ?? '1.0',
    tags: partial.tags ?? [],
    provisioningPackages: partial.provisioningPackages ?? [...CORE_PACKAGES],
    ...partial,
  };
}

/** Initial blueprint library — reusable company templates. */
export const WORKSPACE_BLUEPRINTS: BlueprintDefinition[] = [
  blueprint({
    id: 'ecommerce-brand',
    name: 'Ecommerce Brand',
    description: 'Luxury or DTC retail — product photography, asset factory, campaigns, and distribution.',
    icon: '🛍',
    category: 'Commerce',
    requiredModules: ['dashboard', 'memory-bible', 'creative-dna', 'asset-factory', 'approval-workflows'],
    optionalModules: ECOMMERCE_OPTIONAL,
    defaultAccentColor: '#EB1C24',
    executiveRoleIds: ['luxury-brand-director', 'creative-director', 'head-of-ecommerce', 'photography-director'],
    tags: ['retail', 'product', 'photography'],
  }),
  blueprint({
    id: 'ai-media-company',
    name: 'AI Media Company',
    description:
      'AI-powered educational media — short-form content, multi-platform distribution, audience growth, and automation.',
    icon: '🎬',
    category: 'Media',
    requiredModules: [
      'dashboard',
      'memory-bible',
      'creative-dna',
      'writing-bible',
      'knowledge-graph',
      'content-pipeline',
      'promotion-center',
      'executive-ai-director',
    ],
    optionalModules: MEDIA_OPTIONAL,
    defaultAccentColor: '#6366F1',
    executiveRoleIds: [
      'chief-content-officer',
      'creative-director-media',
      'head-of-distribution',
      'audience-growth-strategist',
      'analytics-director',
      'automation-engineer',
    ],
    tags: ['media', 'pilot', 'content', 'social'],
  }),
  blueprint({
    id: 'saas-platform',
    name: 'SaaS Platform',
    description: 'Software product company — documentation, onboarding, analytics, and automation-first ops.',
    icon: '☁',
    category: 'Technology',
    requiredModules: ['dashboard', 'memory-bible', 'documentation', 'onboarding-tutorial', 'analytics'],
    optionalModules: ['automation', 'approval-workflows', 'reporting-dashboards', 'executive-ai-director'],
    defaultAccentColor: '#0EA5E9',
    executiveRoleIds: ['product-director', 'analytics-director', 'automation-engineer'],
    tags: ['saas', 'software'],
  }),
  blueprint({
    id: 'agency',
    name: 'Agency',
    description: 'Client services — campaigns, creative DNA per client, approval workflows, and asset folders.',
    icon: '🏢',
    category: 'Services',
    requiredModules: ['dashboard', 'memory-bible', 'campaigns', 'approval-workflows', 'asset-folders'],
    optionalModules: ['creative-dna', 'writing-bible', 'distribution', 'executive-ai-director'],
    defaultAccentColor: '#F59E0B',
    executiveRoleIds: ['creative-director', 'campaign-director', 'client-experience-director'],
    tags: ['agency', 'clients'],
  }),
  blueprint({
    id: 'creator-brand',
    name: 'Creator Brand',
    description: 'Personal brand — content pipeline, social accounts, writing bible, and audience analytics.',
    icon: '✨',
    category: 'Creator',
    requiredModules: ['dashboard', 'memory-bible', 'writing-bible', 'content-pipeline', 'social-accounts'],
    optionalModules: ['campaigns', 'distribution', 'revenue', 'executive-ai-director'],
    defaultAccentColor: '#EC4899',
    executiveRoleIds: ['chief-content-officer', 'audience-growth-strategist', 'creative-director-media'],
    tags: ['creator', 'influencer'],
  }),
  blueprint({
    id: 'education-business',
    name: 'Education Business',
    description: 'Courses and learning products — onboarding, documentation, knowledge graph, and writing bible.',
    icon: '📚',
    category: 'Education',
    requiredModules: ['dashboard', 'memory-bible', 'writing-bible', 'knowledge-graph', 'onboarding-tutorial'],
    optionalModules: ['content-pipeline', 'analytics', 'automation', 'executive-ai-director'],
    defaultAccentColor: '#10B981',
    executiveRoleIds: ['chief-content-officer', 'analytics-director'],
    tags: ['education', 'courses'],
  }),
  blueprint({
    id: 'local-service-business',
    name: 'Local Service Business',
    description: 'Salon, studio, or local service — campaigns, approval queue, and customer experience workflows.',
    icon: '📍',
    category: 'Local',
    requiredModules: ['dashboard', 'memory-bible', 'approval-workflows', 'campaigns'],
    optionalModules: ['analytics', 'automation', 'social-accounts'],
    defaultAccentColor: '#14B8A6',
    executiveRoleIds: ['customer-experience-director', 'campaign-director'],
    tags: ['local', 'service'],
  }),
  blueprint({
    id: 'consulting-company',
    name: 'Consulting Company',
    description: 'Advisory firm — documentation, workflow templates, reporting dashboards, and executive AI team.',
    icon: '💼',
    category: 'Consulting',
    requiredModules: ['dashboard', 'memory-bible', 'documentation', 'workflow-templates', 'reporting-dashboards'],
    optionalModules: ['writing-bible', 'analytics', 'executive-ai-director'],
    defaultAccentColor: '#64748B',
    executiveRoleIds: ['product-director', 'analytics-director'],
    tags: ['consulting', 'b2b'],
  }),
  blueprint({
    id: 'startup',
    name: 'Startup',
    description: 'Early-stage company — lean module set with room to enable modules as the business matures.',
    icon: '🚀',
    category: 'Startup',
    requiredModules: ['dashboard', 'memory-bible', 'creative-dna'],
    optionalModules: [
      'writing-bible',
      'campaigns',
      'analytics',
      'automation',
      'promotion-center',
      'executive-ai-director',
    ],
    defaultAccentColor: '#8B5CF6',
    executiveRoleIds: ['product-director', 'creative-director', 'analytics-director'],
    tags: ['startup', 'lean'],
  }),
  blueprint({
    id: 'blank-workspace',
    name: 'Blank Workspace',
    description: 'Empty operating system shell — enable modules manually after launch.',
    icon: '⬜',
    category: 'Custom',
    requiredModules: ['dashboard'],
    optionalModules: CORE_PACKAGES.filter((m) => m !== 'dashboard') as BlueprintModuleId[],
    defaultAccentColor: '#9CA3AF',
    executiveRoleIds: [],
    provisioningPackages: ['dashboard', 'storage', 'documentation'],
    tags: ['blank', 'custom'],
  }),
];

export function getBlueprintById(id: string): BlueprintDefinition | undefined {
  return WORKSPACE_BLUEPRINTS.find((b) => b.id === id);
}

export function listBlueprintCategories(): string[] {
  return [...new Set(WORKSPACE_BLUEPRINTS.map((b) => b.category))];
}
