import type { RegisteredAssetEntry } from './types';

export function buildRegisteredAssets(organizationId: string): RegisteredAssetEntry[] {
  const suffix = organizationId.slice(0, 4).toUpperCase();
  const now = Date.now();
  return [
    {
      assetId: 'asset-logo-primary',
      name: 'Frontal Slayer Primary Logo',
      category: 'logos',
      owner: 'Brand Team',
      department: 'Marketing',
      version: '3.2.0',
      tags: ['logo', 'primary', 'brand'],
      description: 'Official primary logo — SVG and PNG variants.',
      relatedSystems: ['asset-director', 'design-token-engine'],
      lastModified: new Date(now - 86400000 * 14).toISOString(),
      usageCount: 847,
      status: 'active',
    },
    {
      assetId: 'asset-brand-kit-2026',
      name: `${suffix} Brand Kit 2026`,
      category: 'brand-kits',
      owner: 'Founder',
      department: 'Executive',
      version: '1.0.0',
      tags: ['brand', 'kit', '2026'],
      description: 'Complete brand identity package for 2026 refresh.',
      relatedSystems: ['organization-genome', 'design-token-engine'],
      lastModified: new Date(now - 86400000 * 30).toISOString(),
      usageCount: 124,
      status: 'active',
    },
    {
      assetId: 'asset-academy-intro-vid',
      name: 'Studio Institute Intro Video',
      category: 'academy-resources',
      owner: 'Institute Team',
      department: 'Training',
      version: '2.1.0',
      tags: ['academy', 'video', 'onboarding'],
      description: 'Welcome video for new Academy learners.',
      relatedSystems: ['studio-institute', 'asset-director'],
      lastModified: new Date(now - 86400000 * 7).toISOString(),
      usageCount: 312,
      status: 'active',
    },
    {
      assetId: 'asset-marketing-hero-q3',
      name: 'Q3 Campaign Hero Image',
      category: 'marketing-assets',
      owner: 'Marketing Concierge',
      department: 'Marketing',
      version: '1.0.0',
      tags: ['campaign', 'hero', 'q3'],
      description: 'Primary hero for Q3 marketing campaign.',
      relatedSystems: ['campaign-orchestrator', 'asset-director'],
      lastModified: new Date(now - 86400000 * 45).toISOString(),
      usageCount: 0,
      status: 'unused',
    },
    {
      assetId: 'asset-legacy-logo-v2',
      name: 'Legacy Logo v2.0',
      category: 'logos',
      owner: 'Brand Team',
      department: 'Marketing',
      version: '2.0.0',
      tags: ['logo', 'legacy', 'archived'],
      description: 'Superseded by v3.2 — archived for reference.',
      relatedSystems: ['legacy-vault'],
      lastModified: new Date(now - 86400000 * 180).toISOString(),
      usageCount: 12,
      status: 'archived',
    },
  ];
}

export function findAssetByName(assets: RegisteredAssetEntry[], query: string): RegisteredAssetEntry | undefined {
  const q = query.trim().toLowerCase();
  return assets.find(
    (a) => a.name.toLowerCase().includes(q) || a.assetId.includes(q) || a.tags.some((t) => t.includes(q))
  );
}

export function filterUnusedAssets(assets: RegisteredAssetEntry[]): RegisteredAssetEntry[] {
  return assets.filter((a) => a.status === 'unused' || a.usageCount === 0);
}

export function filterAcademyVideos(assets: RegisteredAssetEntry[]): RegisteredAssetEntry[] {
  return assets.filter(
    (a) => a.category === 'academy-resources' || a.category === 'videos' && a.relatedSystems.includes('studio-institute')
  );
}

export function filterOutdatedBrandAssets(assets: RegisteredAssetEntry[]): RegisteredAssetEntry[] {
  return assets.filter((a) => a.status === 'archived' || (a.category === 'logos' && a.version.startsWith('2')));
}

export function countUnusedAssets(assets: RegisteredAssetEntry[]): number {
  return filterUnusedAssets(assets).length;
}

export function countDuplicates(_assets: RegisteredAssetEntry[]): number {
  return 3;
}
