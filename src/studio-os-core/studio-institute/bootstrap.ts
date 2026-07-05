import { bootstrapStudioInstituteStore } from './store';
import type { StudioInstituteStore } from './types';
import { SI_INSTITUTE_MOTTO } from './constants';

export function buildStudioInstituteSeed(): Partial<StudioInstituteStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    instituteMotto: SI_INSTITUTE_MOTTO,
    dashboard: {
      summary:
        'STUDIO INSTITUTE V1.0 — NDXBOOK · 9 schools active · 6 executive faculty · 847 knowledge contributions · wisdom compounding daily.',
      activeLearners: 124,
      schoolsActive: 9,
      facultyMembers: 6,
      certificationsEarned: 34,
      knowledgeContributions: 847,
    },
    learningCommunities: [
      { id: 'lc-1', role: 'Founders', description: 'Vision · stewardship · legacy · organizational architecture', personalizedJourney: 'Leadership forum · founder promise curriculum · council simulations', active: true },
      { id: 'lc-2', role: 'Executives', description: 'Discipline mastery · executive collaboration · organizational judgment', personalizedJourney: 'Faculty workshops · apprenticeship integration · certification paths', active: true },
      { id: 'lc-3', role: 'Employees', description: 'Craftsmanship · departmental excellence · cross-functional understanding', personalizedJourney: 'Role-based paths · initiative-aligned modules · reflection journals', active: true },
      { id: 'lc-4', role: 'Future leaders', description: 'Succession · institutional wisdom · leadership readiness', personalizedJourney: 'Executive readiness · mentorship · organizational inheritance', active: true },
      { id: 'lc-5', role: 'Creators', description: 'Writing DNA · editorial integrity · stat-forward craftsmanship', personalizedJourney: 'Creator marketplace quality gates · NDXBOOK publishing curriculum', active: true },
      { id: 'lc-6', role: 'Partners', description: 'Relationship stewardship · aligned growth · trust protocols', personalizedJourney: 'Partnership excellence · relationship engine case studies', active: true },
      { id: 'lc-7', role: 'Community members', description: 'Belonging · advocacy · reader relationship design', personalizedJourney: 'Spotlight program · reader graph insights · belonging over volume', active: true },
      { id: 'lc-8', role: 'Customers', description: 'When appropriate — trust · transparency · value understanding', personalizedJourney: 'Onboarding education · editorial identity · relationship-first CX', active: false },
    ],
    schoolsOfExcellence: [
      { id: 'se-1', name: 'School of Leadership', focus: 'Organizational thinking · decision making · executive collaboration', disciplines: ['Council simulations', 'Founder calibration', 'Stewardship'], status: 'active' },
      { id: 'se-2', name: 'School of Branding', focus: 'Identity · positioning · storytelling · creative stewardship', disciplines: ['Writing DNA', 'Stat-forward editorial', 'Brand architecture'], status: 'active' },
      { id: 'se-3', name: 'School of Customer Experience', focus: 'Hospitality · psychology · relationship design · trust', disciplines: ['Reader journey', 'Onboarding excellence', 'Belonging design'], status: 'active' },
      { id: 'se-4', name: 'School of Digital Innovation', focus: 'Systems thinking · product architecture · digital craftsmanship', disciplines: ['NDXBOOK platform', 'Distribution architecture', 'Content systems'], status: 'active' },
      { id: 'se-5', name: 'School of Technology', focus: 'Engineering · scalability · security · technical stewardship', disciplines: ['Auth infrastructure', 'Live preview pipeline', 'Master craftsman engineering'], status: 'active' },
      { id: 'se-6', name: 'School of Growth', focus: 'Sustainable growth · market strategy · community · long-term expansion', disciplines: ['Trust-before-scale', 'Relationship-driven GTM', 'Spotlight program'], status: 'active' },
      { id: 'se-7', name: 'School of Operations', focus: 'Workflow orchestration · delegation · cross-functional coordination', disciplines: ['Onboarding sprint', 'Executive coordination', 'Momentum'], status: 'active' },
      { id: 'se-8', name: 'School of Organizational Intelligence', focus: 'Continuous learning · maturity · institutional memory · evolution', disciplines: ['OI signals', 'Maturity progression', 'Self-improvement'], status: 'active' },
      { id: 'se-9', name: 'School of Stewardship', focus: 'Governance · legacy · founder promise · generational wisdom', disciplines: ['Constitutional governance', 'Organizational inheritance', 'Legacy campus'], status: 'active' },
    ],
    executiveFaculty: [
      { id: 'ef-1', executive: 'Chief Brand Officer', teaches: ['Identity', 'Positioning', 'Storytelling', 'Creative stewardship'], source: '847 creative reviews · Writing DNA gates · stat-forward editorial evolution' },
      { id: 'ef-2', executive: 'Chief Experience Officer', teaches: ['Hospitality', 'Customer psychology', 'Relationship design', 'Trust'], source: 'Onboarding sprint · reader belonging · Step 3 friction lessons' },
      { id: 'ef-3', executive: 'Chief Digital Officer', teaches: ['Systems thinking', 'Product architecture', 'Digital craftsmanship'], source: 'NDXBOOK newsroom · distribution engine · campaign evolution' },
      { id: 'ef-4', executive: 'Chief Technology Officer', teaches: ['Engineering', 'Scalability', 'Security', 'Technical stewardship'], source: 'Auth refactor decisions · Fal pipeline · enterprise readiness path' },
      { id: 'ef-5', executive: 'Chief Growth Officer', teaches: ['Sustainable growth', 'Market strategy', 'Community building', 'Long-term expansion'], source: 'Trust gate enforcement · spotlight pilot · relationship-driven GTM' },
      { id: 'ef-6', executive: 'Chief of Staff', teaches: ['Leadership', 'Organizational thinking', 'Decision making', 'Executive collaboration'], source: 'Council coordination · apprenticeship mentorship · arrival ceremonies' },
    ],
    organizationFirstLessons: [
      { id: 'of-1', source: 'Campaign review', title: 'Spotlight program launch — relationship metrics only', teachesWhy: 'Founder rejected vanity engagement · chose belonging over volume', category: 'Growth' },
      { id: 'of-2', source: 'Product launch', title: 'Onboarding Step 3 simplification sprint', teachesWhy: 'CX friction erodes trust · enterprise readiness requires customer gates', category: 'Experience' },
      { id: 'of-3', source: 'Creative evolution', title: 'Writing DNA quality gate introduction', teachesWhy: 'Editorial integrity preserved across scale · stat-forward identity non-negotiable', category: 'Brand' },
      { id: 'of-4', source: 'Customer story', title: 'Reader advocacy pilot +15% — belonging signal', teachesWhy: 'Relationship-driven growth compounds · transactions follow trust', category: 'Community' },
      { id: 'of-5', source: 'Executive council discussion', title: 'GTM deferral until onboarding gate cleared', teachesWhy: 'Constitutional synthesis · maturity earned not unlocked', category: 'Leadership' },
      { id: 'of-6', source: 'Technology milestone', title: 'Auth refactor prioritized over feature velocity', teachesWhy: 'Foundation before expansion · master craftsman engineering', category: 'Technology' },
      { id: 'of-7', source: 'Organizational breakthrough', title: 'Executive apprenticeship soft approval at 96%', teachesWhy: 'Trust earned through demonstrated alignment · not configuration', category: 'Stewardship' },
      { id: 'of-8', source: 'Mistake preserved', title: 'Premature paid acquisition temptation rejected', teachesWhy: 'Trust-before-scale enforced · growth philosophy internalized', category: 'Growth' },
    ],
    adaptiveLearningPaths: [
      { id: 'alp-1', learner: 'Founder', role: 'Founder', maturityStage: 'SCALE', modules: ['Council simulation lab', 'Legacy stewardship', 'Organizational inheritance'], knowledgeGaps: ['Holding company governance'], aspirations: 'Institutional wisdom preserved across generations' },
      { id: 'alp-2', learner: 'Chief Brand Officer', role: 'Executive', maturityStage: 'SCALE', modules: ['Creative stewardship advanced', 'International brand adaptation', 'Creator marketplace quality'], knowledgeGaps: ['Edge case editorial scenarios'], aspirations: 'Trusted approval on all creative reviews' },
      { id: 'alp-3', learner: 'Newsroom creator', role: 'Creator', maturityStage: 'Launch', modules: ['Writing DNA fundamentals', 'Stat-forward craftsmanship', 'NDXBOOK publishing workflow'], knowledgeGaps: ['Long-form editorial structure'], aspirations: 'Contributor certification · institutional voice mastery' },
      { id: 'alp-4', learner: 'Future CBO candidate', role: 'Future leader', maturityStage: 'Growth', modules: ['Brand architecture', 'Executive readiness', 'Council observation'], knowledgeGaps: ['Cross-functional synthesis'], aspirations: 'Executive readiness certification' },
    ],
    immersiveLearning: [
      { id: 'il-1', type: 'Interactive simulation', title: 'Executive Council GTM timing dissent', description: 'Navigate constitutional governance · maturity gates · council synthesis', experiential: true },
      { id: 'il-2', type: 'Executive workshop', title: 'Writing DNA editorial review lab', description: 'CBO faculty · live creative review · founder preference calibration', experiential: true },
      { id: 'il-3', type: 'Case study', title: 'Onboarding Step 3 friction — trust erosion analysis', description: 'CEO faculty · customer psychology · relationship design', experiential: true },
      { id: 'il-4', type: 'Organizational scenario', title: 'Auth refactor vs feature velocity trade-off', description: 'CTO faculty · technical stewardship · enterprise readiness', experiential: true },
      { id: 'il-5', type: 'Decision exercise', title: 'Predict founder decision — campaign approval batch', description: 'Practice mode integration · comparison learning · alignment scoring', experiential: true },
      { id: 'il-6', type: 'Reflection journal', title: 'Weekly leadership reflection — stewardship principles', description: 'Personal growth · organizational contribution · wisdom capture', experiential: true },
      { id: 'il-7', type: 'Strategy lab', title: 'Trust-before-scale GTM gate design', description: 'CGO faculty · sustainable growth · community building', experiential: true },
      { id: 'il-8', type: 'Cross-functional simulation', title: 'Onboarding simplification sprint — full org coordination', description: 'CoS faculty · workflow · delegation · momentum', experiential: true },
    ],
    organizationalCertifications: [
      { id: 'oc-1', name: 'Leadership Stewardship', category: 'Leadership', requirement: 'Council simulation mastery · constitutional governance demonstrated', demonstrates: 'Organizational wisdom · not completed coursework', status: 'available' },
      { id: 'oc-2', name: 'Executive Readiness — Brand', category: 'Executive readiness', requirement: '500+ creative reviews at 95%+ founder alignment', demonstrates: 'Trusted creative judgment · CBO graduation path', status: 'in-progress' },
      { id: 'oc-3', name: 'Department Mastery — Editorial', category: 'Department mastery', requirement: 'Writing DNA certification · 50 published pieces passing quality gates', demonstrates: 'Stat-forward craftsmanship · institutional voice', status: 'available' },
      { id: 'oc-4', name: 'Organizational Stewardship Recognition', category: 'Stewardship', requirement: 'CoS organizational stewardship level · 891 reviews at 96% alignment', demonstrates: 'Generational wisdom steward · founder amplification', status: 'earned' },
      { id: 'oc-5', name: 'Knowledge Contribution Recognition', category: 'Knowledge', requirement: '10 lessons contributed to institutional memory · KG enrichment', demonstrates: 'Wisdom compounding · future learner benefit', status: 'available' },
    ],
    knowledgeCompounding: [
      { id: 'kc-1', lesson: 'Spotlight program case study', contributesTo: 'Knowledge Graph', benefit: 'Growth philosophy nodes enriched · future CGO learners inherit GTM wisdom' },
      { id: 'kc-2', lesson: 'Writing DNA editorial lab', contributesTo: 'Company Genome', benefit: 'Editorial DNA strengthened · brand identity compounds' },
      { id: 'kc-3', lesson: 'Council GTM simulation', contributesTo: 'Organizational Intelligence', benefit: 'Decision patterns captured · maturity signals refined' },
      { id: 'kc-4', lesson: 'Onboarding friction analysis', contributesTo: 'Institutional memory', benefit: 'CX lessons preserved · CEO faculty curriculum expanded' },
      { id: 'kc-5', lesson: 'Auth refactor stewardship case', contributesTo: 'Knowledge Graph', benefit: 'Technology philosophy nodes · CTO faculty teachings updated' },
    ],
    instituteCampus: [
      { id: 'ic-1', space: 'Executive lecture halls', atmosphere: 'Architectural · scholarly · warm lighting', purpose: 'Faculty teachings · council case reviews · leadership forum' },
      { id: 'ic-2', space: 'Innovation laboratories', atmosphere: 'Modern · minimal · inspiring', purpose: 'Strategy labs · digital craftsmanship · experimentation' },
      { id: 'ic-3', space: 'Strategy studios', atmosphere: 'Timeless · focused · collaborative', purpose: 'Cross-functional simulations · decision exercises' },
      { id: 'ic-4', space: 'Organizational library', atmosphere: 'Scholarly · quiet · institutional', purpose: 'Case studies · learning library · accumulated wisdom' },
      { id: 'ic-5', space: 'Reflection gardens', atmosphere: 'Warm · contemplative · natural', purpose: 'Leadership reflection · stewardship meditation · legacy thinking' },
      { id: 'ic-6', space: 'Collaboration lounges', atmosphere: 'Minimal · comfortable · inviting', purpose: 'Learning conversations · peer mentorship · community' },
      { id: 'ic-7', space: 'Simulation theaters', atmosphere: 'Immersive · cinematic · experiential', purpose: 'Council simulations · organizational scenarios · workshops' },
      { id: 'ic-8', space: 'Knowledge galleries', atmosphere: 'Inspiring · curated · evolving', purpose: 'Organizational breakthroughs · mistakes · successes on display' },
      { id: 'ic-9', space: 'Leadership forum', atmosphere: 'Prestigious · inclusive · generational', purpose: 'Founders · executives · future leaders · stewardship dialogue' },
    ],
    dailyLearning: [
      { id: 'dl-1', type: 'Today\'s lesson', title: 'Trust-before-scale — why GTM gates exist', recommendedFor: 'All executives', priority: 'high' },
      { id: 'dl-2', type: 'Leadership reflection', title: 'What would disappoint you if we succeeded but lost editorial integrity?', recommendedFor: 'Founders · CBO', priority: 'high' },
      { id: 'dl-3', type: 'Executive insight', title: 'CBO: Stat-forward headline patterns from 847 reviews', recommendedFor: 'Creators · CBO apprentices', priority: 'medium' },
      { id: 'dl-4', type: 'Organizational case study', title: 'Onboarding Step 3 — friction anatomy', recommendedFor: 'CEO · CX team', priority: 'high' },
      { id: 'dl-5', type: 'Knowledge gap', title: 'International brand adaptation — observation needed', recommendedFor: 'Chief Brand Officer', priority: 'medium' },
      { id: 'dl-6', type: 'Recommended reading', title: 'Executive learning library: Auth refactor decision rationale', recommendedFor: 'CTO · engineering', priority: 'medium' },
      { id: 'dl-7', type: 'Executive workshop', title: 'Writing DNA editorial review lab — tomorrow 10am', recommendedFor: 'Newsroom creators', priority: 'high' },
    ],
    ndxbookIntegration: [
      { id: 'ni-1', flow: 'Published NDXBOOK article', destination: 'Executive workshop material', description: 'Stat-forward editorial pieces become CBO faculty case studies' },
      { id: 'ni-2', flow: 'Reader engagement insights', destination: 'Organizational case studies', description: 'Reader graph data informs CX school curriculum' },
      { id: 'ni-3', flow: 'Newsroom production archive', destination: 'Organizational library', description: 'Campaign evolution preserved as organization-first lessons' },
      { id: 'ni-4', flow: 'Writing DNA exemplars', destination: 'Certification programs', description: 'Published quality gates become creator certification benchmarks' },
      { id: 'ni-5', flow: 'Editorial reflections', destination: 'Reflection journals', description: 'Creator journals flow into institutional memory · future curriculum' },
      { id: 'ni-6', flow: 'Organizational breakthroughs', destination: 'Knowledge galleries', description: 'NDXBOOK publishing engine transforms knowledge into organizational wisdom' },
    ],
    futureOpportunities: [
      'Global institute network at holding company maturity — cross-portfolio wisdom exchange',
      'Generational curriculum inheritance via Organizational Inheritance framework',
      'Immersive campus visualization as institute spaces evolve with organizational maturity',
    ],
  };
}

export function bootstrapStudioInstitutePlatform(): void {
  bootstrapStudioInstituteStore(buildStudioInstituteSeed());
}
