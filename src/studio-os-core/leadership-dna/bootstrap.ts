/**
 * Leadership DNA V1.0 bootstrap — founder operating blueprint seed (Milestone 39).
 */

import { ENDURING_LEADERSHIP_PRINCIPLES } from './constants';
import { bootstrapLeadershipDnaStore, refreshLeadershipDnaDashboard } from './store';
import type { LeadershipDnaStore, LeadershipProfileSection } from './types';

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function profileSection(
  id: LeadershipProfileSection['id'],
  title: string,
  principles: string[],
  evolutionNotes: string[],
  confidencePct: number
): LeadershipProfileSection {
  return {
    id,
    title,
    principles,
    evolutionNotes,
    lastUpdatedAt: daysAgo(Math.floor(Math.random() * 14)),
    confidencePct,
  };
}

export function buildLeadershipDnaSeed(): Partial<LeadershipDnaStore> {
  const founderProfile: LeadershipProfileSection[] = [
    profileSection(
      'leadership-philosophy',
      'LEADERSHIP PHILOSOPHY',
      [
        'Lead organizations, not individual tasks',
        'Build systems before scaling headcount',
        'Institutional knowledge over tribal knowledge',
        'Protect founder attention as a strategic resource',
        'Automation should increase judgment, not replace it',
      ],
      ['Added automation principle after Milestone 35', 'Clarified systems-first after ndxbook scale'],
      91
    ),
    profileSection(
      'decision-framework',
      'DECISION FRAMEWORK',
      [
        'Level 1 · automatic when DNA-aligned and low risk',
        'Level 2 · Chief of Staff when confidence exceeds threshold',
        'Level 3 · founder for strategy, legal, high-value spend',
        'Always cite evidence · Labs data · historical approvals',
        'Reversibility matters — reversible decisions move faster',
      ],
      ['CoS threshold calibrated to 82% after Milestone 38'],
      88
    ),
    profileSection(
      'communication-style',
      'COMMUNICATION STYLE',
      [
        'One unified morning briefing · not dozens of pings',
        'Escalate with confidence score + evidence bundle',
        'Direct · no hype · scannable structure',
        'Respect 4-minute founder review budget',
        'Proactive coaching before work reaches founder',
      ],
      ['Consolidated briefings via Chief of Staff V1.0'],
      86
    ),
    profileSection(
      'creative-philosophy',
      'CREATIVE PHILOSOPHY',
      [
        'Bold stat overlays on money volume content',
        'Minimal text on thumbnails · luxury spacing',
        'Editorial hierarchy · page number badges on ndxbook',
        'Brand consistency over novelty for core formats',
        'Every page is a Labs experiment opportunity',
      ],
      ['Stat overlay preference reinforced 3x in June 2026'],
      84
    ),
    profileSection(
      'management-philosophy',
      'MANAGEMENT PHILOSOPHY',
      [
        'Executives report to Chief of Staff first',
        'Departments earn autonomy through consistency',
        'Quality bar never lowered to remove friction',
        'Coaching over criticism · patterns over isolated mistakes',
        'Cross-company patterns become institutional knowledge',
      ],
      ['Operations promoted to fully-autonomous scheduling'],
      82
    ),
    profileSection(
      'risk-profile',
      'RISK PROFILE',
      [
        'Conservative on legal · affiliate · brand positioning',
        'Moderate on creative experimentation via Labs',
        'Aggressive on automation that protects attention',
        'Financial conservatism under $3K with ROI deck',
        'Fast decisions when reversible and DNA-aligned',
      ],
      ['Legal always founder-reviewed after FTC guidance update'],
      79
    ),
    profileSection(
      'delegation-profile',
      'DELEGATION PROFILE',
      [
        'Creative reviews · soft-approval via CoS',
        'Copy reviews · auto when Writing Bible compliant',
        'Publishing · operations fully autonomous',
        'Financial · founder review above $2K',
        'Hiring · strategic partnerships · always founder',
      ],
      ['Increased creative delegation +12% after consistency gains'],
      85
    ),
    profileSection(
      'approval-philosophy',
      'APPROVAL PHILOSOPHY',
      [
        'Pattern recognition over isolated choices',
        'Historical approvals train future soft approvals',
        'Preferred layouts · typography · pacing learned continuously',
        'Product quality bar · 72%+ completion target',
        'Reject casual tone in money content · enforce Writing Bible',
      ],
      ['25 overnight auto-approvals validated delegation model'],
      87
    ),
    profileSection(
      'feedback-philosophy',
      'FEEDBACK PHILOSOPHY',
      [
        'Specific revisions · not vague dissatisfaction',
        'Praise consistency · call out pattern adherence',
        'Return for revision before rejection when fixable',
        'Coaching executives on recurring issues proactively',
        'Quality expectations documented in Leadership DNA',
      ],
      ['CCO coached on thumbnail queue aging pattern'],
      83
    ),
    profileSection(
      'growth-philosophy',
      'GROWTH PHILOSOPHY',
      [
        'Quality over volume for flagship brands',
        'Mind volume retention signals → allocate more pages',
        'New companies inherit leadership · develop own company DNA',
        'Studio OS as operating system · not just tools',
        'Institutional lessons transfer across portfolio',
      ],
      ['Mind volume +18% → habits chapter expansion approved'],
      80
    ),
    profileSection(
      'long-term-vision',
      'LONG-TERM VISION',
      [
        'Build media company operating system',
        'ndxbook as flagship public knowledge brand',
        'Every executive asks: would founder confidently approve?',
        'Leadership DNA preserves consistency as orgs grow',
        'Digital representation of how founder leads — not imitation',
      ],
      ['Leadership DNA V1.0 launched as primary CoS training system'],
      92
    ),
  ];

  return {
    cosAlignmentThresholdPct: 82,
    dashboard: {
      summary:
        'Founder operating blueprint active · 11 profile sections · 47 decisions logged · 18 approval patterns · CoS primary training framework',
      principlesCount: ENDURING_LEADERSHIP_PRINCIPLES.length,
      decisionsLogged: 47,
      approvalPatternsIdentified: 18,
      overallConfidencePct: 86,
      delegationGrowthPct: 24,
      executiveTrustPct: 84,
      organizationalMaturityPct: 78,
      chiefOfStaffTrainingStatus: 'PRIMARY FRAMEWORK · ACTIVE',
    },
    founderProfile,
    leadershipPrinciples: [...ENDURING_LEADERSHIP_PRINCIPLES],
    decisionJournal: [
      {
        id: 'dj-1',
        timestamp: daysAgo(2),
        decision: 'Soft-approve page 028 stat overlay thumbnail',
        context: 'Money volume page 028 · CCO submission · Labs #38 winner',
        reasoning: 'Matches 3 prior founder approvals · Creative DNA aligned · low risk',
        alternativesConsidered: ['Text-only thumbnail', 'Photo hero without stat', 'Delay to founder review'],
        expectedOutcome: '+18% CTR vs baseline · publish on schedule',
        actualOutcome: 'Published · first-hour views +22%',
        lessonsLearned: ['Stat overlays on money content = fast approval pattern', 'Labs data accelerates CoS confidence'],
        confidencePct: 88,
        timeHorizon: 'immediate',
        workspaceId: 'ai-media',
        knowledgeGraphNodeIds: ['node-creative-dna', 'node-ndxbook'],
        category: 'creative approval',
      },
      {
        id: 'dj-2',
        timestamp: daysAgo(5),
        decision: 'Reject casual tone in money volume script',
        context: 'Page 024 script · overly casual phrasing in credit chapter',
        reasoning: 'Writing Bible violation · money content requires direct professional tone',
        alternativesConsidered: ['Approve with minor edit', 'Return for full rewrite', 'Escalate to CoS only'],
        expectedOutcome: 'Brand consistency maintained · revision within 24h',
        actualOutcome: 'Script revised · approved next day · no publish delay',
        lessonsLearned: ['Founder rejects casual money copy consistently', 'Enforce Writing Bible before submission'],
        confidencePct: 94,
        timeHorizon: 'short-term',
        workspaceId: 'ai-media',
        knowledgeGraphNodeIds: ['node-memory-bible', 'content-brain'],
        category: 'writing approval',
      },
      {
        id: 'dj-3',
        timestamp: daysAgo(12),
        decision: 'Approve Q2 creator tools renewal under $3K',
        context: 'CFO budget request · analytics + scheduling stack',
        reasoning: 'ROI deck provided · within discretionary band · annual billing preferred',
        alternativesConsidered: ['Negotiate 15% discount', 'Switch vendors', 'Defer to Q3'],
        expectedOutcome: '3.2x ROI on time savings · uninterrupted ops',
        actualOutcome: 'Renewed with 15% discount · ops time -4h/week',
        lessonsLearned: ['Approves ops tools under $3K with ROI', 'Prefers annual billing'],
        confidencePct: 76,
        timeHorizon: 'medium-term',
        workspaceId: 'ai-media',
        knowledgeGraphNodeIds: ['node-business-model-engine'],
        category: 'financial approval',
      },
      {
        id: 'dj-4',
        timestamp: daysAgo(20),
        decision: 'Promote Operations to fully-autonomous scheduling',
        context: 'CoS delegation review · 12 schedule adjustments auto-approved',
        reasoning: 'Consistent DNA alignment · no founder overrides in 30 days',
        alternativesConsidered: ['Maintain soft-approval', 'Partial autonomy weekdays only'],
        expectedOutcome: 'Zero scheduling escalations · faster publish optimization',
        actualOutcome: '8 auto-adjustments this week · 0 escalations',
        lessonsLearned: ['Departments earn autonomy through consistency', 'Scheduling = safe delegation domain'],
        confidencePct: 90,
        timeHorizon: 'long-term',
        workspaceId: 'ai-media',
        knowledgeGraphNodeIds: ['node-studio-intelligence'],
        category: 'delegation',
      },
      {
        id: 'dj-5',
        timestamp: daysAgo(30),
        decision: 'Launch Leadership DNA as CoS primary training framework',
        context: 'Milestone 39 · organizational intelligence layer',
        reasoning: 'CoS needs founder decision framework beyond isolated approvals',
        alternativesConsidered: ['Extend Memory Bible only', 'Defer to Milestone 40'],
        expectedOutcome: 'Executives ask "would founder approve?" before escalation',
        lessonsLearned: ['Leadership consistency scales across portfolio companies'],
        confidencePct: 85,
        timeHorizon: 'long-term',
        workspaceId: 'studio-os',
        knowledgeGraphNodeIds: ['node-memory-bible', 'node-creative-dna'],
        category: 'strategic',
      },
    ],
    approvalPatterns: [
      { id: 'ap-1', domain: 'layout', pattern: 'Bold stat overlays on money volume thumbnails', evidenceCount: 12, confidencePct: 91, examples: ['Page 019', 'Page 024', 'Page 028'] },
      { id: 'ap-2', domain: 'typography', pattern: 'Minimal text · large numerals · Futura hierarchy', evidenceCount: 8, confidencePct: 87, examples: ['Money volume template', 'Mind volume question hooks'] },
      { id: 'ap-3', domain: 'pacing', pattern: '2 PM publish slot for high-priority pages', evidenceCount: 6, confidencePct: 82, examples: ['Page 028 scheduled 2 PM', 'Analytics +22% first hour'] },
      { id: 'ap-4', domain: 'storytelling', pattern: 'Question hooks for mind volume · direct tone for money', evidenceCount: 15, confidencePct: 89, examples: ['Labs #42 hook B', 'Page 014 revision'] },
      { id: 'ap-5', domain: 'ux', pattern: 'Page number badges on all ndxbook pages', evidenceCount: 47, confidencePct: 95, examples: ['ndxbook page template v3'] },
      { id: 'ap-6', domain: 'quality', pattern: '72%+ completion target before publish', evidenceCount: 9, confidencePct: 84, examples: ['Production QA gate', 'Audience Brain signal'] },
      { id: 'ap-7', domain: 'workflow', pattern: 'Labs experiment before major format change', evidenceCount: 11, confidencePct: 88, examples: ['Caption A/B routing', 'Hook testing automation'] },
      { id: 'ap-8', domain: 'automation', pattern: 'Automate when fallback exists · never remove judgment', evidenceCount: 7, confidencePct: 86, examples: ['Caption routing rule', 'Schedule optimization'] },
    ],
    creativeTaste: [
      { id: 'ct-1', dimension: 'layout', preference: 'Stat overlay hero · asymmetric grid', strengthPct: 91, lastObservedAt: hoursAgo(2) },
      { id: 'ct-2', dimension: 'spacing', preference: 'Luxury whitespace · minimal clutter', strengthPct: 88, lastObservedAt: daysAgo(1) },
      { id: 'ct-3', dimension: 'minimalism', preference: 'Less text on thumbnails · more impact', strengthPct: 85, lastObservedAt: daysAgo(3) },
      { id: 'ct-4', dimension: 'color', preference: 'Red accent sparingly · dark navy primary', strengthPct: 82, lastObservedAt: daysAgo(5) },
      { id: 'ct-5', dimension: 'motion', preference: 'Subtle · purposeful · no gratuitous animation', strengthPct: 79, lastObservedAt: daysAgo(7) },
      { id: 'ct-6', dimension: 'typography', preference: 'Futura hierarchy · Covered By Your Grace accents', strengthPct: 90, lastObservedAt: hoursAgo(4) },
      { id: 'ct-7', dimension: 'hierarchy', preference: 'Editorial · page number · chapter badge', strengthPct: 93, lastObservedAt: hoursAgo(1) },
      { id: 'ct-8', dimension: 'brand consistency', preference: 'Template adherence over novelty for core formats', strengthPct: 87, lastObservedAt: daysAgo(2) },
    ],
    writingIntelligence: [
      { id: 'wi-1', dimension: 'sentence length', preference: 'Short · scannable · 8-14 words average', writingDnaLink: 'Writing Bible · brevity rules', strengthPct: 88 },
      { id: 'wi-2', dimension: 'tone', preference: 'Direct · no hype · professional for money content', writingDnaLink: 'Writing DNA · money volume tone', strengthPct: 92 },
      { id: 'wi-3', dimension: 'clarity', preference: 'One idea per sentence · explicit structure', writingDnaLink: 'Writing Bible · clarity module', strengthPct: 85 },
      { id: 'wi-4', dimension: 'structure', preference: 'Question hooks for mind · stat-led for money', writingDnaLink: 'Writing DNA · hook patterns', strengthPct: 89 },
      { id: 'wi-5', dimension: 'vocabulary', preference: 'Plain language · avoid jargon and hype words', writingDnaLink: 'Writing Bible · avoid-list', strengthPct: 86 },
      { id: 'wi-6', dimension: 'feedback', preference: 'Specific phrase-level revisions · not vague', writingDnaLink: 'Leadership DNA · feedback philosophy', strengthPct: 83 },
      { id: 'wi-7', dimension: 'revision habits', preference: 'Return for revision before rejection when fixable', writingDnaLink: 'Chief of Staff · coaching engine', strengthPct: 81 },
    ],
    delegationRecommendations: [
      { id: 'dr-1', domain: 'Creative reviews', currentLevel: 'soft-approval', recommendedLevel: 'soft-approval', rationale: 'Consistency improving · maintain CoS gate', confidencePct: 88 },
      { id: 'dr-2', domain: 'Copy reviews', currentLevel: 'soft-approval', recommendedLevel: 'fully-delegated', rationale: 'Writing Bible compliance high · auto when compliant', confidencePct: 84 },
      { id: 'dr-3', domain: 'Publishing', currentLevel: 'fully-delegated', recommendedLevel: 'fully-delegated', rationale: 'Zero overrides in 30 days · proven pattern', confidencePct: 94 },
      { id: 'dr-4', domain: 'Automation', currentLevel: 'chief-of-staff', recommendedLevel: 'soft-approval', rationale: 'Increase autonomy for DNA-aligned rules', confidencePct: 82 },
      { id: 'dr-5', domain: 'Financial approvals', currentLevel: 'founder-only', recommendedLevel: 'founder-only', rationale: 'High-value spend always founder · no change', confidencePct: 96 },
      { id: 'dr-6', domain: 'Legal reviews', currentLevel: 'founder-only', recommendedLevel: 'founder-only', rationale: 'Policy updates require founder acknowledgment', confidencePct: 97 },
      { id: 'dr-7', domain: 'Hiring', currentLevel: 'founder-only', recommendedLevel: 'founder-only', rationale: 'Strategic · always founder', confidencePct: 99 },
      { id: 'dr-8', domain: 'Strategic partnerships', currentLevel: 'founder-only', recommendedLevel: 'founder-only', rationale: 'Brand and revenue impact · founder judgment', confidencePct: 98 },
    ],
    riskIntelligence: [
      { id: 'ri-1', category: 'Legal · affiliate', tolerance: 'conservative', trigger: 'FTC guidance updates', observedPattern: 'Always founder-reviewed · never delegated' },
      { id: 'ri-2', category: 'Creative format', tolerance: 'moderate', trigger: 'Labs experiment with fallback', observedPattern: 'Approve when data supports · revert if underperforms' },
      { id: 'ri-3', category: 'Automation', tolerance: 'aggressive', trigger: 'Protects founder attention', observedPattern: 'Fast approval when fallback exists' },
      { id: 'ri-4', category: 'Financial · under $3K', tolerance: 'moderate', trigger: 'ROI deck provided', observedPattern: 'Approves with annual billing preference' },
      { id: 'ri-5', category: 'Brand positioning', tolerance: 'conservative', trigger: 'Public-facing policy change', observedPattern: 'Founder becomes more conservative' },
    ],
    feedbackIntelligence: [
      { id: 'fi-1', type: 'revision', pattern: 'Soften casual phrases in money content', frequency: 8, coachingNote: 'Run Writing Bible avoid-list before CCO submission' },
      { id: 'fi-2', type: 'praise', pattern: 'Stat overlay alignment with Creative DNA', frequency: 12, coachingNote: 'Reinforce Labs #38 template as default' },
      { id: 'fi-3', type: 'objection', pattern: 'Too much text on thumbnail', frequency: 5, coachingNote: 'Asset Director · minimal text playbook' },
      { id: 'fi-4', type: 'coaching', pattern: 'Thumbnail queue aging > 24h', frequency: 3, coachingNote: 'CCO · implement default template routing' },
      { id: 'fi-5', type: 'revision', pattern: 'Hook too weak for mind volume', frequency: 6, coachingNote: 'Apply Labs #42 question hook template B' },
    ],
    leadershipTimeline: [
      { id: 'lt-1', timestamp: hoursAgo(2), type: 'decision', title: 'PAGE 028 STAT OVERLAY APPROVED', detail: 'Pattern reinforced · Creative DNA + Labs #38', metricDelta: 'CoS confidence +2%' },
      { id: 'lt-2', timestamp: daysAgo(3), type: 'delegation', title: 'CREATIVE SOFT-APPROVAL EXPANDED', detail: '12 additional L2 approvals delegated to CoS', metricDelta: 'Delegation +12%' },
      { id: 'lt-3', timestamp: daysAgo(7), type: 'confidence', title: 'CoS ALIGNMENT 84% → 86%', detail: 'Improved Leadership DNA evaluation accuracy', metricDelta: 'Executive trust +3%' },
      { id: 'lt-4', timestamp: daysAgo(14), type: 'evolution', title: 'WRITING INTELLIGENCE CONNECTED', detail: 'Leadership DNA ↔ Writing DNA bridge active', metricDelta: 'Writing compliance +8%' },
      { id: 'lt-5', timestamp: daysAgo(20), type: 'trust', title: 'OPERATIONS FULLY AUTONOMOUS', detail: 'Zero scheduling escalations in 30 days', metricDelta: 'Maturity +5%' },
      { id: 'lt-6', timestamp: daysAgo(30), type: 'maturity', title: 'LEADERSHIP DNA V1.0 LAUNCHED', detail: 'Primary CoS training framework · cross-company', metricDelta: 'Org maturity 78%' },
    ],
    crossCompanyInsights: [
      { id: 'cc-1', workspaceId: 'ai-media', workspaceName: 'AI Media · ndxbook', insight: 'Mind volume +18% retention → leadership pattern: allocate more pages to outperforming volumes', appliesToAll: false },
      { id: 'cc-2', workspaceId: 'frontal-slayer', workspaceName: 'Frontal Slayer', insight: 'Product photography pipeline reusable for ndxbook thumbnails — creative taste transfers', appliesToAll: true },
      { id: 'cc-3', workspaceId: 'studio-os', workspaceName: 'Studio OS', insight: 'Founder leadership philosophy consistent · company DNA unique per workspace', appliesToAll: true },
      { id: 'cc-4', workspaceId: 'ai-media', workspaceName: 'AI Media', insight: 'Quality over speed principle applies portfolio-wide · ndxbook flagship sets bar', appliesToAll: true },
    ],
    simulatorScenarios: [
      {
        id: 'sim-1',
        title: 'New vendor tool renewal · $2,400 annual',
        situation: 'CFO requests analytics + scheduling stack renewal mid-Q3',
        historicalParallels: ['Q2 tool renewal approved with 15% discount', 'Ops tools under $3K pattern'],
        pastOutcomes: ['3.2x ROI achieved', '4h/week ops time saved'],
        alternativeStrategies: ['Negotiate discount', 'Switch to competitor', 'Defer to Q4'],
        recommendedApproach: 'Approve with ROI deck · negotiate annual discount · delegate prep to CFO',
        confidencePct: 82,
      },
      {
        id: 'sim-2',
        title: 'Affiliate disclosure policy update',
        situation: 'CLO flags new FTC guidance · consumer volume disclaimer diff',
        historicalParallels: ['Consumer disclaimer v2.0 approved May 2026', 'Legal always founder-reviewed'],
        pastOutcomes: ['No compliance issues post v2.0', 'Brand trust maintained'],
        alternativeStrategies: ['CoS soft-approve minor diff', 'Full founder review', 'Delay publish'],
        recommendedApproach: 'Founder review · 2 min read · legal policy = conservative risk profile',
        confidencePct: 94,
      },
      {
        id: 'sim-3',
        title: 'Expand mind volume to 3 pages/week',
        situation: 'CGO proposes cadence increase based on +18% retention',
        historicalParallels: ['Money Monday cycle expansion approved Q1', 'Volume scaling after Labs validation'],
        pastOutcomes: ['Retention held · revenue pacing improved'],
        alternativeStrategies: ['Hold at 2/week', '3/week with quality gate', '4/week aggressive'],
        recommendedApproach: 'Approve 3/week with 72% completion gate · CoS monitors quality bar',
        confidencePct: 79,
      },
    ],
    institutionalLessons: [
      { id: 'il-1', sourceWorkspace: 'AI Media · ndxbook', lesson: 'Stat overlays on money content consistently outperform', pattern: 'Creative taste → approval pattern → CoS soft approval', transferable: true },
      { id: 'il-2', sourceWorkspace: 'Frontal Slayer', lesson: 'Photography Bible pipeline reduces creative review time', pattern: 'Asset systems before scale', transferable: true },
      { id: 'il-3', sourceWorkspace: 'Studio OS', lesson: 'Chief of Staff threshold at 82% balances speed and judgment', pattern: 'Delegation engine calibration', transferable: true },
      { id: 'il-4', sourceWorkspace: 'AI Media', lesson: 'Writing Bible enforcement prevents money content tone drift', pattern: 'DNA layers reinforce leadership principles', transferable: true },
    ],
    knowledgeGraphLinks: [
      'node-leadership-dna',
      'node-memory-bible',
      'node-creative-dna',
      'node-studio-intelligence',
      'chief-of-staff',
    ],
  };
}

export function bootstrapLeadershipDnaPlatform(): void {
  bootstrapLeadershipDnaStore(buildLeadershipDnaSeed());
  refreshLeadershipDnaDashboard();
}
