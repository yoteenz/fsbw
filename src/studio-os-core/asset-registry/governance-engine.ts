import type { AssetGovernanceFinding, AssetImprovementRecommendation } from './types';

export function runAssetGovernanceAudit(): AssetGovernanceFinding[] {
  return [
    {
      id: 'gov-no-scatter',
      severity: 'critical',
      message: 'All organizational assets must register in Asset Registry — no scattered folders.',
      recommendation: 'Migrate unregistered assets from local folders via Asset Director import.',
    },
    {
      id: 'gov-never-overwrite',
      severity: 'critical',
      message: 'Assets are never overwritten — versioning preserves current and all previous versions.',
      recommendation: 'Use version bump workflow — never direct file replacement.',
    },
    {
      id: 'gov-metadata-required',
      severity: 'warning',
      message: 'Unique ID, name, category, owner, and storage location are required metadata.',
      recommendation: 'Complete metadata on assets missing required fields before publish.',
    },
    {
      id: 'gov-brand-compliance',
      severity: 'info',
      message: 'Brand compliance checks run against Design Token Engine and Organization Genome.',
      recommendation: 'Review brand-compliance health metric monthly.',
    },
  ];
}

export function buildAssetRecommendations(unused: number, duplicates: number): AssetImprovementRecommendation[] {
  const recs: AssetImprovementRecommendation[] = [];
  if (unused > 0) {
    recs.push({
      id: 'rec-unused',
      title: `${unused} unused assets — archive or reassign`,
      detail: 'Zero-usage assets clutter search — archive to Legacy Vault or connect to workflows.',
      priority: 'high',
    });
  }
  if (duplicates > 0) {
    recs.push({
      id: 'rec-duplicates',
      title: `${duplicates} duplicate assets detected`,
      detail: 'Merge duplicate logo variants — keep canonical version in registry.',
      priority: 'medium',
    });
  }
  recs.push(
    {
      id: 'rec-brand-archive',
      title: 'Archive outdated brand assets',
      detail: 'Move superseded logos and brand kits to archived state — sync to Legacy Vault.',
      priority: 'medium',
    },
    {
      id: 'rec-alt-text',
      title: 'Add alt text to image assets',
      detail: '18 images missing accessibility metadata — required for brand compliance.',
      priority: 'low',
    }
  );
  return recs;
}

export function computeCatalogCoveragePct(categoryCount: number, totalAssets: number): number {
  return Math.min(99, Math.round((categoryCount * 4 + totalAssets / 10) / 2));
}
