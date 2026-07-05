import type { StrategyHierarchyLevel, StrategyTypeId } from './types';

export const STRATEGY_ENGINE_STORAGE_KEY = 'studioOsStrategyEngine_v1';
export const STRATEGY_ENGINE_VERSION = '1.0.0';
export const STRATEGY_ENGINE_ID = 'strategy-engine';

export const STRATEGY_PLATFORM_CHAIN = [
  { level: 'studio-os', label: 'STUDIO OS', description: 'Platform · intelligence advises · CoS prioritizes · newsroom produces' },
  { level: 'strategy-engine', label: 'STRATEGY ENGINE', description: 'Defines why work matters · the game each company is playing' },
  { level: 'execution', label: 'EXECUTION', description: 'Newsroom · campaigns · products · talent · partnerships' },
] as const;

export const STRATEGY_HIERARCHY_CHAIN: { level: StrategyHierarchyLevel; label: string; description: string }[] = [
  { level: 'vision', label: 'VISION', description: 'Where the company is going long-term' },
  { level: 'mission', label: 'MISSION', description: 'Why the company exists' },
  { level: 'company-objective', label: 'COMPANY OBJECTIVE', description: 'What we are trying to achieve now' },
  { level: 'strategy', label: 'STRATEGY', description: 'How we will win' },
  { level: 'initiatives', label: 'INITIATIVES', description: 'Major programs bridging strategy and execution' },
  { level: 'campaigns', label: 'CAMPAIGNS', description: 'Coordinated pushes toward initiative goals' },
  { level: 'projects', label: 'PROJECTS', description: 'Scoped work units' },
  { level: 'tasks', label: 'TASKS', description: 'Atomic actions' },
  { level: 'outcomes', label: 'OUTCOMES', description: 'Measured results feeding institutional knowledge' },
];

export const STRATEGY_TYPES: { id: StrategyTypeId; label: string }[] = [
  { id: 'growth', label: 'GROWTH STRATEGY' },
  { id: 'content', label: 'CONTENT STRATEGY' },
  { id: 'brand', label: 'BRAND STRATEGY' },
  { id: 'revenue', label: 'REVENUE STRATEGY' },
  { id: 'product', label: 'PRODUCT STRATEGY' },
  { id: 'partnership', label: 'PARTNERSHIP STRATEGY' },
  { id: 'talent', label: 'TALENT STRATEGY' },
  { id: 'marketplace', label: 'MARKETPLACE STRATEGY' },
  { id: 'community', label: 'COMMUNITY STRATEGY' },
  { id: 'distribution', label: 'DISTRIBUTION STRATEGY' },
  { id: 'customer-experience', label: 'CUSTOMER EXPERIENCE STRATEGY' },
  { id: 'operational', label: 'OPERATIONAL STRATEGY' },
  { id: 'launch', label: 'LAUNCH STRATEGY' },
];

export const STRATEGY_BUILDER_STEPS = [
  'Define the objective',
  'Choose the time horizon',
  'Select north star metric',
  'Define target audience',
  'Define current constraints',
  'Define strategic approach',
  'Identify initiatives',
  'Select success metrics',
  'Identify risks',
  'Approve strategy',
] as const;

export const COS_STRATEGY_QUESTIONS = [
  { question: 'What moves the company closer to its objective?', guidance: 'Prioritize by strategic impact score · defer low-alignment work' },
  { question: 'What can be delegated?', guidance: 'Fully-autonomous when reversible · CoS soft approval when threshold met' },
  { question: 'What requires founder judgment?', guidance: 'Irreversible · brand-defining · above delegation band' },
  { question: 'What should be paused?', guidance: 'Work that does not support active strategy · flag for review' },
] as const;

export const STRATEGY_CONNECTED_SYSTEMS = [
  'Company DNA',
  'Leadership DNA',
  'Memory Bible',
  'Knowledge Graph',
  'Chief of Staff',
  'Studio Intelligence',
  'Newsroom',
  'Growth Network',
  'Talent Network',
  'Creator Marketplace',
  'Business Model Engine',
  'Studio OS Labs',
  'Simulation Engine',
  'Organizational Inheritance',
] as const;
