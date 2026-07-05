import { INHERITANCE_CATEGORIES, INHERITANCE_SOURCE_LABELS } from './constants';
import { bootstrapOrganizationalInheritanceStore } from './store';
import type { InheritanceCategoryAction, OrganizationalInheritanceStore } from './types';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function defaultCategoryConfigs() {
  const actions: InheritanceCategoryAction[] = ['inherit', 'inherit', 'skip', 'inherit', 'inherit', 'inherit', 'inherit', 'combine', 'inherit', 'inherit', 'inherit', 'inherit', 'inherit'];
  const sources = ['vxd', 'frontal-slayer', 'ndxbook', 'frontal-slayer', 'ndxbook', 'ndxbook', 'ai-media', 'frontal-slayer', 'ndxbook', 'ai-media', 'ndxbook', 'frontal-slayer', 'vxd'] as const;

  return INHERITANCE_CATEGORIES.map((c, i) => ({
    id: c.id,
    label: c.label,
    genetics: c.genetics,
    action: actions[i] ?? 'inherit',
    sourceId: sources[i] ?? 'ndxbook',
    notes: i === 2 ? 'Build operations fresh for this company type' : '',
  }));
}

export function buildOrganizationalInheritanceSeed(): Partial<OrganizationalInheritanceStore> {
  const categoryConfigs = defaultCategoryConfigs();

  return {
    dashboard: {
      summary:
        'ORGANIZATIONAL INHERITANCE V1.0 — every new company launches with decades of accumulated organizational learning. Inheritance provides genetics; execution and experimentation create unique identity.',
      libraryItemCount: 0,
      activeBlends: 0,
      companiesWithInheritance: 0,
      reusableAssets: 0,
      avgConfidencePct: 0,
      evolutionEvents: 0,
    },
    sources: [
      {
        id: 'frontal-slayer',
        label: INHERITANCE_SOURCE_LABELS['frontal-slayer'],
        description: 'Luxury wig brand · creative DNA · brand systems · executive structures',
        companyType: 'Commerce · Luxury · Creative-led',
        availableGenetics: ['company-dna', 'creative-dna', 'writing-dna', 'executive-structures', 'quality-standards', 'department-playbooks'],
        maturityPct: 91,
      },
      {
        id: 'ndxbook',
        label: INHERITANCE_SOURCE_LABELS.ndxbook,
        description: 'Public media brand · newsroom · operational DNA · content production',
        companyType: 'Media · Content · Production-heavy',
        availableGenetics: ['operational-dna', 'writing-dna', 'department-playbooks', 'automation-systems', 'memory-bible', 'knowledge-graph'],
        maturityPct: 88,
      },
      {
        id: 'vxd',
        label: INHERITANCE_SOURCE_LABELS.vxd,
        description: 'Vision presentation · leadership DNA · cinematic operating systems',
        companyType: 'Presentation · Vision · Leadership-led',
        availableGenetics: ['leadership-dna', 'studio-intelligence-models', 'simulation-history', 'executive-structures'],
        maturityPct: 76,
      },
      {
        id: 'ai-media',
        label: INHERITANCE_SOURCE_LABELS['ai-media'],
        description: 'Reference pilot · full platform stack · mission control · executive org',
        companyType: 'Platform pilot · Full stack',
        availableGenetics: ['executive-structures', 'automation-systems', 'knowledge-graph', 'studio-intelligence-models', 'talent-structures'],
        maturityPct: 94,
      },
    ],
    categoryConfigs,
    blendPlans: [
      {
        id: 'blend-demo-1',
        label: 'MULTI-SOURCE ORGANIZATIONAL BLEND',
        items: [
          { geneticId: 'leadership-dna', sourceId: 'vxd', sourceLabel: 'VXD', blendWeightPct: 100 },
          { geneticId: 'creative-dna', sourceId: 'frontal-slayer', sourceLabel: 'FRONTAL SLAYER', blendWeightPct: 100 },
          { geneticId: 'operational-dna', sourceId: 'ndxbook', sourceLabel: 'NDXBOOK', blendWeightPct: 100 },
          { geneticId: 'department-playbooks', sourceId: 'ndxbook', sourceLabel: 'MARKETING DEPT', blendWeightPct: 85 },
          { geneticId: 'department-playbooks', sourceId: 'frontal-slayer', sourceLabel: 'CREATIVE DEPT', blendWeightPct: 15 },
        ],
        conflicts: [
          {
            id: 'conf-1',
            geneticId: 'approval-workflows',
            sources: ['FRONTAL SLAYER', 'NDXBOOK'],
            severity: 'medium',
            resolution: 'Merge: Founder review above $2K (FS) + CoS soft approval (NDXBOOK) — Leadership DNA resolves threshold',
          },
          {
            id: 'conf-2',
            geneticId: 'writing-dna',
            sources: ['FRONTAL SLAYER', 'NDXBOOK'],
            severity: 'low',
            resolution: 'Keep Writing Bible as primary · allow Money Monday tone override per Leadership DNA',
          },
        ],
        mergeStrategy: 'Studio Intelligence weighted merge · Leadership DNA as conflict arbiter · all blends remain editable post-launch',
      },
    ],
    simulator: {
      organizationalCompatibilityPct: 87,
      workflowConflicts: ['Approval threshold mismatch · Creative vs Operations queue priority'],
      departmentOverlap: ['Marketing + Content editorial overlap · Creative thumbnail routing dual ownership'],
      approvalConflicts: ['$2K founder threshold (FS) vs CoS soft approval (NDXBOOK) on tool renewals'],
      leadershipConsistencyPct: 92,
      brandCompatibilityPct: 78,
      riskLevel: 'medium',
      confidencePct: 87,
      recommendedAdjustments: [
        'Set unified approval band in Leadership DNA before activation',
        'Assign Creative thumbnail queue to single department owner',
        'Run 7-day pilot with inherited playbooks before full executive activation',
      ],
      readyToActivate: true,
    },
    library: [
      { id: 'lib-1', title: 'FRONTAL SLAYER COMPANY TEMPLATE', type: 'company-template', sourceId: 'frontal-slayer', version: '2.4.0', description: 'Full luxury commerce operating template', tags: ['commerce', 'luxury', 'creative'], searchable: true },
      { id: 'lib-2', title: 'NDXBOOK NEWSROOM PLAYBOOK', type: 'department-playbook', sourceId: 'ndxbook', version: '1.0.0', description: '17-stage production pipeline · page workspace atomic unit', tags: ['newsroom', 'production', 'operational'], searchable: true },
      { id: 'lib-3', title: 'CHIEF OF STAFF EXECUTIVE PLAYBOOK', type: 'executive-playbook', sourceId: 'ai-media', version: '1.0.0', description: 'Soft approvals · attention protection · unified briefings', tags: ['executive', 'chief-of-staff'], searchable: true },
      { id: 'lib-4', title: 'LUXURY CREATIVE SYSTEM', type: 'creative-system', sourceId: 'frontal-slayer', version: '3.1.0', description: 'Creative DNA · Photography Bible · stat overlay standards', tags: ['creative', 'luxury', 'visual'], searchable: true },
      { id: 'lib-5', title: 'MONEY MONDAY MARKETING SYSTEM', type: 'marketing-system', sourceId: 'ndxbook', version: '2.0.0', description: 'Campaign sequencing · Money tone · cross-platform packaging', tags: ['marketing', 'campaigns'], searchable: true },
      { id: 'lib-6', title: 'CAPTION ROUTING AUTOMATION', type: 'automation-system', sourceId: 'ndxbook', version: '1.2.0', description: 'Overnight voice batch · publish optimization rules', tags: ['automation', 'operations'], searchable: true },
      { id: 'lib-7', title: 'INSTITUTIONAL KNOWLEDGE PACKAGE', type: 'knowledge-system', sourceId: 'ndxbook', version: '1.0.0', description: 'Memory Bible · Knowledge Graph · institutional lessons', tags: ['knowledge', 'memory'], searchable: true },
      { id: 'lib-8', title: 'EXECUTIVE ORGANIZATION GENETICS', type: 'organizational-genetics', sourceId: 'ai-media', version: '1.0.0', description: 'Living leadership team · departments · workers · culture', tags: ['executive', 'organization'], searchable: true },
    ],
    departmentPackages: [
      {
        id: 'dept-inh-creative',
        departmentName: 'CREATIVE',
        sourceId: 'frontal-slayer',
        knowledge: ['Stat overlay playbook', 'Labs #38 default template', 'Minimal text thumbnail standard'],
        playbooks: ['Creative DNA adherence checklist', 'Every thumbnail = experiment opportunity'],
        qualityStandards: ['Photography Bible compliance', 'Brand hierarchy on all assets'],
        approvalWorkflows: ['Creative Director → CoS soft approval → Founder on exceptions'],
        bestPractices: ['Labs data before template rollout', 'Leadership DNA alignment on taste calls'],
        adaptToIdentity: 'Retain luxury visual standards · adapt accent colors and product categories to new brand',
      },
      {
        id: 'dept-inh-marketing',
        departmentName: 'MARKETING',
        sourceId: 'ndxbook',
        knowledge: ['Money Monday playbook v2', 'Campaign template sequencing'],
        playbooks: ['No launch without Creative DNA sign-off', 'Campaign brief → ROI projection'],
        qualityStandards: ['Writing Bible tone on all copy', 'FTC disclosure on affiliate content'],
        approvalWorkflows: ['CMO → CoS soft approval → CFO on budget > $500'],
        bestPractices: ['Cross-platform packaging before single-channel publish'],
        adaptToIdentity: 'Adapt campaign cadence to new company content volume · keep approval discipline',
      },
      {
        id: 'dept-inh-operations',
        departmentName: 'OPERATIONS',
        sourceId: 'ndxbook',
        knowledge: ['Scheduling autonomy pattern', 'Caption routing automation catalog'],
        playbooks: ['Reversible decisions move fast · fallback always exists'],
        qualityStandards: ['94% on-time publish target', 'Zero scheduling escalations'],
        approvalWorkflows: ['COO autonomous · CoS notification on conflicts'],
        bestPractices: ['Batch voice saves 4h/week · overnight automation runs'],
        adaptToIdentity: 'Scale automation rules to new publish volume · retain autonomy thresholds',
      },
    ],
    executivePackages: [
      {
        id: 'exec-inh-cos',
        executiveRole: 'CHIEF OF STAFF',
        sourceId: 'ai-media',
        leadershipExperience: ['12 months coordinating executive team', '847 soft approvals processed'],
        organizationalMemory: ['Founder attention protection patterns', 'Delegation maturity thresholds'],
        decisionFrameworks: ['Leadership DNA primary · reversible vs irreversible classification'],
        departmentHistory: ['Built from Mission Control + Executive Organization v1.0'],
        bestPractices: ['Never escalate what CoS can resolve', 'Daily briefing prep by 7 AM'],
        historicalPerformancePct: 94,
        cosRecommended: true,
      },
      {
        id: 'exec-inh-cco',
        executiveRole: 'CHIEF CREATIVE OFFICER',
        sourceId: 'frontal-slayer',
        leadershipExperience: ['Luxury creative systems · 3 Labs winners deployed'],
        organizationalMemory: ['Thumbnail queue aging pattern · stat overlay default'],
        decisionFrameworks: ['Creative DNA first · Leadership DNA on taste exceptions'],
        departmentHistory: ['9 creative teams · art direction through copy support'],
        bestPractices: ['Coach before escalate on queue bottlenecks'],
        historicalPerformancePct: 88,
        cosRecommended: true,
      },
    ],
    ancestry: [
      { id: 'anc-1', systemLabel: 'LEADERSHIP DNA', geneticId: 'leadership-dna', originSourceId: 'vxd', originLabel: 'VXD', originDetail: 'Founder operating blueprint · decision framework', inheritedAt: daysFromNow(-30), editable: true },
      { id: 'anc-2', systemLabel: 'CREATIVE DNA', geneticId: 'creative-dna', originSourceId: 'frontal-slayer', originLabel: 'FRONTAL SLAYER', originDetail: 'Luxury visual systems · Photography Bible', inheritedAt: daysFromNow(-30), editable: true },
      { id: 'anc-3', systemLabel: 'OPERATIONAL DNA', geneticId: 'operational-dna', originSourceId: 'ndxbook', originLabel: 'NDXBOOK', originDetail: 'Newsroom 17-stage pipeline · page workspace', inheritedAt: daysFromNow(-28), editable: true },
      { id: 'anc-4', systemLabel: 'MARKETING PLAYBOOK', geneticId: 'department-playbooks', originSourceId: 'ndxbook', originLabel: 'MARKETING DEPARTMENT', originDetail: 'Money Monday campaign template v2', inheritedAt: daysFromNow(-28), editable: true },
      { id: 'anc-5', systemLabel: 'EXECUTIVE STRUCTURES', geneticId: 'executive-structures', originSourceId: 'ai-media', originLabel: 'AI MEDIA PILOT', originDetail: 'Executive Organization v1.0 · 11 executives', inheritedAt: daysFromNow(-14), editable: true },
    ],
    timeline: [
      { id: 'tl-1', at: daysFromNow(-30), type: 'inheritance', title: 'INITIAL INHERITANCE ACTIVATED', detail: 'Leadership DNA (VXD) + Creative DNA (Frontal Slayer) + Operational DNA (NDXBOOK)', companyId: 'demo-new-co' },
      { id: 'tl-2', at: daysFromNow(-21), type: 'evolution', title: 'APPROVAL BAND UNIFIED', detail: 'Leadership DNA merged $2K threshold with CoS soft approval — new company-specific rule', companyId: 'demo-new-co' },
      { id: 'tl-3', at: daysFromNow(-14), type: 'divergence', title: 'CREATIVE IDENTITY DIVERGENCE', detail: 'New accent palette · retained luxury standards · unique thumbnail template v3', companyId: 'demo-new-co' },
      { id: 'tl-4', at: daysFromNow(-7), type: 'knowledge-growth', title: 'INSTITUTIONAL LESSON CAPTURED', detail: 'Improved onboarding workflow — offered as reusable asset to other companies', companyId: 'demo-new-co' },
      { id: 'tl-5', at: daysFromNow(-3), type: 'executive-maturity', title: 'CCO AUTONOMY EARNED', detail: 'Zero founder overrides 30 days · delegation pattern logged in organizational memory', companyId: 'demo-new-co' },
    ],
    recommendations: [
      {
        id: 'rec-1',
        targetCompanyType: 'Content-driven media company',
        recommendation: 'This company resembles NDXBOOK — inherit newsroom workflows and operational DNA',
        genetics: ['operational-dna', 'department-playbooks', 'writing-dna'],
        sourceId: 'ndxbook',
        confidencePct: 94,
        rationale: 'Production-heavy · page workspace atomic unit · editorial calendar cadence match',
      },
      {
        id: 'rec-2',
        targetCompanyType: 'Luxury commerce brand',
        recommendation: 'This company resembles Frontal Slayer — inherit luxury creative DNA and brand systems',
        genetics: ['creative-dna', 'company-dna', 'quality-standards'],
        sourceId: 'frontal-slayer',
        confidencePct: 91,
        rationale: 'Visual-first · premium positioning · Photography Bible dependency',
      },
      {
        id: 'rec-3',
        targetCompanyType: 'Presentation / vision company',
        recommendation: 'Recommend Leadership DNA and Vision Engine genetics from VXD',
        genetics: ['leadership-dna', 'studio-intelligence-models', 'simulation-history'],
        sourceId: 'vxd',
        confidencePct: 82,
        rationale: 'Founder-led · cinematic presentation · decision simulation history valuable',
      },
    ],
    evolution: [
      { id: 'evo-1', companyId: 'demo-new-co', at: daysFromNow(-21), type: 'decision', title: 'Unified approval band', detail: 'Merged FS $2K + NDXBOOK CoS soft approval into company-specific Leadership DNA rule', inheritedFrom: 'frontal-slayer' },
      { id: 'evo-2', companyId: 'demo-new-co', at: daysFromNow(-14), type: 'workflow', title: 'Thumbnail routing v3', detail: 'New default template routing — diverged from inherited Labs #38 with company-specific variant', inheritedFrom: 'frontal-slayer' },
      { id: 'evo-3', companyId: 'demo-new-co', at: daysFromNow(-7), type: 'lesson', title: 'Onboarding workflow improvement', detail: 'Reduced executive activation time 40% — offered as reusable inheritance asset', inheritedFrom: null },
      { id: 'evo-4', companyId: 'demo-new-co', at: daysFromNow(-3), type: 'institutional-knowledge', title: 'CCO autonomy pattern', detail: 'Documented delegation maturity criteria — feeds organizational memory', inheritedFrom: 'ai-media' },
    ],
    crossCompanyLearning: [
      { id: 'ccl-1', sourceCompanyId: 'ndxbook', title: 'Improved approval workflow', improvement: 'CoS soft approval + Leadership DNA threshold merge pattern', visibility: 'reusable', availableToOthers: true },
      { id: 'ccl-2', sourceCompanyId: 'frontal-slayer', title: 'Better onboarding sequence', improvement: 'Executive activation checklist — 40% faster time-to-autonomy', visibility: 'reusable', availableToOthers: true },
      { id: 'ccl-3', sourceCompanyId: 'ndxbook', title: 'Caption routing automation v2', improvement: 'Overnight batch + conflict resolution rules', visibility: 'private', availableToOthers: false },
    ],
    marketplacePrepared: [
      { id: 'mp-1', assetType: 'Organizational systems', description: 'Share · license · sell complete operating system packages', status: 'architecture-only', futureActions: ['share', 'license', 'sell', 'purchase'] },
      { id: 'mp-2', assetType: 'Department playbooks', description: 'Department-level inheritance packages as marketplace assets', status: 'architecture-only', futureActions: ['share', 'license', 'sell', 'purchase'] },
      { id: 'mp-3', assetType: 'Executive playbooks', description: 'Executive inheritance packages with performance history', status: 'architecture-only', futureActions: ['share', 'license', 'sell'] },
      { id: 'mp-4', assetType: 'Inheritance packages', description: 'Pre-built multi-source genetic blends as purchasable bundles', status: 'architecture-only', futureActions: ['purchase', 'license'] },
    ],
    wizardDraft: {
      targetCompanyName: 'DEMO NEW COMPANY',
      primarySourceId: 'multi',
      secondarySourceIds: ['frontal-slayer', 'ndxbook', 'vxd'],
      categoryConfigs,
      blendPlanId: 'blend-demo-1',
      simulatorPassed: true,
    },
    selectedLibraryItemId: 'lib-2',
    selectedBlendPlanId: 'blend-demo-1',
  };
}

export function bootstrapOrganizationalInheritancePlatform(): void {
  bootstrapOrganizationalInheritanceStore(buildOrganizationalInheritanceSeed());
}
