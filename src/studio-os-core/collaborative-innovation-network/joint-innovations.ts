import {
  JOINT_MARKETPLACE_ASSET_LABELS,
  PUBLICATION_VISIBILITY_LABELS,
} from './constants';
import type {
  FounderGenomeSnapshot,
  InnovationTimelineEvent,
  JointInnovationRecord,
  JointMarketplaceAssetType,
  PublicationVisibility,
} from './types';
import { computeContributionShares } from './contribution-engine';
import { buildRoyaltySplitsFromContributions } from './royalty-engine';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function innovationId(): string {
  return `INNOV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function detectOriginalInnovation(
  title: string,
  founders: FounderGenomeSnapshot[],
  assetType: JointMarketplaceAssetType = 'joint-innovation-packs'
): JointInnovationRecord {
  const contributions = computeContributionShares(founders, title);
  const royaltySplits = buildRoyaltySplitsFromContributions(contributions);
  const now = new Date().toISOString();
  const id = uid('joint');

  const timeline: InnovationTimelineEvent[] = [
    { id: uid('tl'), label: 'Collaboration session began', at: now, actorName: founders[0]?.founderName ?? 'Founder' },
    { id: uid('tl'), label: 'Original innovation detected', at: now, actorName: 'Studio OS' },
    { id: uid('tl'), label: 'Contribution graph computed', at: now, actorName: 'Contribution Engine™' },
  ];

  return {
    id,
    innovationId: innovationId(),
    title,
    summary: `Joint invention combining ${founders.map((f) => f.organizationName).join(' + ')} — ${JOINT_MARKETPLACE_ASSET_LABELS[assetType]}.`,
    assetType,
    assetTypeLabel: JOINT_MARKETPLACE_ASSET_LABELS[assetType],
    visibility: 'private',
    visibilityLabel: PUBLICATION_VISIBILITY_LABELS.private,
    published: false,
    publishedAt: null,
    creators: founders.map((f) => f.founderName),
    contributions,
    royaltySplits,
    timeline,
    version: '1.0.0',
    forks: 0,
    merges: 0,
    descendants: 0,
    marketplacePerformanceScore: 0,
    companiesUsing: 0,
    impactScore: Math.min(99, 55 + founders.length * 10 + contributions.length * 3),
    detectedAt: now,
  };
}

export function publishJointInnovation(
  record: JointInnovationRecord,
  visibility: PublicationVisibility
): JointInnovationRecord {
  const now = new Date().toISOString();
  return {
    ...record,
    visibility,
    visibilityLabel: PUBLICATION_VISIBILITY_LABELS[visibility],
    published: visibility !== 'private',
    publishedAt: visibility !== 'private' ? now : null,
    marketplacePerformanceScore:
      visibility === 'marketplace' || visibility === 'licensed'
        ? Math.min(99, record.impactScore + 15)
        : record.marketplacePerformanceScore,
    timeline: [
      ...record.timeline,
      {
        id: uid('tl'),
        label: `Published as ${PUBLICATION_VISIBILITY_LABELS[visibility]}`,
        at: now,
        actorName: 'Founder',
      },
    ],
  };
}

export function buildDemoJointInnovations(
  organizationId: string,
  companyName: string,
  partners: FounderGenomeSnapshot[]
): JointInnovationRecord[] {
  const founders = [
    {
      founderId: `founder-${organizationId}`,
      founderName: 'Founder',
      organizationId,
      organizationName: companyName,
      layers: {},
      primaryStrengths: ['Creative Direction', 'Storytelling'],
    },
    partners[0]!,
    partners[1]!,
  ].filter(Boolean) as FounderGenomeSnapshot[];

  const detected = detectOriginalInnovation(
    'Immersive Retail Story Stack™',
    founders.slice(0, 3),
    'joint-blueprints'
  );

  const published = publishJointInnovation(
    detectOriginalInnovation('Cross-Org Workflow Automation Pack™', founders.slice(0, 2), 'joint-workflows'),
    'marketplace'
  );
  published.companiesUsing = 4;
  published.marketplacePerformanceScore = 78;

  return [detected, published];
}

export function summarizeJointInnovations(records: JointInnovationRecord[]): string {
  const published = records.filter((r) => r.published);
  return `${records.length} joint innovations · ${published.length} published · ${records.reduce((s, r) => s + r.companiesUsing, 0)} companies using shared inventions.`;
}
