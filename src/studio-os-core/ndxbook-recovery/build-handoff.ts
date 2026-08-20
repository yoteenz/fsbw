/**
 * Builds the NDXbook legacy intelligence handoff package from fsbw canonical sources.
 * Read-only — does not fetch runtime secrets or mutate databases.
 */

import {
  BRAND_DESCRIPTION,
  BRAND_POSITIONING,
  BRAND_PROMISE,
  DEFAULT_BRAND,
  DEFAULT_CREATIVE_DNA,
  DEFAULT_PROGRAMMING,
  DEFAULT_SOCIAL_ACCOUNTS,
  DEFAULT_TAXONOMY,
  DEFAULT_VOICE_RULES,
  INTERNAL_MEANING,
  LAUNCH_VOLUMES,
  NDXBOOK_PLATFORMS,
  PLATFORM_LABELS,
} from '../ndxbook/constants';
import { PAGE_001_CONTENT } from '../ndxbook/pagePipeline';
import { PAGE_001_DISTRIBUTION_PACK_ID } from '../ndxbook/distributionBridge';
import type {
  ClassifiedField,
  EvolveGapEntry,
  FounderQuestion,
  NdxbookLegacyIntelligencePackage,
  ProvenanceRecord,
} from './types';
import { sanitizeForHandoff } from './sanitize';

const REPO = 'yoteenz/fsbw';

function prov(file: string, note?: string, line?: number): ProvenanceRecord[] {
  return [{ repository: REPO, file, line, note }];
}

function field<T>(
  value: T,
  classification: ClassifiedField<T>['classification'],
  confidence: ClassifiedField<T>['confidence'],
  provenance: ProvenanceRecord[],
  notes?: string
): ClassifiedField<T> {
  return { value, classification, confidence, provenance, notes };
}

export function buildNdxbookLegacyHandoff(input: {
  commitSha: string;
  branch?: string;
}): NdxbookLegacyIntelligencePackage {
  const brandConstantsProv = prov('src/studio-os-core/ndxbook/constants.ts', 'NDXBook v1.0 brand constants');
  const typesProv = prov('src/studio-os-core/ndxbook/types.ts', 'Public media brand type definitions');
  const memoryProv = prov('motherboard/MEMORY.md', 'Milestone 29.5 creation context', undefined);

  const pkg: NdxbookLegacyIntelligencePackage = {
    meta: {
      packageId: 'ndxbook-legacy-intelligence-v1',
      generatedAt: new Date().toISOString(),
      sourceRepository: REPO,
      sourceBranch: input.branch ?? 'master',
      sourceCommit: input.commitSha,
      targetEvolveSlug: 'ndxbook',
      targetEvolveOrganizationUuid: '7681ab75-bddc-43e5-b594-79fcf8168205',
      boundary: 'READ_ONLY_RECOVERY — no runtime coupling to fsbw',
    },
    brand: {
      publicName: field('ndxbook', 'CANONICAL', 'HIGH', brandConstantsProv, 'Lowercase styling in DEFAULT_BRAND'),
      internalName: field('index book', 'CANONICAL', 'HIGH', brandConstantsProv),
      positioning: field(BRAND_POSITIONING, 'CANONICAL', 'HIGH', brandConstantsProv),
      promise: field(BRAND_PROMISE, 'CANONICAL', 'HIGH', brandConstantsProv),
      description: field(BRAND_DESCRIPTION, 'CANONICAL', 'HIGH', brandConstantsProv),
      internalMeaning: field(INTERNAL_MEANING, 'CANONICAL', 'HIGH', brandConstantsProv),
      architecture: field(DEFAULT_BRAND.architecture, 'REFERENCE', 'HIGH', brandConstantsProv, 'Studio World internal layering'),
      taxonomy: field(DEFAULT_TAXONOMY, 'CANONICAL', 'HIGH', brandConstantsProv),
      slug: field('ndxbook', 'DUPLICATE', 'HIGH', [
        { repository: REPO, file: 'src/studio-os-core/ndxbook/constants.ts' },
        { repository: 'SITE00/EVOLVE', note: 'Organization already registered — do not re-create' },
      ]),
    },
    business: {
      concept: field(
        'Educational indexed media brand — short-form knowledge pages across money, health, psychology, AI, tech, consumer life.',
        'CANONICAL',
        'HIGH',
        brandConstantsProv
      ),
      productService: field(
        'Short-form educational video pages (called “pages”) organized into volumes and chapters; multi-platform distribution.',
        'CANONICAL',
        'MEDIUM',
        [...brandConstantsProv, ...prov('src/studio-os-core/ndxbook/types.ts')]
      ),
      valueProposition: field(BRAND_POSITIONING, 'CANONICAL', 'HIGH', brandConstantsProv),
      monetization: field(
        'Media · sponsorship · premium · affiliate (strategy engine seed)',
        'OWNER_CONFIRMATION_REQUIRED',
        'LOW',
        prov('src/studio-os-core/strategy-engine/bootstrap.ts', 'Demo seed — not founder-locked'),
        'Existence in demo seed ≠ approved business model'
      ),
      businessModel: field(
        'Educational media / publishing pilot inside Studio World AI Media workspace',
        'REFERENCE',
        'MEDIUM',
        [...memoryProv, ...prov('founder-intelligence/COMPANIES.md')]
      ),
    },
    audience: {
      targetAudience: field(
        'Curious adults 25–45 seeking practical knowledge (strategy engine seed)',
        'OWNER_CONFIRMATION_REQUIRED',
        'MEDIUM',
        prov('src/studio-os-core/strategy-engine/bootstrap.ts'),
        'Useful hypothesis — requires founder confirmation for EVOLVE canon'
      ),
      audienceTerm: field('readers', 'CANONICAL', 'HIGH', brandConstantsProv),
      communities: field(
        ['money', 'health', 'psychology', 'AI', 'technology', 'consumer intelligence'],
        'REFERENCE',
        'MEDIUM',
        brandConstantsProv,
        'Topic communities implied by volume/chapter taxonomy'
      ),
    },
    voice: {
      voiceTraits: field(DEFAULT_VOICE_RULES.voice, 'CANONICAL', 'HIGH', brandConstantsProv),
      avoid: field(DEFAULT_VOICE_RULES.avoid, 'CANONICAL', 'HIGH', brandConstantsProv),
      copyStyle: field(DEFAULT_VOICE_RULES.copyStyle, 'CANONICAL', 'HIGH', brandConstantsProv),
      pageQuestions: field(DEFAULT_VOICE_RULES.pageQuestions, 'CANONICAL', 'HIGH', brandConstantsProv),
    },
    visualIdentity: {
      creativeDnaStatus: field(DEFAULT_CREATIVE_DNA.status, 'OWNER_CONFIRMATION_REQUIRED', 'HIGH', brandConstantsProv, 'Explicitly placeholder — not approved'),
      styleDirection: field(DEFAULT_CREATIVE_DNA.styleDirection, 'REFERENCE', 'MEDIUM', brandConstantsProv),
      visualSystem: field(DEFAULT_CREATIVE_DNA.visualSystem, 'REFERENCE', 'MEDIUM', brandConstantsProv),
      accentColor: field('#6366F1', 'REFERENCE', 'MEDIUM', prov('src/utils/adminStudioDistributionNetworkOrgDefaults.ts', 'NDXBOOK distribution accent')),
      thumbnailPalette: field(
        { background: '#0F172A', accent: '#6366F1', text: '#F8FAFC' },
        'REFERENCE',
        'MEDIUM',
        prov('src/studio-os-core/ndxbook/pagePipeline.ts', 'Page 001 SVG thumbnail generator')
      ),
      designGenomeHero: field(
        'Knowledge Page Hero — editorial benchmark (founder phrase in seed)',
        'REFERENCE',
        'MEDIUM',
        prov('src/studio-os-core/design-genome/bootstrap.ts', 'dg-ndx-article-hero — verify route attribution'),
        'Capture route references lace-mastery — possible mis-attribution vs money/credit Page 001'
      ),
    },
    strategy: {
      originalPurpose: field(
        'Studio World test/guinea-pig brand inside AI Media workspace (Milestone 29.5) — validates Master Content Pipeline, Mission Control, Newsroom, Page 001 pilot, social OAuth wiring.',
        'CANONICAL',
        'HIGH',
        memoryProv
      ),
      companyObjective: field(
        'Reach 100,000 readers (strategy demo seed)',
        'OWNER_CONFIRMATION_REQUIRED',
        'LOW',
        prov('src/studio-os-core/strategy-engine/bootstrap.ts')
      ),
      contentStrategy: field(
        'Daily indexed pages · volume cadence · Money Monday through Future Friday programming',
        'CANONICAL',
        'HIGH',
        [...brandConstantsProv, prov('src/studio-os-core/strategy-engine/bootstrap.ts')]
      ),
      northStarMetric: field('Returning readers (demo seed)', 'OWNER_CONFIRMATION_REQUIRED', 'LOW', prov('src/studio-os-core/strategy-engine/bootstrap.ts')),
    },
    marketing: {
      primaryObjective: field(
        'Build returning reader habit (demo seed)',
        'OWNER_CONFIRMATION_REQUIRED',
        'LOW',
        prov('src/studio-os-core/strategy-engine/bootstrap.ts')
      ),
      channelPriorities: field(
        NDXBOOK_PLATFORMS.map((p) => PLATFORM_LABELS[p]),
        'REFERENCE',
        'MEDIUM',
        brandConstantsProv,
        'Pilot mode locks to Instagram-first — see founder-pilot seeds'
      ),
      instagramRole: field(
        'First controlled publishing destination for Page 001 pilot',
        'CANONICAL',
        'HIGH',
        [
          prov('docs/NDXBOOK_PAGE_001_PIPELINE.md'),
          prov('src/studio-os-core/founder-pilot-mode/seeds/ndxbook-pilot.ts'),
        ]
      ),
      publishingCadence: field(DEFAULT_PROGRAMMING, 'CANONICAL', 'HIGH', brandConstantsProv),
      ctaStrategy: field('INDIGO CTA · READ PAGE · SUBSCRIBE', 'REFERENCE', 'MEDIUM', prov('src/utils/adminStudioDistributionNetworkOrgDefaults.ts')),
      launchState: field(
        'Pre-launch pilot — Founder Pilot Mode starts at Page 001 with zero demo history',
        'CANONICAL',
        'HIGH',
        [
          prov('src/studio-os-core/founder-pilot-mode/seeds/ndxbook-pilot.ts'),
          prov('motherboard/MEMORY.md', 'Milestone 87 Founder Pilot Mode'),
        ]
      ),
      automationPreference: field(
        null,
        'REFERENCE',
        'LOW',
        prov('docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.json'),
        'No explicit automation preference documented in fsbw — EVOLVE assessment must ask'
      ),
    },
    content: {
      contentPillars: field(
        LAUNCH_VOLUMES.map((v) => ({ id: v.id, label: v.displayLabel, chapters: v.chapters })),
        'CANONICAL',
        'HIGH',
        brandConstantsProv
      ),
      page001Pilot: field(
        {
          title: PAGE_001_CONTENT.title,
          hook: PAGE_001_CONTENT.hook,
          volumeId: PAGE_001_CONTENT.volumeId,
          chapter: PAGE_001_CONTENT.chapter,
          platforms: PAGE_001_CONTENT.platforms,
          hashtags: PAGE_001_CONTENT.hashtags,
        },
        'REFERENCE',
        'HIGH',
        prov('src/studio-os-core/ndxbook/pagePipeline.ts', 'PAGE_001_CONTENT — pilot seed, not published canon'),
        'Approved for pipeline testing only until founder publishes'
      ),
      distributionPackPilot: field(PAGE_001_DISTRIBUTION_PACK_ID, 'STUDIO_WORLD_ONLY', 'HIGH', prov('src/studio-os-core/ndxbook/distributionBridge.ts')),
    },
    channels: {
      platformRegistry: field(
        DEFAULT_SOCIAL_ACCOUNTS.map((a) => ({ platform: a.platform, status: a.status, handle: a.handle })),
        'REFERENCE',
        'HIGH',
        brandConstantsProv,
        'Code defaults are placeholders — production may differ'
      ),
      productionInstagramConnected: field(
        { platform: 'instagram', accountLabel: 'Ndxbook (Meta page connected)', status: 'connected' },
        'OWNER_CONFIRMATION_REQUIRED',
        'HIGH',
        [{ repository: REPO, databaseTable: 'studio_social_accounts', note: 'Read-only inspection — no tokens exported' }],
        'Confirm this is the canonical EVOLVE pilot account; tokens remain in Supabase only'
      ),
    },
    assets: [
      field(
        {
          assetId: 'ndxbook-page-001-thumbnail',
          type: 'image/svg+xml',
          path: 'generated inline — pagePipeline.buildNdxbookThumbnailDataUrl',
          status: 'EXPERIMENTAL',
          intendedUse: 'Page 001 Instagram pilot thumbnail',
        },
        'REFERENCE',
        'HIGH',
        prov('src/studio-os-core/ndxbook/pagePipeline.ts')
      ),
    ],
    studioWorldHistory: {
      workspaceId: field('ai-media', 'STUDIO_WORLD_ONLY', 'HIGH', brandConstantsProv),
      adminRoutes: field(
        [
          '/admin/studio/ndxbook',
          '/admin/studio/ndxbook/mission-control',
          '/admin/studio/ndxbook/newsroom',
          '/admin/studio/ndxbook/creative-direction',
          '/admin/studio/companies/ndxbook/*',
        ],
        'STUDIO_WORLD_ONLY',
        'HIGH',
        prov('src/App.tsx')
      ),
      pagePipeline: field('create → review → approve → schedule → publish (Master Content Pipeline gates)', 'STUDIO_WORLD_ONLY', 'HIGH', prov('docs/NDXBOOK_PAGE_001_PIPELINE.md')),
      demoMissionControlHistory: field('Pages 019–042 demo metrics (M37 seed)', 'OBSOLETE', 'HIGH', prov('src/studio-os-core/ndxbook/mission-control/bootstrap.ts', 'Superseded by Founder Pilot zero-history seed')),
      productionGovernanceOrg: field('No ndxbook row in studio_world_organizations (production DB read-only)', 'NOT_FOUND', 'HIGH', [{ repository: REPO, databaseTable: 'studio_world_organizations', note: 'Queried production — empty for ndx slug' }]),
    },
    evolveGapAnalysis: buildEvolveGapAnalysis(),
    founderQuestions: buildFounderQuestions(),
    provenance: [
      { repository: REPO, file: 'src/studio-os-core/ndxbook/constants.ts', note: 'Primary brand canon source' },
      { repository: REPO, file: 'docs/NDXBOOK_PAGE_001_PIPELINE.md', note: 'Page 001 operational runbook' },
      { repository: REPO, file: 'motherboard/MEMORY.md', note: 'Milestone history and decisions' },
    ],
    conflicts: [
      field(
        {
          topic: 'Demo publishing history vs Founder Pilot zero-history',
          values: ['Mission Control M37 demo (pages 019–042)', 'Founder Pilot Mode (pages: [])'],
        },
        'CONFLICT',
        'HIGH',
        [
          prov('src/studio-os-core/ndxbook/mission-control/bootstrap.ts'),
          prov('src/studio-os-core/founder-pilot-mode/seeds/ndxbook-pilot.ts'),
        ],
        'EVOLVE must not import demo page counts as live truth'
      ),
      field(
        {
          topic: 'Design Genome hero capture route',
          values: ['/ndxbook/lace-mastery/cutting-your-lace', 'Page 001 money/credit Instagram pilot'],
        },
        'CONFLICT',
        'MEDIUM',
        prov('src/studio-os-core/design-genome/bootstrap.ts'),
        'Possible mis-attributed capture — founder review required'
      ),
    ],
    obsolete: [
      field(
        'Distribution demo packs dist-ndx-page-042, dist-ndx-money-monday-12, dist-ndx-social-cuts',
        'OBSOLETE',
        'HIGH',
        prov('src/utils/adminStudioDistributionNetworkOrgDefaults.ts'),
        'Demo scheduling data — not active under Founder Pilot'
      ),
    ],
    importContract: {
      packageName: 'NdxbookLegacyIntelligencePackage',
      stages: ['DISCOVERED', 'REVIEWED', 'OWNER_CONFIRMED', 'IMPORT_APPROVED', 'IMPORTED'],
      mappingRecommendations: {
        CANONICAL_HIGH: 'SITE 00 Content Brain + marketing profile direct import candidate',
        OWNER_CONFIRMATION_REQUIRED: 'EVOLVE assessment prompt — block auto-canon',
        REFERENCE: 'Content Brain reference layer / campaign archives',
        STUDIO_WORLD_ONLY: 'Do not import — retain link to Studio World production systems only',
        CONFLICT: 'Founder resolution queue before import',
        OBSOLETE: 'Archive metadata only',
        DUPLICATE: 'Skip — SITE 00 already holds org identity UUID',
      },
      rules: [
        'CANONICAL + HIGH may be recommended for direct import after REVIEWED',
        'OWNER_CONFIRMATION_REQUIRED must never become canon without founder confirmation',
        'REFERENCE remains reference intelligence',
        'STUDIO_WORLD_ONLY must never copy into EVOLVE brand canon',
        'CONFLICT remains unresolved until founder decision',
        'OBSOLETE must not import as active truth',
        'No runtime fetch from fsbw — portable JSON/MD handoff only',
      ],
    },
  };

  return sanitizeForHandoff(pkg);
}

function buildEvolveGapAnalysis(): EvolveGapEntry[] {
  return [
    { domain: 'organization identity', status: 'NOT_APPLICABLE', summary: 'slug ndxbook + UUID 7681ab75-bddc-43e5-b594-79fcf8168205 already registered in SITE 00 EVOLVE — do not duplicate' },
    { domain: 'business description', status: 'RECOVERED_CANONICAL', summary: BRAND_DESCRIPTION, sourceField: 'brand.description' },
    { domain: 'product/service', status: 'RECOVERED_CANONICAL', summary: 'Indexed educational short-form pages (volumes/chapters/pages)', sourceField: 'business.productService' },
    { domain: 'value proposition', status: 'RECOVERED_CANONICAL', summary: BRAND_POSITIONING, sourceField: 'brand.positioning' },
    { domain: 'target audience', status: 'RECOVERED_NEEDS_CONFIRMATION', summary: 'Curious adults 25–45 (demo seed only)', sourceField: 'audience.targetAudience' },
    { domain: 'primary marketing objective', status: 'RECOVERED_NEEDS_CONFIRMATION', summary: 'Build returning reader habit (demo seed)', sourceField: 'marketing.primaryObjective' },
    { domain: 'secondary objectives', status: 'RECOVERED_NEEDS_CONFIRMATION', summary: 'Newsletter, reader graph, cross-platform distribution (demo seed)', sourceField: 'strategy' },
    { domain: 'brand voice', status: 'RECOVERED_CANONICAL', summary: 'clear, curious, sharp, useful, slightly mysterious', sourceField: 'voice.voiceTraits' },
    { domain: 'visual identity', status: 'RECOVERED_NEEDS_CONFIRMATION', summary: 'Creative DNA placeholder — editorial/minimal/indigo accent reference', sourceField: 'visualIdentity' },
    { domain: 'content goals', status: 'RECOVERED_CANONICAL', summary: '5 volumes · daily programming cadence · page taxonomy', sourceField: 'content.contentPillars' },
    { domain: 'channel priorities', status: 'RECOVERED_NEEDS_CONFIRMATION', summary: 'Instagram-first pilot; full platform list in registry', sourceField: 'channels' },
    { domain: 'Instagram role', status: 'RECOVERED_CANONICAL', summary: 'First publishing destination for Page 001 controlled pilot', sourceField: 'marketing.instagramRole' },
    { domain: 'content pillars', status: 'RECOVERED_CANONICAL', summary: 'money, body, mind, tech, consumer volumes', sourceField: 'content.contentPillars' },
    { domain: 'CTA strategy', status: 'RECOVERED_NEEDS_CONFIRMATION', summary: 'READ PAGE · SUBSCRIBE (distribution defaults)', sourceField: 'marketing.ctaStrategy' },
    { domain: 'launch state', status: 'RECOVERED_CANONICAL', summary: 'Pre-launch pilot — Page 001 pipeline ready, not mass-published', sourceField: 'marketing.launchState' },
    { domain: 'current offers', status: 'NOT_FOUND', summary: 'No locked product/offer catalog in fsbw canon' },
    { domain: 'measurement goals', status: 'RECOVERED_NEEDS_CONFIRMATION', summary: 'Returning readers north star (demo seed)', sourceField: 'strategy.northStarMetric' },
    { domain: 'publishing cadence', status: 'RECOVERED_CANONICAL', summary: 'Money Monday … Future Friday weekly programming', sourceField: 'marketing.publishingCadence' },
    { domain: 'automation preference', status: 'NOT_APPLICABLE', summary: 'Not documented in recovered fsbw sources' },
  ];
}

function buildFounderQuestions(): FounderQuestion[] {
  return [
    {
      id: 'fq-audience',
      question: 'Is “curious adults 25–45 seeking practical knowledge” still the canonical NDXbook target audience for EVOLVE?',
      reason: 'approval',
      relatedDomains: ['target audience'],
    },
    {
      id: 'fq-objective',
      question: 'What is the current primary marketing objective for the EVOLVE pilot — reader habit, launch awareness, or something else?',
      reason: 'time_sensitive',
      relatedDomains: ['primary marketing objective', 'secondary objectives'],
    },
    {
      id: 'fq-monetization',
      question: 'Which monetization paths are in scope now: sponsorship, affiliate, premium volumes, or none during pilot?',
      reason: 'gap',
      relatedDomains: ['current offers', 'business model'],
    },
    {
      id: 'fq-visual',
      question: 'Has NDXbook visual DNA moved beyond placeholder status — is the indigo/slate editorial direction approved?',
      reason: 'approval',
      relatedDomains: ['visual identity'],
    },
    {
      id: 'fq-instagram',
      question: 'Is the connected Meta/Instagram “Ndxbook” account in production Supabase the canonical EVOLVE publishing account?',
      reason: 'approval',
      relatedDomains: ['Instagram role', 'channel priorities'],
    },
    {
      id: 'fq-name-style',
      question: 'Confirm public name styling: lowercase “ndxbook” vs “NDXbook” vs “NDXBOOK” for external copy.',
      reason: 'conflict',
      relatedDomains: ['organization identity'],
    },
    {
      id: 'fq-demo-history',
      question: 'Should any Mission Control demo pages (019–042) be treated as archived concepts, or discarded entirely for EVOLVE?',
      reason: 'conflict',
      relatedDomains: ['content goals', 'launch state'],
    },
    {
      id: 'fq-page001',
      question: 'Is Page 001 (credit score / debt payoff) approved as the first live post concept, or should EVOLVE start fresh?',
      reason: 'approval',
      relatedDomains: ['content pillars', 'Instagram role'],
    },
  ];
}
