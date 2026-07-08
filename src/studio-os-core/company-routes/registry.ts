import type { StudioWorldCompany } from './types';
import { DEFAULT_COMPANY_SLUG } from './constants';

/**
 * Studio World™ company registry — Frontal Slayer is the first live instance, not the only one.
 */
export const STUDIO_WORLD_COMPANIES: StudioWorldCompany[] = [
  {
    companySlug: 'frontal-slayer',
    companyId: 'frontal-slayer',
    companyName: 'Frontal Slayer',
    workspaceId: 'frontal-slayer',
    genomeId: 'frontal-slayer-genome',
    isLive: true,
    atlasNodeId: 'company-frontal-slayer',
    headquartersLabel: 'The Mansion™',
  },
  {
    companySlug: 'ndxbook',
    companyId: 'ai-media',
    companyName: 'NDXBOOK',
    workspaceId: 'ai-media',
    genomeId: 'ndxbook-genome',
    isLive: true,
    atlasNodeId: 'company-ndxbook',
    headquartersLabel: 'Media Command™',
  },
];

const bySlug = new Map(STUDIO_WORLD_COMPANIES.map((c) => [c.companySlug, c]));
const byWorkspaceId = new Map(STUDIO_WORLD_COMPANIES.map((c) => [c.workspaceId, c]));

export function getCompanyBySlug(slug: string): StudioWorldCompany | null {
  return bySlug.get(slug) ?? null;
}

export function getCompanyByWorkspaceId(workspaceId: string): StudioWorldCompany | null {
  return byWorkspaceId.get(workspaceId) ?? null;
}

export function getDefaultCompany(): StudioWorldCompany {
  return bySlug.get(DEFAULT_COMPANY_SLUG)!;
}

export function listLiveCompanies(): StudioWorldCompany[] {
  return STUDIO_WORLD_COMPANIES.filter((c) => c.isLive);
}

export function resolveCompanySlugFromWorkspaceId(workspaceId: string): string {
  return getCompanyByWorkspaceId(workspaceId)?.companySlug ?? DEFAULT_COMPANY_SLUG;
}
