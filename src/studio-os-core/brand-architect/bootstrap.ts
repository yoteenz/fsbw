import { bootstrapBrandArchitectStore } from './store';
import type { BrandArchitectStore, VisualIdentityElement } from './types';

export function buildBrandArchitectSeed(): Partial<BrandArchitectStore> {
  const visualIdentity: VisualIdentityElement[] = [
    { id: 'vis-1', category: 'Logo', label: 'LOGO DIRECTIONS', direction: 'Wordmark-first · stat-forward authority · minimal ornament · Futura + Grace pairing', status: 'approved' },
    { id: 'vis-2', category: 'Color', label: 'COLOR SYSTEM', direction: 'Authority slate #0F172A · signal red #EB1C24 · clarity white · stat accent sky #0369A1', status: 'approved' },
    { id: 'vis-3', category: 'Typography', label: 'TYPOGRAPHY', direction: 'Futura PT Medium (headers) · Futura PT Book (body) · Covered By Your Grace (handwritten metrics)', status: 'approved' },
    { id: 'vis-4', category: 'Iconography', label: 'ICONOGRAPHY', direction: 'Minimal line icons · stat overlays · no decorative clutter', status: 'approved' },
    { id: 'vis-5', category: 'Photography', label: 'PHOTOGRAPHY DIRECTION', direction: 'Stat-forward overlays · clean backgrounds · authority not lifestyle · Photography Bible linked', status: 'approved' },
    { id: 'vis-6', category: 'Illustration', label: 'ILLUSTRATION', direction: 'Data visualization · chart-forward · no cartoon mascots', status: 'defined' },
    { id: 'vis-7', category: 'Motion', label: 'MOTION LANGUAGE', direction: 'Subtle fade · stat count-up · no bounce or playful easing', status: 'defined' },
    { id: 'vis-8', category: 'Layout', label: 'LAYOUT PRINCIPLES', direction: 'Grid-first · stat cards · executive whitespace · mobile-first hierarchy', status: 'approved' },
    { id: 'vis-9', category: 'Spacing', label: 'SPACING', direction: '8px base · generous panel padding · calm density', status: 'approved' },
    { id: 'vis-10', category: 'Hierarchy', label: 'VISUAL HIERARCHY', direction: 'Handwritten metric → section title → label · stat always wins', status: 'approved' },
    { id: 'vis-11', category: 'Patterns', label: 'BRAND PATTERNS', direction: 'Panel borders · live dots · stat cards · no gradients', status: 'approved' },
    { id: 'vis-12', category: 'Textures', label: 'BRAND TEXTURES', direction: 'Flat · glass panel blur · no skeuomorphism', status: 'defined' },
  ];

  return {
    companyName: 'NDXBOOK',
    dashboard: {
      summary:
        'BRAND ARCHITECT V1.0 — transform validated business into complete living brand · meaning before colors · cohesive systems · experience architect handoff ready.',
      brandHealthPct: 0,
      blueprintCompletenessPct: 0,
      verbalIdentityPct: 0,
      visualIdentityPct: 0,
      systemsPct: 0,
      approvalStatus: 'in-review',
    },
    activeWorkspaceId: 'ndxbook',
    blueprint: {
      purpose: 'Help people build authority through consistency — not hype.',
      promise: 'Every page teaches · every stat earns trust · every reader becomes smarter.',
      positioning: 'The authority media platform for people who want financial clarity without noise.',
      mission: 'Deliver stat-forward knowledge that compounds reader trust over years.',
      vision: '100,000 returning readers who treat ndxbook as their financial operating system.',
      values: ['AUTHORITY', 'CONSISTENCY', 'CLARITY', 'COMPOUNDING', 'RESPECT FOR TIME'],
      personality: ['CONFIDENT', 'PRECISE', 'CALM', 'CONSULTATIVE', 'UNFORGETTABLE THROUGH REPETITION'],
      archetype: 'SAGE + RULER — wisdom delivered with executive authority',
      voice: 'Direct · stat-forward · no fluff · founder-grade clarity',
      tone: 'Calm confidence · never alarmist · never salesy · always earned',
      communicationPrinciples: [
        'Lead with the stat · earn the story',
        'One idea per page · compound over time',
        'Writing Bible governs all copy',
        'Creative DNA governs all visuals',
      ],
      brandPhilosophy: 'Authority is built through consistency — not virality. Every touchpoint reinforces trust.',
      competitivePositioning: 'Not finance bros · not lifestyle influencers · institutional-grade clarity for real people.',
      emotionalPositioning: 'Readers feel smarter · calmer · more in control — never overwhelmed.',
    },
    verbalIdentity: {
      companyName: 'NDXBOOK',
      taglineOptions: [
        'AUTHORITY THROUGH CONSISTENCY',
        'YOUR FINANCIAL OPERATING SYSTEM',
        'STAT-FORWARD · TRUST-COMPOUNDING',
      ],
      selectedTagline: 'AUTHORITY THROUGH CONSISTENCY',
      messagingPillars: [
        'STAT-FORWARD AUTHORITY — every claim earns its number',
        'COMPOUNDING TRUST — readers return because we respect their time',
        'CONSISTENCY OVER HYPE — the brand is the cadence',
      ],
      elevatorPitch:
        'ndxbook is the authority media platform for people who want financial clarity without noise — stat-forward pages that compound trust over years, not viral moments.',
      brandStory:
        'Born from the belief that financial media failed readers with hype. ndxbook replaces noise with numbers — one page at a time.',
      originStory:
        'Founder saw readers drowning in conflicting advice. Built a system where every page follows the same Writing Bible — authority through repetition.',
      manifesto:
        'We do not chase trends. We compound trust. Every stat earns its place. Every reader deserves clarity. Consistency is the brand.',
      brandVocabulary: ['AUTHORITY', 'STAT-FORWARD', 'COMPOUNDING', 'CLARITY', 'CONSISTENCY', 'RETURNING READER'],
      communicationRules: [
        'No exclamation marks in headlines',
        'Numbers before adjectives',
        'Writing Bible approval required',
        'CTA systems: OPEN · READ · BUILD · JOIN — never BUY NOW',
      ],
      writingStyle: 'Futura headers · stat overlays · short paragraphs · executive density',
      headlineSystems: ['PAGE ### · TOPIC', 'STAT: NUMBER + CONTEXT', 'MONEY MONDAY · TRUTH TUESDAY cadence'],
      ctaSystems: ['OPEN · READ · BUILD · JOIN · EXPLORE STUDIO OS'],
    },
    visualIdentity,
    brandSystems: [
      { id: 'sys-1', system: 'IDENTITY GUIDELINES', description: 'Logo · color · typography · voice · usage rules', status: 'approved' },
      { id: 'sys-2', system: 'DESIGN SYSTEM', description: 'Panel components · stat cards · tab patterns · Studio OS shell', status: 'active' },
      { id: 'sys-3', system: 'BRAND STANDARDS', description: 'Writing Bible + Creative DNA enforcement · CoS soft approval', status: 'active' },
      { id: 'sys-4', system: 'SOCIAL IDENTITY', description: 'Stat cards · page previews · consistent thumbnail system', status: 'active' },
      { id: 'sys-5', system: 'ADVERTISING LANGUAGE', description: 'Authority-first · no urgency tactics · stat-led hooks', status: 'draft' },
      { id: 'sys-6', system: 'PRESENTATION SYSTEM', description: 'Executive deck templates · Futura + Grace · dark headers', status: 'draft' },
      { id: 'sys-7', system: 'EMAIL IDENTITY', description: 'Newsletter templates · Money Monday · Truth Tuesday', status: 'active' },
      { id: 'sys-8', system: 'PRODUCT IDENTITY', description: 'Build-a-Wig commerce · membership tiers · lounge TV', status: 'active' },
      { id: 'sys-9', system: 'FUTURE EXPANSION', description: 'Frontal Slayer inheritance · cross-brand DNA blending rules', status: 'draft' },
    ],
    competitiveIntel: [
      { id: 'comp-1', competitor: 'FINANCE INFLUENCERS', positioning: 'Personality-first · hype-driven', visualDifferentiation: 'Lifestyle · neon · face-forward', saturation: 'high', whitespace: 'Stat-forward authority · calm executive tone' },
      { id: 'comp-2', competitor: 'TRADITIONAL FINANCE MEDIA', positioning: 'Institutional · dense · inaccessible', visualDifferentiation: 'Corporate · stock photos · paywalls', saturation: 'medium', whitespace: 'Mobile-first · readable · free authority pages' },
      { id: 'comp-3', competitor: 'NEWSLETTER AGGREGATORS', positioning: 'Curated links · no original authority', visualDifferentiation: 'Minimal · text-only', saturation: 'high', whitespace: 'Original stat-forward pages · compounding IP' },
    ],
    competitiveOpportunities: [
      'Own "stat-forward authority" — no competitor combines calm executive design + daily cadence',
      'Visual whitespace: handwritten metrics + Futura — distinctive at scroll speed',
      'Emotional positioning: control and clarity — not fear or FOMO',
    ],
    brandSimulations: [
      {
        id: 'sim-1',
        label: 'CURRENT IDENTITY · BASELINE',
        recognitionPct: 78,
        memorabilityPct: 82,
        luxuryPerceptionPct: 71,
        trustPct: 86,
        clarityPct: 91,
        differentiationPct: 79,
        emotionalResponse: 'Calm · informed · in control',
        confidencePct: 88,
        recommendations: ['Maintain stat-forward consistency · expand presentation system'],
      },
      {
        id: 'sim-2',
        label: 'VARIANT · WARMER TONE',
        recognitionPct: 72,
        memorabilityPct: 75,
        luxuryPerceptionPct: 65,
        trustPct: 80,
        clarityPct: 84,
        differentiationPct: 68,
        emotionalResponse: 'Friendly · less authoritative',
        confidencePct: 74,
        recommendations: ['Reject — dilutes authority positioning · trust drops 6%'],
      },
      {
        id: 'sim-3',
        label: 'VARIANT · BOLDER RED ACCENT',
        recognitionPct: 81,
        memorabilityPct: 85,
        luxuryPerceptionPct: 68,
        trustPct: 82,
        clarityPct: 88,
        differentiationPct: 83,
        emotionalResponse: 'Attention-grabbing · slightly aggressive',
        confidencePct: 79,
        recommendations: ['Selective use for CTAs only · not primary identity shift'],
      },
    ],
    brandHealth: {
      overallPct: 86,
      coherencePct: 91,
      consistencyPct: 88,
      differentiationPct: 79,
      emotionalResonancePct: 84,
      systemCompletenessPct: 78,
      strengths: [
        'Blueprint complete · verbal + visual aligned',
        'Writing Bible + Creative DNA enforcement active',
        'Stat-forward identity distinctive in market',
      ],
      weaknesses: [
        'Presentation system incomplete',
        'Cross-brand (FS) expansion guidelines draft only',
        'Advertising language system needs formalization',
      ],
    },
    brandEvolution: [
      { id: 'evo-1', date: '2024-01', label: 'NDXBOOK FOUNDED · AUTHORITY VISION', type: 'founding' },
      { id: 'evo-2', date: '2024-06', label: 'WRITING BIBLE · CREATIVE DNA ESTABLISHED', type: 'refinement' },
      { id: 'evo-3', date: '2025-03', label: 'STUDIO OS DESIGN SYSTEM · PANEL LANGUAGE', type: 'launch' },
      { id: 'evo-4', date: '2026-01', label: 'PHOTOGRAPHY BIBLE · VISUAL CONSISTENCY', type: 'refinement' },
      { id: 'evo-5', date: '2026-07', label: 'BRAND ARCHITECT V1.0 · FORMALIZED SYSTEM', type: 'launch' },
      { id: 'evo-6', date: '2026-Q4', label: 'EXPERIENCE ARCHITECT HANDOFF · UNIFIED CX', type: 'future' },
    ],
    futureOpportunities: [
      'Complete presentation system for B2B authority partnerships',
      'Frontal Slayer DNA blend — inherit ndxbook brand standards with commerce accent',
      'Experience Architect handoff — every touchpoint inherits approved identity automatically',
    ],
    experienceHandoff: {
      status: 'ready',
      transferredAt: null,
      inheritedSystems: ['Identity guidelines', 'Design system', 'Brand standards', 'Email identity', 'Product identity'],
      downstreamTargets: ['Experience Architect', 'Digital optimization', 'Customer journey mapping', 'Asset Factory'],
    },
  };
}

export function bootstrapBrandArchitectPlatform(): void {
  bootstrapBrandArchitectStore(buildBrandArchitectSeed());
}
