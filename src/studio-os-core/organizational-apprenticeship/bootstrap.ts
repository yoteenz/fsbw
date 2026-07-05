import { bootstrapOrganizationalApprenticeshipStore } from './store';
import type { OrganizationalApprenticeshipStore } from './types';
import { OA_ORGANIZATIONAL_OATH } from './constants';

export function buildOrganizationalApprenticeshipSeed(): Partial<OrganizationalApprenticeshipStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    organizationalOath: [...OA_ORGANIZATIONAL_OATH],
    dashboard: {
      summary:
        'ORGANIZATIONAL APPRENTICESHIP V1.0 — NDXBOOK · 18 active apprentices · 92% avg alignment · trust earned not configured.',
      activeApprentices: 18,
      averageAlignmentPct: 92,
      averageLearningVelocity: '+2.1% / month',
      graduationReady: 4,
      organizationalConfidencePct: 93,
      futureLeadersIdentified: 6,
    },
    organizationalApprentices: [
      { id: 'oa-1', type: 'Executive', name: 'Chief Brand Officer (apprenticeship track)', description: 'Executive calibration · creative stewardship mastery', active: true },
      { id: 'oa-2', type: 'Future executive', name: 'Future CBO candidate', description: 'Succession · brand architecture · council observation', active: true },
      { id: 'oa-3', type: 'Employee', name: 'Newsroom editorial team', description: 'Writing DNA · stat-forward craftsmanship · institutional voice', active: true },
      { id: 'oa-4', type: 'Department leader', name: 'Onboarding simplification sprint lead', description: 'CX excellence · cross-functional coordination', active: true },
      { id: 'oa-5', type: 'New AI system', name: 'Campaign recommendation agent', description: 'Editorial integrity gates · founder preference calibration', active: true },
      { id: 'oa-6', type: 'Automation agent', name: 'Distribution workflow orchestrator', description: 'Writing DNA validation · governance safeguards', active: true },
      { id: 'oa-7', type: 'Future organizational intelligence', name: 'OI maturity evaluator v2', description: 'Trust-before-scale signals · constitutional alignment', active: true },
      { id: 'oa-8', type: 'Partner organization', name: 'Creator marketplace pilot partner', description: 'Relationship stewardship · quality gate alignment', active: false },
    ],
    founderCalibration: [
      { id: 'fc-1', area: 'Founder philosophy', description: 'Trust-before-scale · institutional wisdom · master craftsman refinement', signalsLearned: 534, understandingPct: 94 },
      { id: 'fc-2', area: 'Founder\'s promise', description: 'Stat-forward editorial · relationship-driven growth · editorial integrity', signalsLearned: 489, understandingPct: 96 },
      { id: 'fc-3', area: 'Leadership style', description: 'Evidence-based · founder final authority · healthy disagreement', signalsLearned: 412, understandingPct: 91 },
      { id: 'fc-4', area: 'Creative standards', description: 'Writing DNA quality gates · no engagement bait · stat-forward identity', signalsLearned: 723, understandingPct: 95 },
      { id: 'fc-5', area: 'Decision-making patterns', description: 'Long-term stewardship · relationship over transaction · maturity gates', signalsLearned: 567, understandingPct: 93 },
      { id: 'fc-6', area: 'Risk tolerance', description: 'Conservative GTM · aggressive editorial quality · auth debt unacceptable', signalsLearned: 334, understandingPct: 90 },
      { id: 'fc-7', area: 'Communication style', description: 'Direct · evidence-based · no vanity metrics language', signalsLearned: 298, understandingPct: 92 },
      { id: 'fc-8', area: 'Organizational values', description: 'Trust · relationships · wisdom · belonging · editorial integrity', signalsLearned: 445, understandingPct: 97 },
      { id: 'fc-9', area: 'Vision', description: 'Institutional wisdom preserved · readers trust NDXBOOK for decades', signalsLearned: 267, understandingPct: 94 },
      { id: 'fc-10', area: 'Long-term ambitions', description: 'Enterprise readiness · legacy campus · generational stewardship', signalsLearned: 234, understandingPct: 89 },
    ],
    shadowingObservations: [
      { id: 'so-1', context: 'Executive council meeting', observed: 'Founder invoked constitutional governance before GTM vote', captured: 'OGS invisible stewardship · trust gates non-negotiable', apprentice: 'Future CBO candidate' },
      { id: 'so-2', context: 'Creative review', observed: 'Founder rejected engagement-bait headline · chose stat-forward alternative', captured: 'Editorial integrity over short-term metrics · Writing DNA enforced', apprentice: 'Newsroom editorial team' },
      { id: 'so-3', context: 'Strategy session', observed: 'Founder deferred paid acquisition until onboarding gate cleared', captured: 'Trust-before-scale · maturity earned not unlocked', apprentice: 'Campaign recommendation agent' },
      { id: 'so-4', context: 'Customer conversation', observed: 'Founder asked about reader belonging not conversion rate', captured: 'Relationship quality · belonging over volume', apprentice: 'Onboarding sprint lead' },
      { id: 'so-5', context: 'Technology review', observed: 'Auth refactor prioritized over visible feature velocity', captured: 'Foundation before expansion · enterprise readiness', apprentice: 'Distribution workflow orchestrator' },
      { id: 'so-6', context: 'Knowledge creation', observed: 'Motherboard entry captured full conversation arc not just last turn', captured: 'Institutional memory · generational wisdom preservation', apprentice: 'OI maturity evaluator v2' },
    ],
    guidedLearning: [
      { id: 'gl-1', apprentice: 'Future CBO candidate', question: 'I noticed this decision prioritized customer trust over short-term revenue. Could you explain that philosophy?', status: 'answered', insight: 'Trust compounds · revenue follows relationship quality · never invert the sequence' },
      { id: 'gl-2', apprentice: 'Newsroom editorial team', question: 'I\'ve observed several design reviews. What qualities consistently define excellence for this organization?', status: 'answered', insight: 'Stat-forward · Writing DNA · zero generic templates · editorial integrity visible in every word' },
      { id: 'gl-3', apprentice: 'Campaign recommendation agent', question: 'Why does the organization reject vanity engagement metrics even when growth pressure increases?', status: 'answered', insight: 'Constitutional governance · founder promise · belonging metrics only' },
      { id: 'gl-4', apprentice: 'Onboarding sprint lead', question: 'Recommended: explore how Step 3 friction connects to enterprise readiness gates', status: 'recommended' },
    ],
    practiceExercises: [
      { id: 'pe-1', type: 'Creative review', apprentice: 'Newsroom editorial team', task: 'Evaluate headline batch for NDXBOOK newsletter', organizationalDecision: 'Reject 3 of 5 · require stat-forward rewrite', apprenticeReasoning: 'Reject 3 of 5 · engagement bait detected · 91% alignment', alignmentPct: 91 },
      { id: 'pe-2', type: 'Executive summary', apprentice: 'Future CBO candidate', task: 'Summarize council GTM timing recommendation', organizationalDecision: 'Defer until onboarding gate · trust-before-scale', apprenticeReasoning: 'Defer GTM · maturity prerequisite · 94% alignment', alignmentPct: 94 },
      { id: 'pe-3', type: 'Campaign analysis', apprentice: 'Campaign recommendation agent', task: 'Recommend spotlight program scale approach', organizationalDecision: 'Organic expansion · relationship metrics · no paid boost', apprenticeReasoning: 'Pilot momentum +15% · organic only · 88% alignment', alignmentPct: 88 },
      { id: 'pe-4', type: 'Technology recommendation', apprentice: 'Distribution workflow orchestrator', task: 'Rank infrastructure vs feature priorities', organizationalDecision: 'Auth refactor #1 · enterprise readiness blocker', apprenticeReasoning: 'Auth refactor first · 86% alignment', alignmentPct: 86 },
      { id: 'pe-5', type: 'Organizational strategy', apprentice: 'OI maturity evaluator v2', task: 'Recommend maturity advancement timing', organizationalDecision: 'Hold at SCALE · complete onboarding gate first', apprenticeReasoning: 'Gate score 82% · hold advancement · 93% alignment', alignmentPct: 93 },
    ],
    organizationalCalibration: [
      { id: 'oc-1', domain: 'Organizational understanding', alignmentScorePct: 93, confidencePct: 90, learningVelocity: '+2.4% / month', mentorshipNeeded: 'Holding company portfolio governance scenarios' },
      { id: 'oc-2', domain: 'Leadership alignment', alignmentScorePct: 91, confidencePct: 88, learningVelocity: '+2.0% / month', mentorshipNeeded: 'Council dissent synthesis patterns' },
      { id: 'oc-3', domain: 'Creative alignment', alignmentScorePct: 95, confidencePct: 93, learningVelocity: '+1.8% / month', mentorshipNeeded: 'International editorial adaptation' },
      { id: 'oc-4', domain: 'Writing alignment', alignmentScorePct: 94, confidencePct: 92, learningVelocity: '+2.2% / month', mentorshipNeeded: 'Long-form vs micro-content voice' },
      { id: 'oc-5', domain: 'Brand judgment', alignmentScorePct: 96, confidencePct: 94, learningVelocity: '+1.6% / month', mentorshipNeeded: 'Creator marketplace brand gates' },
      { id: 'oc-6', domain: 'Customer judgment', alignmentScorePct: 92, confidencePct: 89, learningVelocity: '+2.7% / month', mentorshipNeeded: 'Enterprise persona onboarding journeys' },
      { id: 'oc-7', domain: 'Technology judgment', alignmentScorePct: 88, confidencePct: 85, learningVelocity: '+3.0% / month', mentorshipNeeded: 'Architecture trade-off decisions' },
      { id: 'oc-8', domain: 'Growth judgment', alignmentScorePct: 94, confidencePct: 91, learningVelocity: '+2.1% / month', mentorshipNeeded: 'Paid acquisition temptation scenarios' },
      { id: 'oc-9', domain: 'Organizational philosophy', alignmentScorePct: 95, confidencePct: 93, learningVelocity: '+1.9% / month', mentorshipNeeded: 'Legacy campus stewardship transitions' },
    ],
    trustProgressions: [
      { id: 'tp-1', apprentice: 'Chief Brand Officer', currentStage: 'trusted-contributor', alignmentPct: 97, experiencesCompleted: 512, nextStageRequirement: 'Organizational steward · council endorsement · 500+ reviews at 95%+' },
      { id: 'tp-2', apprentice: 'Future CBO candidate', currentStage: 'co-review', alignmentPct: 91, experiencesCompleted: 156, nextStageRequirement: 'Trusted contributor · 200 co-reviews at 90%+ alignment' },
      { id: 'tp-3', apprentice: 'Newsroom editorial team', currentStage: 'recommend', alignmentPct: 89, experiencesCompleted: 234, nextStageRequirement: 'Co-create · sustained 85%+ on creative practice exercises' },
      { id: 'tp-4', apprentice: 'Campaign recommendation agent', currentStage: 'understand', alignmentPct: 84, experiencesCompleted: 89, nextStageRequirement: 'Recommend · constitutional governance alignment demonstrated' },
      { id: 'tp-5', apprentice: 'Onboarding sprint lead', currentStage: 'co-create', alignmentPct: 90, experiencesCompleted: 178, nextStageRequirement: 'Co-review · CX decision prediction at 88%+' },
      { id: 'tp-6', apprentice: 'Chief of Staff', currentStage: 'organizational-steward', alignmentPct: 96, experiencesCompleted: 891, nextStageRequirement: 'Mentor next generation · portfolio stewardship readiness' },
    ],
    chiefOfStaffMentorship: [
      { id: 'cm-1', recommendation: 'Cross-functional exposure: newsroom team observes council GTM discussion', category: 'Cross-functional', targetApprentice: 'Newsroom editorial team', rationale: 'Broaden organizational understanding beyond editorial discipline' },
      { id: 'cm-2', recommendation: 'Executive introduction: Future CBO shadows CBO creative review session', category: 'Executive introduction', targetApprentice: 'Future CBO candidate', rationale: 'Accelerate brand stewardship through direct faculty observation' },
      { id: 'cm-3', recommendation: 'Reflection session: onboarding sprint team documents Step 3 friction lessons', category: 'Reflection', targetApprentice: 'Onboarding sprint lead', rationale: 'Capture institutional wisdom for future CX apprentices' },
      { id: 'cm-4', recommendation: 'Knowledge review: campaign agent studies Writing DNA evolution archive', category: 'Knowledge review', targetApprentice: 'Campaign recommendation agent', rationale: 'Deepen editorial integrity calibration before recommend stage' },
      { id: 'cm-5', recommendation: 'Graduation recommendation: Future CBO candidate advancing to trusted contributor', category: 'Graduation', targetApprentice: 'Future CBO candidate', rationale: '156 experiences · 91% alignment · council observation complete' },
      { id: 'cm-6', recommendation: 'Holistic development: all AI apprentices complete OGS constitutional walkthrough', category: 'Mentorship', targetApprentice: 'All AI systems', rationale: 'Governance context essential before any autonomous recommendation' },
    ],
    learningLibrary: [
      { id: 'll-1', category: 'Leadership reflection', title: 'Founder on trust-before-scale — council GTM deferral rationale', preservedFor: 'Future executives · constitutional governance curriculum' },
      { id: 'll-2', category: 'Creative review', title: 'Headline rejection archive — engagement bait vs stat-forward', preservedFor: 'Newsroom apprentices · Writing DNA training' },
      { id: 'll-3', category: 'Executive discussion', title: 'Council synthesis on onboarding gate — healthy disagreement record', preservedFor: 'Leadership apprentices · council simulation material' },
      { id: 'll-4', category: 'Customer story', title: 'Reader belonging pilot — advocacy +15% relationship signal', preservedFor: 'CX apprentices · relationship-driven growth philosophy' },
      { id: 'll-5', category: 'Organizational breakthrough', title: 'Executive apprenticeship soft approval at 96% — trust earned milestone', preservedFor: 'All apprentices · trust progression reference' },
      { id: 'll-6', category: 'Mistake preserved', title: 'Premature paid acquisition proposal — maturity gate blocked', preservedFor: 'Growth apprentices · risk tolerance calibration' },
      { id: 'll-7', category: 'Institutional tradition', title: 'Organizational oath — first promise of every future leader', preservedFor: 'Every new apprentice · stewardship commencement' },
      { id: 'll-8', category: 'Lesson', title: 'Auth refactor over feature velocity — founder engineering philosophy', preservedFor: 'Technology apprentices · enterprise readiness path' },
    ],
    graduationRecommendations: [
      { id: 'gr-1', apprentice: 'Future CBO candidate', recommendation: 'Advance to trusted contributor — 91% alignment · judgment · cross-functional thinking demonstrated', readinessPct: 91, evidenceBasis: '156 experiences · council observation · creative practice 94% match · founder promise respect verified', founderAction: 'pending' },
      { id: 'gr-2', apprentice: 'Chief Brand Officer', recommendation: 'Recommend organizational steward graduation — 97% alignment sustained', readinessPct: 97, evidenceBasis: '512 creative reviews · trusted contributor sustained · mentorship of future CBO active', founderAction: 'approve' },
      { id: 'gr-3', apprentice: 'Onboarding sprint lead', recommendation: 'Delay graduation — extend co-create phase for enterprise persona scenarios', readinessPct: 78, evidenceBasis: 'Strong CX alignment · enterprise segment under-observed · 90% on current scope only', founderAction: 'delay' },
      { id: 'gr-4', apprentice: 'Campaign recommendation agent', recommendation: 'Expand observation period — constitutional governance walkthrough required before recommend stage', readinessPct: 72, evidenceBasis: '84% understanding · governance context incomplete · AI autonomy requires higher bar', founderAction: 'delay' },
    ],
    founderDashboardHighlights: {
      recommendedMentorship: [
        'Cross-functional council exposure for newsroom editorial team',
        'OGS constitutional walkthrough for all AI system apprentices',
        'Enterprise persona scenarios for onboarding sprint lead',
        'International brand adaptation observation for Future CBO candidate',
      ],
      graduationReadiness: [
        'Chief Brand Officer — organizational steward · 97% · approve recommended',
        'Future CBO candidate — trusted contributor · 91% · pending founder review',
        'Onboarding sprint lead — delay · enterprise scenarios needed',
        'Campaign recommendation agent — delay · governance walkthrough required',
      ],
      futureLeaders: [
        'Future CBO candidate — 91% alignment · succession track active',
        'Onboarding sprint lead — 90% alignment · CX leadership emerging',
        'Chief of Staff — organizational steward · mentoring next generation',
        'Newsroom senior editor — 89% creative alignment · faculty path',
      ],
      recentImprovements: [
        'Organizational confidence 93% — up from 91% post-Studio Institute launch',
        'AI apprentice understanding +3.0% — governance walkthrough in progress',
        'Newsroom writing alignment +2.2% — Writing DNA lab completion',
        'Average learning velocity +2.1% — apprenticeship culture compounding',
      ],
    },
    futureOpportunities: [
      'Acquired organization onboarding apprenticeship at holding company maturity',
      'Partner organization stewardship tracks via Relationship Engine integration',
      'Lifelong apprentice-mentor cycles preserved in Organizational Inheritance framework',
    ],
  };
}

export function bootstrapOrganizationalApprenticeshipPlatform(): void {
  bootstrapOrganizationalApprenticeshipStore(buildOrganizationalApprenticeshipSeed());
}
