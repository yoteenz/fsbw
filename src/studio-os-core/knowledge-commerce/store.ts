import {
  KNOWLEDGE_COMMERCE_STORAGE_KEY,
  KNOWLEDGE_COMMERCE_VERSION,
  STUDIO_OS_KNOWLEDGE_COMMERCE_UPDATED,
} from './constants';
import { buildAiExpertExperiences } from './ai-expert-experiences';
import { buildBrainCommerceDashboards } from './commerce-dashboard';
import { buildCustomerJourney } from './customer-journey';
import { buildKnowledgeProductsFromProfile } from './product-builder';
import { buildRevenueIntelligence, detectCommerceOpportunities } from './revenue-intelligence';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { resolveFounderName } from '../organization-inauguration/charter-generator';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import type { KnowledgeCommerceStore, OrganizationKnowledgeCommerceProfile } from './types';

function emptyStore(): KnowledgeCommerceStore {
  return { version: KNOWLEDGE_COMMERCE_VERSION, profiles: [] };
}

export function readKnowledgeCommerceStore(): KnowledgeCommerceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(KNOWLEDGE_COMMERCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as KnowledgeCommerceStore;
    return { ...emptyStore(), ...parsed, version: KNOWLEDGE_COMMERCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeKnowledgeCommerceStore(store: KnowledgeCommerceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KNOWLEDGE_COMMERCE_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_KNOWLEDGE_COMMERCE_UPDATED));
  }
}

export function getOrganizationKnowledgeCommerceProfile(
  organizationId: string
): OrganizationKnowledgeCommerceProfile | null {
  return readKnowledgeCommerceStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

export function buildKnowledgeCommerceProfile(
  organizationId: string
): OrganizationKnowledgeCommerceProfile | null {
  const brainProfile = getOrganizationProfessionBrainProfile(organizationId);
  if (!brainProfile) return null;

  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const founder = blueprint ? resolveFounderName(blueprint) : 'Founder';
  const products = buildKnowledgeProductsFromProfile(brainProfile, founder);
  const brainDashboards = buildBrainCommerceDashboards(brainProfile, products);
  const totalMrr = brainDashboards.reduce((s, d) => s + d.monthlyRecurringRevenueUsd, 0);
  const totalLifetime = brainDashboards.reduce((s, d) => s + d.lifetimeRevenueUsd, 0);

  return {
    organizationId,
    companyName: brainProfile.companyName,
    industryId: brainProfile.industryId,
    updatedAt: new Date().toISOString(),
    brainSyncedAt: brainProfile.updatedAt,
    products,
    aiExpertExperiences: buildAiExpertExperiences(brainProfile),
    brainDashboards,
    customerJourney: buildCustomerJourney(),
    revenueInsights: buildRevenueIntelligence(brainProfile, products),
    opportunities: detectCommerceOpportunities(brainProfile),
    totalMrrUsd: totalMrr,
    totalLifetimeRevenueUsd: totalLifetime,
  };
}

export function syncKnowledgeCommerceFromProfessionBrain(
  organizationId: string
): OrganizationKnowledgeCommerceProfile | null {
  const profile = buildKnowledgeCommerceProfile(organizationId);
  if (!profile) return null;

  const store = readKnowledgeCommerceStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeKnowledgeCommerceStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function ensureOrganizationKnowledgeCommerceProfile(
  organizationId: string
): OrganizationKnowledgeCommerceProfile | null {
  const existing = getOrganizationKnowledgeCommerceProfile(organizationId);
  if (existing) return existing;
  return syncKnowledgeCommerceFromProfessionBrain(organizationId);
}

export function setKnowledgeProductPublished(
  organizationId: string,
  productId: string,
  published: boolean
): void {
  const profile = getOrganizationKnowledgeCommerceProfile(organizationId);
  if (!profile) return;
  const products = profile.products.map((p) =>
    p.id === productId ? { ...p, published, status: published ? 'published' as const : 'draft' as const } : p
  );
  const updated = { ...profile, products, updatedAt: new Date().toISOString() };
  const store = readKnowledgeCommerceStore();
  const next = store.profiles.filter((p) => p.organizationId !== organizationId);
  writeKnowledgeCommerceStore({ ...store, profiles: [...next, updated] });
}

export function bootstrapKnowledgeCommerceForOrg(organizationId: string): void {
  syncKnowledgeCommerceFromProfessionBrain(organizationId);
}
