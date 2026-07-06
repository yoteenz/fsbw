import type { ModuleTenantId } from '../workspace/tenant-ids';
import type {
  OrganizationConciergeRef,
  OrganizationExecutiveRef,
  OrganizationKnowledgeRef,
} from './types';

const EXECUTIVES_BY_TENANT: Record<ModuleTenantId, OrganizationExecutiveRef[]> = {
  'frontal-slayer': [
    { id: 'cos', title: 'CHIEF OF STAFF', role: 'Executive coordination' },
    { id: 'cbo', title: 'CHIEF BRAND OFFICER', role: 'Brand governance' },
    { id: 'ceo', title: 'CHIEF EXPERIENCE OFFICER', role: 'Customer experience' },
  ],
  ndxbook: [
    { id: 'cos', title: 'CHIEF OF STAFF', role: 'Editorial coordination' },
    { id: 'editorial-director', title: 'EDITORIAL DIRECTOR', role: 'Page strategy' },
    { id: 'knowledge-concierge', title: 'KNOWLEDGE CONCIERGE', role: 'Reader intelligence' },
  ],
  'studio-os': [
    { id: 'cos', title: 'CHIEF OF STAFF', role: 'Enterprise coordination' },
    { id: 'cgo', title: 'CHIEF GROWTH OFFICER', role: 'Portfolio growth' },
    { id: 'cdo', title: 'CHIEF DIGITAL OFFICER', role: 'Digital ecosystem' },
  ],
  portfolio: [
    { id: 'cos', title: 'CHIEF OF STAFF', role: 'Portfolio coordination' },
    { id: 'platform-intelligence', title: 'STUDIO INTELLIGENCE', role: 'Cross-workspace insights' },
  ],
};

const CONCIERGES_BY_TENANT: Record<ModuleTenantId, OrganizationConciergeRef[]> = {
  'frontal-slayer': [
    { id: 'brand', title: 'BRAND CONCIERGE', domain: 'Creative & campaigns' },
    { id: 'experience', title: 'EXPERIENCE CONCIERGE', domain: 'Member journeys' },
    { id: 'production', title: 'PRODUCTION CONCIERGE', domain: 'Pipeline & renders' },
  ],
  ndxbook: [
    { id: 'editorial', title: 'EDITORIAL CONCIERGE', domain: 'Pages & volumes' },
    { id: 'distribution', title: 'DISTRIBUTION CONCIERGE', domain: 'Publishing channels' },
    { id: 'reader', title: 'READER CONCIERGE', domain: 'Reader intelligence' },
  ],
  'studio-os': [
    { id: 'enterprise', title: 'ENTERPRISE CONCIERGE', domain: 'Multi-brand operations' },
    { id: 'automation', title: 'AUTOMATION CONCIERGE', domain: 'Workflow orchestration' },
  ],
  portfolio: [
    { id: 'portfolio', title: 'PORTFOLIO CONCIERGE', domain: 'Cross-org intelligence' },
    { id: 'platform', title: 'PLATFORM CONCIERGE', domain: 'Studio OS governance' },
  ],
};

const KNOWLEDGE_BY_TENANT: Record<ModuleTenantId, OrganizationKnowledgeRef[]> = {
  'frontal-slayer': [
    { id: 'memory-bible', label: 'MEMORY BIBLE', route: 'memory-bible' },
    { id: 'knowledge-hub', label: 'KNOWLEDGE HUB', route: 'knowledge-hub' },
    { id: 'content-brain', label: 'CONTENT BRAIN', route: 'content-brain' },
  ],
  ndxbook: [
    { id: 'ndxbook', label: 'NDXBOOK REGISTRY', route: 'ndxbook' },
    { id: 'knowledge-hub', label: 'KNOWLEDGE HUB', route: 'knowledge-hub' },
    { id: 'distribution-engine', label: 'DISTRIBUTION ENGINE', route: 'distribution-engine' },
  ],
  'studio-os': [
    { id: 'knowledge-hub', label: 'KNOWLEDGE HUB', route: 'knowledge-hub' },
    { id: 'organizational-inheritance', label: 'ORGANIZATIONAL INHERITANCE', route: 'organizational-inheritance' },
  ],
  portfolio: [
    { id: 'studio-intelligence', label: 'STUDIO INTELLIGENCE', route: 'studio-intelligence' },
    { id: 'knowledge-hub', label: 'KNOWLEDGE HUB', route: 'knowledge-hub' },
  ],
};

export function getOrganizationExecutives(moduleTenantId: ModuleTenantId): OrganizationExecutiveRef[] {
  return EXECUTIVES_BY_TENANT[moduleTenantId] ?? EXECUTIVES_BY_TENANT['studio-os'];
}

export function getOrganizationConcierges(moduleTenantId: ModuleTenantId): OrganizationConciergeRef[] {
  return CONCIERGES_BY_TENANT[moduleTenantId] ?? CONCIERGES_BY_TENANT['studio-os'];
}

export function getOrganizationKnowledge(moduleTenantId: ModuleTenantId): OrganizationKnowledgeRef[] {
  return KNOWLEDGE_BY_TENANT[moduleTenantId] ?? KNOWLEDGE_BY_TENANT['studio-os'];
}
