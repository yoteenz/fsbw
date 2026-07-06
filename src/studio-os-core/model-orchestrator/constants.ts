/** Milestone 123 — Model Orchestrator™ & AI Swap Engine™ V1.0 */

export const MODEL_ORCHESTRATOR_STORAGE_KEY = 'studioOsModelOrchestrator_v1';
export const MODEL_ORCHESTRATOR_VERSION = '1.0.0';
export const STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED = 'studio-os-model-orchestrator-updated';

export const MODEL_ORCHESTRATOR_ACCENT = '#0D9488';

export const MODEL_ORCHESTRATOR_PHILOSOPHY = [
  'No Studio OS feature should depend on one AI provider — models are replaceable; Studio Intelligence™ remains permanent.',
  'If OpenAI, Anthropic, Google, xAI, or any future provider becomes unavailable, Studio OS continues by switching reasoning engines.',
  'AI providers become interchangeable engines — Studio OS remains the operating system.',
  'Models can change. Studio Intelligence™ remains.',
] as const;

/** Model providers — interchangeable reasoning engines */
export const ORCHESTRATOR_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'xai',
  'local',
  'offline',
] as const;

export const ORCHESTRATOR_PROVIDER_LABELS: Record<(typeof ORCHESTRATOR_PROVIDERS)[number], string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  xai: 'xAI',
  local: 'Local Model',
  offline: 'Offline Mode',
};

/** Multi-model routing — task types may use different providers */
export const ROUTING_TASK_TYPES = [
  'creative-writing',
  'strategy',
  'research',
  'code',
  'math',
  'summarization',
  'legal-preparation',
  'medical-education',
  'fast-replies',
  'offline-assistance',
  'private-enterprise-reasoning',
] as const;

export const ROUTING_TASK_LABELS: Record<(typeof ROUTING_TASK_TYPES)[number], string> = {
  'creative-writing': 'Creative Writing',
  strategy: 'Strategy',
  research: 'Research',
  code: 'Code',
  math: 'Math',
  summarization: 'Summarization',
  'legal-preparation': 'Legal Preparation',
  'medical-education': 'Medical Education',
  'fast-replies': 'Fast Replies',
  'offline-assistance': 'Offline Assistance',
  'private-enterprise-reasoning': 'Private Enterprise Reasoning',
};

/** AI Swap Engine™ — features that continue working after provider switch */
export const SWAP_PROTECTED_FEATURES = [
  'command-dock',
  'digital-concierges',
  'profession-brain',
  'studio-institute',
  'executive-council',
  'content-generation',
  'research',
  'analysis',
  'summaries',
  'automations',
  'knowledge-commerce',
  'screening-room',
  'production-studio',
] as const;

export const SWAP_PROTECTED_FEATURE_LABELS: Record<(typeof SWAP_PROTECTED_FEATURES)[number], string> = {
  'command-dock': 'Command Dock™',
  'digital-concierges': 'Digital Concierges',
  'profession-brain': 'Profession Brain™',
  'studio-institute': 'Studio Institute™',
  'executive-council': 'Executive Council™',
  'content-generation': 'Content Generation',
  research: 'Research',
  analysis: 'Analysis',
  summaries: 'Summaries',
  automations: 'Automations',
  'knowledge-commerce': 'Knowledge Commerce™',
  'screening-room': 'Screening Room™',
  'production-studio': 'Production Studio™',
};

/** Failover pipeline — never collapse because one provider fails */
export const FAILOVER_STEPS = [
  'retry',
  'switch-provider',
  'backup-model',
  'local-model',
  'graceful-degrade',
  'explain-when-needed',
] as const;

export const FAILOVER_STEP_LABELS: Record<(typeof FAILOVER_STEPS)[number], string> = {
  retry: 'Retry Request',
  'switch-provider': 'Switch Provider',
  'backup-model': 'Use Backup Model',
  'local-model': 'Use Local Model',
  'graceful-degrade': 'Graceful Degrade',
  'explain-when-needed': 'Explain Only When Needed',
};

/** Local + offline model capabilities */
export const LOCAL_OFFLINE_CAPABILITIES = [
  'basic-search',
  'summaries',
  'private-notes',
  'offline-command-handling',
  'document-organization',
  'simple-workflows',
  'enterprise-sensitive-data',
] as const;

export const LOCAL_OFFLINE_CAPABILITY_LABELS: Record<(typeof LOCAL_OFFLINE_CAPABILITIES)[number], string> = {
  'basic-search': 'Basic Search',
  summaries: 'Summaries',
  'private-notes': 'Private Notes',
  'offline-command-handling': 'Offline Command Handling',
  'document-organization': 'Document Organization',
  'simple-workflows': 'Simple Workflows',
  'enterprise-sensitive-data': 'Enterprise-Sensitive Data',
};

/** Model benchmarking dimensions */
export const BENCHMARK_DIMENSIONS = [
  'accuracy',
  'speed',
  'cost',
  'tone',
  'reasoning-quality',
  'professional-reliability',
  'organization-fit',
  'privacy',
  'founder-preference',
] as const;

export const BENCHMARK_DIMENSION_LABELS: Record<(typeof BENCHMARK_DIMENSIONS)[number], string> = {
  accuracy: 'Accuracy',
  speed: 'Speed',
  cost: 'Cost',
  tone: 'Tone',
  'reasoning-quality': 'Reasoning Quality',
  'professional-reliability': 'Professional Reliability',
  'organization-fit': 'Organization Fit',
  privacy: 'Privacy',
  'founder-preference': 'Founder Preference',
};

/** Orchestrator routing criteria */
export const ORCHESTRATOR_CRITERIA = [
  'best-model-for-task',
  'cost',
  'speed',
  'quality',
  'privacy-requirements',
  'organization-settings',
  'data-sensitivity',
  'professional-trust-requirements',
  'fallback-options',
  'local-model-availability',
] as const;

export const ORCHESTRATOR_CRITERIA_LABELS: Record<(typeof ORCHESTRATOR_CRITERIA)[number], string> = {
  'best-model-for-task': 'Best Model for Task',
  cost: 'Cost',
  speed: 'Speed',
  quality: 'Quality',
  'privacy-requirements': 'Privacy Requirements',
  'organization-settings': 'Organization Settings',
  'data-sensitivity': 'Data Sensitivity',
  'professional-trust-requirements': 'Professional Trust Requirements',
  'fallback-options': 'Fallback Options',
  'local-model-availability': 'Local Model Availability',
};
