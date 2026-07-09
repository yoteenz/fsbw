import type { BusinessGenomeOutput, HeadquartersGenerationProposal } from './types';

export const BUSINESS_GENOME_OUTPUTS: BusinessGenomeOutput[] = [
  {
    id: 'business-systems',
    title: 'Business systems',
    description: 'Core systems that make the company operate: sales, delivery, support, finance, knowledge, leadership, and growth.',
    sourcePhaseIds: ['company-discovery', 'relationship-discovery'],
    powersSystems: ['Mission Control™', 'Company Health Index™', 'Organization Digital Twin™'],
  },
  {
    id: 'dependencies',
    title: 'Dependencies',
    description: 'What each workflow needs before it can move: inputs, approvals, owners, materials, knowledge, and tools.',
    sourcePhaseIds: ['relationship-discovery'],
    powersSystems: ['Shadow Mode™', 'Automation Architecture™', 'Executive Council™'],
  },
  {
    id: 'operational-graph',
    title: 'Operational graph',
    description: 'A graph of workflows, departments, owners, inputs, outputs, and feedback loops.',
    sourcePhaseIds: ['company-discovery', 'relationship-discovery'],
    powersSystems: ['World Graph™', 'Studio World Atlas™', 'Organization Operating Manual™'],
  },
  {
    id: 'knowledge-graph',
    title: 'Knowledge graph',
    description: 'Trusted documents, SOPs, policies, research, brand standards, and Profession Brain™ concepts.',
    sourcePhaseIds: ['knowledge-discovery'],
    powersSystems: ['Profession Brain™', 'Knowledge Confidence™', 'Documentation Registry™'],
  },
  {
    id: 'customer-journey',
    title: 'Customer journey',
    description: 'How customers discover, evaluate, buy, receive, return, refer, and trust the company.',
    sourcePhaseIds: ['company-discovery', 'relationship-discovery'],
    powersSystems: ['Customer Experience Concierge™', 'Expert Marketplace™', 'Mission Control™'],
  },
  {
    id: 'revenue-graph',
    title: 'Revenue graph',
    description: 'Products, services, offers, pricing logic, revenue streams, margins, and growth opportunities.',
    sourcePhaseIds: ['company-discovery', 'business-genome'],
    powersSystems: ['Studio Exchange™', 'Knowledge Commerce™', 'Executive Council™'],
  },
  {
    id: 'decision-graph',
    title: 'Decision graph',
    description: 'Founder judgment, approval thresholds, owner rights, escalation rules, and values-based decisions.',
    sourcePhaseIds: ['founder-discovery', 'relationship-discovery'],
    powersSystems: ['Founder Operating System™', 'Executive Council™', 'Command Dock™'],
  },
  {
    id: 'automation-opportunities',
    title: 'Automation opportunities',
    description: 'Safe candidates for observation, assistance, and future automation — always awaiting approval.',
    sourcePhaseIds: ['relationship-discovery', 'business-genome'],
    powersSystems: ['Shadow Mode™', 'Autonomous Preparation™', 'Digital Staff™'],
  },
  {
    id: 'ai-opportunities',
    title: 'AI opportunities',
    description: 'Places where Studio Intelligence™ can summarize, generate, monitor, prepare, or recommend.',
    sourcePhaseIds: ['business-genome'],
    powersSystems: ['Studio Intelligence™', 'Model Orchestrator™', 'Command Dock™'],
  },
  {
    id: 'operational-risks',
    title: 'Operational risks',
    description: 'Bottlenecks, missing owners, outdated knowledge, revenue concentration, fragile workflows, and founder dependency.',
    sourcePhaseIds: ['relationship-discovery', 'knowledge-discovery', 'business-genome'],
    powersSystems: ['Company Health Index™', 'Succession Mode™', 'Organization Pulse™'],
  },
];

export const HEADQUARTERS_GENERATION_PROPOSALS: HeadquartersGenerationProposal[] = [
  {
    id: 'executive-headquarters',
    title: 'Executive Headquarters™',
    description: 'The founder’s primary command environment, generated from mission, leadership style, priorities, and decision graph.',
    genomeInputs: ['Founder Genome™', 'Decision Graph™', 'Business Systems'],
    createdSystems: ['Mission Control™', 'Executive Lobby™', 'Executive Council™'],
  },
  {
    id: 'department-wings',
    title: 'Department Wings™',
    description: 'Recommended operating departments based on offers, workflows, team structure, and growth priorities.',
    genomeInputs: ['Operational Graph™', 'Revenue Graph™', 'Customer Journey'],
    createdSystems: ['Expansion Center™', 'Department Packs™', 'Digital Workforce™'],
  },
  {
    id: 'rooms-workspaces',
    title: 'Rooms™ and Workspaces™',
    description: 'Specific rooms where work happens: strategy, production, knowledge, finance, customer experience, and operations.',
    genomeInputs: ['Workflow Relationship Graph™', 'Knowledge Graph™', 'Automation Opportunities'],
    createdSystems: ['Studio World Atlas™', 'Knowledge Hub™', 'Production Builder™'],
  },
  {
    id: 'orb-configuration',
    title: 'Orb configuration™',
    description: 'Orb personality, cadence, executive tone, escalation behavior, and proactive briefing style.',
    genomeInputs: ['Founder Decision Profile™', 'Leadership Style Profile™', 'Success Definition Record™'],
    createdSystems: ['Orb™', 'Command Dock™', 'Presence Engine™'],
  },
  {
    id: 'mission-system',
    title: 'Mission system™',
    description: 'First missions, priorities, risk reductions, and quick wins generated from Genome evidence.',
    genomeInputs: ['Operational Risks', 'AI Opportunities', 'Founder Goals'],
    createdSystems: ['Mission Control™', 'Executive Timeline™', 'Autonomous Preparation™'],
  },
  {
    id: 'atlas-knowledge-automation',
    title: 'Atlas™, Knowledge, and Automation Architecture™',
    description: 'Spatial map, knowledge organization, and automation roadmap that make Studio OS feel like the company’s operating home.',
    genomeInputs: ['Operational Graph™', 'Knowledge Graph™', 'Automation Opportunities'],
    createdSystems: ['Studio World Atlas™', 'Profession Brain™', 'Shadow Mode™'],
  },
];
