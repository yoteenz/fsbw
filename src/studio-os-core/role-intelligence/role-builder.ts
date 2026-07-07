import { getOrganizationAutomationRegistryProfile } from '../automation-registry/store';
import { getOrganizationDocumentationRegistryProfile } from '../documentation-registry/store';
import { getOrganizationIdentityGraphProfile } from '../identity-graph/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationProfessionalProfilesProfile } from '../professional-profile/store';
import { getOrganizationSkillGraphProfile } from '../skill-graph/store';
import { getOrganizationStudioInstituteProfile } from '../studio-institute/org-store';
import {
  DECISION_AUTHORITY_LABELS,
  ROLE_DOMAIN_LABELS,
  ROLE_EVOLUTION_LABELS,
  ROLE_INTELLIGENCE_DOMAINS,
  ROLE_TEMPLATE_LABELS,
} from './constants';
import type {
  AiEmployeeCounterpart,
  DailyWorkflow,
  OrganizationalRoleDefinition,
  OrganizationRoleIntelligenceProfile,
  RoleDomainStatus,
  RoleEvolutionEvent,
  RoleIntelligenceInsight,
  RoleTemplate,
  DecisionAuthorityLevel,
  RoleEvolutionStage,
} from './types';

type RoleSeed = {
  roleKey: RoleTemplate;
  department: string;
  responsibilities: string[];
  workflows: { label: string; frequency: DailyWorkflow['frequency']; steps: string[] }[];
  authority: DecisionAuthorityLevel;
  authorityScope: string[];
  skills: string[];
  brains: string[];
  documents: string[];
  automations: string[];
  metrics: { label: string; target: string; current: string }[];
  learning: string[];
  aiName: string;
  aiCapabilities: string[];
  evolutionStage: RoleEvolutionStage;
};

const ROLE_SEEDS: RoleSeed[] = [
  {
    roleKey: 'receptionist',
    department: 'Front Office',
    responsibilities: ['Greet clients and visitors', 'Route inquiries to correct department', 'Maintain appointment calendar', 'Capture intake information accurately'],
    workflows: [{ label: 'Morning intake prep', frequency: 'daily', steps: ['Review day schedule', 'Prepare intake forms', 'Sync with concierge'] }],
    authority: 'execute-routine',
    authorityScope: ['Schedule adjustments under 24h', 'Route standard inquiries'],
    skills: ['Concierge Communication', 'Customer Success'],
    brains: ['Operations'],
    documents: ['Intake procedures', 'Visitor policy'],
    automations: ['Appointment reminders', 'Intake form routing'],
    metrics: [{ label: 'Response time', target: '<2 min', current: '1.8 min' }],
    learning: ['Front office certification', 'Concierge communication path'],
    aiName: 'Reception Concierge',
    aiCapabilities: ['Answer FAQs', 'Schedule routing', 'Intake capture'],
    evolutionStage: 'defined',
  },
  {
    roleKey: 'dispatcher',
    department: 'Operations',
    responsibilities: ['Assign jobs to field teams', 'Optimize routes and schedules', 'Coordinate emergency dispatches', 'Track job completion status'],
    workflows: [{ label: 'Dispatch board review', frequency: 'daily', steps: ['Review open jobs', 'Assign crews', 'Confirm ETAs', 'Update clients'] }],
    authority: 'recommend-approve',
    authorityScope: ['Routine dispatch decisions', 'Escalate priority overrides to operations lead'],
    skills: ['Operations Coordination', 'Asset Factory Equipment'],
    brains: ['Dispatch', 'Operations'],
    documents: ['Dispatch SOP', 'Route optimization guide'],
    automations: ['Job assignment alerts', 'ETA notifications'],
    metrics: [{ label: 'On-time dispatch', target: '95%', current: '92%' }],
    learning: ['Dispatch operations path', 'Route optimization module'],
    aiName: 'Dispatch Assistant',
    aiCapabilities: ['Route suggestions', 'Crew availability check', 'ETA updates'],
    evolutionStage: 'mature',
  },
  {
    roleKey: 'estimator',
    department: 'Sales',
    responsibilities: ['Prepare accurate project estimates', 'Review scope with clients', 'Coordinate with operations on feasibility', 'Maintain estimate templates'],
    workflows: [{ label: 'Estimate preparation', frequency: 'as-needed', steps: ['Scope review', 'Material/labor calc', 'Margin check', 'Client presentation'] }],
    authority: 'recommend-approve',
    authorityScope: ['Estimates within standard margin band', 'Escalate exceptions to founder'],
    skills: ['Revenue Development', 'Bookkeeping & Financial Reporting'],
    brains: ['Sales', 'Finance'],
    documents: ['Estimate templates', 'Pricing matrix'],
    automations: ['Estimate follow-up', 'Scope change alerts'],
    metrics: [{ label: 'Estimate accuracy', target: '±5%', current: '±4.2%' }],
    learning: ['Estimator certification', 'Pricing strategy module'],
    aiName: 'Estimate Advisor',
    aiCapabilities: ['Template population', 'Margin validation', 'Scope checklist'],
    evolutionStage: 'evolving',
  },
  {
    roleKey: 'permit-specialist',
    department: 'Compliance',
    responsibilities: ['Research permit requirements', 'Prepare and submit applications', 'Track approval status', 'Coordinate inspections'],
    workflows: [{ label: 'Permit tracking', frequency: 'weekly', steps: ['Review pending permits', 'Follow up agencies', 'Update project teams'] }],
    authority: 'execute-routine',
    authorityScope: ['Standard permit submissions', 'Escalate delays beyond SLA'],
    skills: ['Regulatory Compliance', 'Fuel Tax Operations'],
    brains: ['Compliance'],
    documents: ['Permit checklist', 'Agency contact registry'],
    automations: ['Permit deadline reminders', 'Status sync to project manager'],
    metrics: [{ label: 'Permit approval rate', target: '90%', current: '87%' }],
    learning: ['Compliance certification track'],
    aiName: 'Permit Tracker',
    aiCapabilities: ['Deadline monitoring', 'Agency requirement lookup', 'Status summaries'],
    evolutionStage: 'defined',
  },
  {
    roleKey: 'project-manager',
    department: 'Operations',
    responsibilities: ['Own end-to-end project delivery', 'Coordinate cross-functional teams', 'Manage timelines and budgets', 'Client communication and expectations'],
    workflows: [{ label: 'Project standup', frequency: 'daily', steps: ['Review milestones', 'Surface blockers', 'Update stakeholders', 'Adjust timeline'] }],
    authority: 'recommend-approve',
    authorityScope: ['Timeline adjustments within buffer', 'Budget reallocations under threshold', 'Escalate scope changes'],
    skills: ['Team Management', 'Operations Coordination', 'Customer Success'],
    brains: ['Operations', 'Project Delivery'],
    documents: ['Project charter template', 'Status report format'],
    automations: ['Milestone alerts', 'Stakeholder digests', 'Blocker escalations'],
    metrics: [{ label: 'On-time delivery', target: '90%', current: '88%' }, { label: 'Budget variance', target: '<5%', current: '3.8%' }],
    learning: ['Project management certification', 'Executive communication'],
    aiName: 'Project Concierge',
    aiCapabilities: ['Status synthesis', 'Risk flagging', 'Stakeholder briefings'],
    evolutionStage: 'mature',
  },
  {
    roleKey: 'executive-assistant',
    department: 'Executive',
    responsibilities: ['Protect founder calendar and focus', 'Prepare executive briefings', 'Coordinate approvals workflow', 'Anticipate executive needs'],
    workflows: [{ label: 'Executive morning brief', frequency: 'daily', steps: ['Compile priorities', 'Surface approvals', 'Prep briefing doc', 'Brief founder'] }],
    authority: 'escalate-only',
    authorityScope: ['Calendar management', 'Routine briefing prep', 'All decisions escalate to founder'],
    skills: ['Executive Decision Architecture', 'Concierge Communication'],
    brains: ['Executive', 'Founder Operating System'],
    documents: ['Executive briefing template', 'Approval workflow guide'],
    automations: ['Daily briefing generation', 'Approval reminders'],
    metrics: [{ label: 'Briefing readiness', target: '100%', current: '98%' }],
    learning: ['Chief of Staff foundations', 'Executive communication mastery'],
    aiName: 'Chief Concierge',
    aiCapabilities: ['Briefing synthesis', 'Approval triage', 'Calendar optimization'],
    evolutionStage: 'mature',
  },
  {
    roleKey: 'marketing-director',
    department: 'Marketing',
    responsibilities: ['Own brand and campaign strategy', 'Approve creative before launch', 'Manage marketing budget', 'Align campaigns with organizational goals'],
    workflows: [{ label: 'Campaign review cycle', frequency: 'weekly', steps: ['Review creative assets', 'Check brand compliance', 'Approve or revise', 'Schedule launch'] }],
    authority: 'full-autonomy',
    authorityScope: ['Campaign launches within budget', 'Brand guidelines enforcement', 'Escalate major spend to founder'],
    skills: ['Digital Marketing', 'Advanced SEO', 'Brand Vision & Creative Direction'],
    brains: ['Marketing', 'Brand'],
    documents: ['Brand bible', 'Campaign playbook', 'SEO strategy doc'],
    automations: ['Campaign performance digests', 'Brand compliance checks'],
    metrics: [{ label: 'Campaign ROI', target: '3.5x', current: '3.2x' }, { label: 'Brand consistency', target: '95%', current: '93%' }],
    learning: ['Marketing leadership path', 'Advanced SEO certification'],
    aiName: 'Creative Director AI',
    aiCapabilities: ['Brand compliance review', 'Campaign analytics', 'Creative brief generation'],
    evolutionStage: 'evolving',
  },
  {
    roleKey: 'bookkeeper',
    department: 'Finance',
    responsibilities: ['Maintain accurate books', 'Process payroll and AP/AR', 'Prepare monthly financial reports', 'Support tax filing preparation'],
    workflows: [{ label: 'Monthly close', frequency: 'monthly', steps: ['Reconcile accounts', 'Variance analysis', 'Prepare reports', 'Founder review'] }],
    authority: 'execute-routine',
    authorityScope: ['Routine transactions', 'Escalate anomalies and large expenditures'],
    skills: ['Bookkeeping & Financial Reporting', 'Regulatory Compliance'],
    brains: ['Finance', 'Bookkeeping'],
    documents: ['Chart of accounts', 'Close checklist', 'Payroll procedures'],
    automations: ['Reconciliation alerts', 'Variance notifications', 'Payroll reminders'],
    metrics: [{ label: 'Close timeliness', target: 'Day 5', current: 'Day 4' }],
    learning: ['Bookkeeping certification', 'Finance operations path'],
    aiName: 'Finance Assistant',
    aiCapabilities: ['Reconciliation support', 'Variance flagging', 'Report drafting'],
    evolutionStage: 'mature',
  },
  {
    roleKey: 'attorney',
    department: 'Legal',
    responsibilities: ['Review contracts and agreements', 'Advise on regulatory compliance', 'Manage legal risk exposure', 'Support dispute resolution'],
    workflows: [{ label: 'Contract review', frequency: 'as-needed', steps: ['Intake contract', 'Risk assessment', 'Markup/redline', 'Approval routing'] }],
    authority: 'advisory',
    authorityScope: ['Legal recommendations', 'Contract approval recommendations to founder'],
    skills: ['Regulatory Compliance', 'Executive Decision Architecture'],
    brains: ['Legal', 'Compliance'],
    documents: ['Contract templates', 'Legal risk register'],
    automations: ['Contract expiry alerts', 'Compliance deadline tracking'],
    metrics: [{ label: 'Contract turnaround', target: '3 days', current: '2.5 days' }],
    learning: ['Legal operations for SMB', 'Compliance updates'],
    aiName: 'Legal Research Assistant',
    aiCapabilities: ['Clause comparison', 'Risk flagging', 'Template population'],
    evolutionStage: 'defined',
  },
  {
    roleKey: 'stylist',
    department: 'Creative Services',
    responsibilities: ['Deliver client styling services', 'Maintain product knowledge', 'Build client relationships', 'Upsell complementary services'],
    workflows: [{ label: 'Client consultation', frequency: 'daily', steps: ['Consultation', 'Style recommendation', 'Service delivery', 'Follow-up booking'] }],
    authority: 'full-autonomy',
    authorityScope: ['Service delivery decisions', 'Product recommendations within guidelines'],
    skills: ['Brand Vision & Creative Direction', 'Customer Success'],
    brains: ['Creative', 'Client Experience'],
    documents: ['Style guide', 'Service menu', 'Product catalog'],
    automations: ['Appointment confirmations', 'Follow-up nurture', 'Review requests'],
    metrics: [{ label: 'Client satisfaction', target: '95%', current: '96%' }, { label: 'Rebooking rate', target: '70%', current: '72%' }],
    learning: ['Advanced styling certification', 'Client experience path'],
    aiName: 'Style Advisor',
    aiCapabilities: ['Product recommendations', 'Booking assistance', 'Follow-up scheduling'],
    evolutionStage: 'defined',
  },
];

function roleId(orgId: string, roleKey: string): string {
  return `role-${orgId}-${roleKey}`;
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

function mapPeopleToRoles(
  seed: RoleSeed,
  profProfiles: ReturnType<typeof getOrganizationProfessionalProfilesProfile>,
  identity: ReturnType<typeof getOrganizationIdentityGraphProfile>
): { count: number; names: string[]; titleGap: string | null } {
  const titleLower = ROLE_TEMPLATE_LABELS[seed.roleKey].toLowerCase();
  const deptLower = seed.department.toLowerCase();

  const matched = (profProfiles?.profiles ?? []).filter((p) => {
    const roleMatch = p.currentRole.toLowerCase().includes(titleLower.split(' ')[0] ?? '');
    const deptMatch = p.department.toLowerCase().includes(deptLower.split(' ')[0] ?? '');
    const workSignals = [
      ...p.skills,
      ...p.achievements,
      ...p.experience.flatMap((e) => [e.title, ...e.highlights]),
    ];
    const responsibilityOverlap = workSignals.some((signal) =>
      seed.responsibilities.some((sr) => signal.toLowerCase().includes(sr.toLowerCase().slice(0, 12)))
    );
    return roleMatch || deptMatch || responsibilityOverlap;
  });

  const names = matched.map((p) => p.displayName);
  if (names.length === 0) {
    const deptPeople = (identity?.people ?? []).filter((p) =>
      p.department.toLowerCase().includes(deptLower.split(' ')[0] ?? '')
    );
    return {
      count: deptPeople.length > 0 ? 1 : 0,
      names: deptPeople.slice(0, 1).map((p) => p.displayName),
      titleGap: deptPeople.length > 0 ? `Title "${deptPeople[0]?.role}" performs ${ROLE_TEMPLATE_LABELS[seed.roleKey]} work` : null,
    };
  }

  const titleGap = matched.find((p) => !p.currentRole.toLowerCase().includes(titleLower.split(' ')[0] ?? ''));
  return {
    count: matched.length,
    names,
    titleGap: titleGap ? `"${titleGap.currentRole}" title performs ${ROLE_TEMPLATE_LABELS[seed.roleKey]} responsibilities` : null,
  };
}

function enrichSkillsFromGraph(
  seed: RoleSeed,
  skillGraph: ReturnType<typeof getOrganizationSkillGraphProfile>
): string[] {
  const skills = [...seed.skills];
  for (const skillName of seed.skills) {
    const node = skillGraph?.skills.find((s) => s.name.toLowerCase().includes(skillName.toLowerCase().slice(0, 8)));
    if (node && !skills.includes(node.name)) skills.push(node.name);
  }
  return [...new Set(skills)];
}

function enrichAutomations(
  seed: RoleSeed,
  automation: ReturnType<typeof getOrganizationAutomationRegistryProfile>
): string[] {
  const deptAutomations = (automation?.automations ?? [])
    .filter((a) => a.department.toLowerCase().includes(seed.department.toLowerCase().split(' ')[0] ?? '') || a.status === 'active')
    .slice(0, 3)
    .map((a) => a.name);
  return [...new Set([...seed.automations, ...deptAutomations])].slice(0, 5);
}

function enrichDocuments(
  seed: RoleSeed,
  docs: ReturnType<typeof getOrganizationDocumentationRegistryProfile>
): string[] {
  const registryDocs = (docs?.registryEntries ?? [])
    .filter(
      (d) =>
        seed.documents.some((sd) => d.officialName.toLowerCase().includes(sd.toLowerCase().slice(0, 6))) ||
        d.associatedDepartments.some((dept) => dept.toLowerCase().includes(seed.department.toLowerCase().split(' ')[0] ?? ''))
    )
    .slice(0, 3)
    .map((d) => d.officialName);
  return [...new Set([...seed.documents, ...registryDocs])].slice(0, 5);
}

function buildEvolutionEvents(seed: RoleSeed, organizationId: string): RoleEvolutionEvent[] {
  const events: RoleEvolutionEvent[] = [
    {
      id: `evo-${organizationId}-${seed.roleKey}-defined`,
      stage: 'defined',
      stageLabel: ROLE_EVOLUTION_LABELS.defined,
      title: `${ROLE_TEMPLATE_LABELS[seed.roleKey]} role defined`,
      description: 'Initial role intelligence captured — responsibilities, workflows, and authority mapped.',
      occurredAt: monthsAgo(18),
      triggeredBy: 'organization-inauguration',
    },
  ];

  if (seed.evolutionStage === 'evolving' || seed.evolutionStage === 'splitting') {
    events.push({
      id: `evo-${organizationId}-${seed.roleKey}-evolve`,
      stage: 'evolving',
      stageLabel: ROLE_EVOLUTION_LABELS.evolving,
      title: `${ROLE_TEMPLATE_LABELS[seed.roleKey]} responsibilities expanding`,
      description: 'Organization growth triggered role evolution — new workflows and skills added.',
      occurredAt: monthsAgo(6),
      triggeredBy: 'organization-growth',
    });
  }

  if (seed.evolutionStage === 'mature') {
    events.push({
      id: `evo-${organizationId}-${seed.roleKey}-mature`,
      stage: 'mature',
      stageLabel: ROLE_EVOLUTION_LABELS.mature,
      title: `${ROLE_TEMPLATE_LABELS[seed.roleKey]} reached maturity`,
      description: 'Role fully instrumented — metrics, automations, AI counterparts, and learning paths active.',
      occurredAt: monthsAgo(3),
      triggeredBy: 'studio-intelligence',
    });
  }

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildRoleDefinition(
  organizationId: string,
  seed: RoleSeed,
  profProfiles: ReturnType<typeof getOrganizationProfessionalProfilesProfile>,
  identity: ReturnType<typeof getOrganizationIdentityGraphProfile>,
  skillGraph: ReturnType<typeof getOrganizationSkillGraphProfile>,
  brain: ReturnType<typeof getOrganizationProfessionBrainProfile>,
  automation: ReturnType<typeof getOrganizationAutomationRegistryProfile>,
  docs: ReturnType<typeof getOrganizationDocumentationRegistryProfile>,
  institute: ReturnType<typeof getOrganizationStudioInstituteProfile>
): OrganizationalRoleDefinition {
  const people = mapPeopleToRoles(seed, profProfiles, identity);
  const evolutionEvents = buildEvolutionEvents(seed, organizationId);

  const brainLabels = (brain?.brains ?? [])
    .filter((b) => seed.brains.some((sb) => b.label.toLowerCase().includes(sb.toLowerCase())))
    .map((b) => b.label);
  const relatedBrains = [...new Set([...seed.brains, ...brainLabels])];

  const learningReqs = [
    ...seed.learning,
    ...(institute?.certifications?.slice(0, 2).map((c) => c.name) ?? []),
  ];

  const dailyWorkflows: DailyWorkflow[] = seed.workflows.map((w, i) => ({
    id: `wf-${seed.roleKey}-${i}`,
    label: w.label,
    frequency: w.frequency,
    steps: w.steps,
    automationEligible: seed.automations.length > 0,
  }));

  const aiCounterparts: AiEmployeeCounterpart[] = [
    {
      id: `ai-${seed.roleKey}`,
      name: seed.aiName,
      capabilities: seed.aiCapabilities,
      handlesWorkflows: dailyWorkflows.map((w) => w.label),
      humanOversight: seed.authority === 'full-autonomy' ? 'Periodic review' : 'Approve before action',
    },
  ];

  const evolutionScore = Math.min(
    98,
    50 +
      evolutionEvents.length * 10 +
      dailyWorkflows.length * 5 +
      seed.metrics.length * 8 +
      (people.count > 0 ? 10 : 0)
  );

  return {
    id: roleId(organizationId, seed.roleKey),
    roleKey: seed.roleKey,
    title: ROLE_TEMPLATE_LABELS[seed.roleKey],
    displayTitle: ROLE_TEMPLATE_LABELS[seed.roleKey],
    department: seed.department,
    actualWorkSummary: seed.responsibilities.join(' · '),
    titleVsWorkGap: people.titleGap,
    peopleCount: people.count,
    peopleNames: people.names,
    responsibilities: seed.responsibilities,
    dailyWorkflows,
    decisionAuthority: seed.authority,
    decisionAuthorityLabel: DECISION_AUTHORITY_LABELS[seed.authority],
    authorityScope: seed.authorityScope,
    requiredSkills: enrichSkillsFromGraph(seed, skillGraph),
    relatedProfessionBrains: relatedBrains,
    requiredDocuments: enrichDocuments(seed, docs),
    requiredAutomations: enrichAutomations(seed, automation),
    performanceMetrics: seed.metrics.map((m, i) => ({
      id: `metric-${seed.roleKey}-${i}`,
      label: m.label,
      target: m.target,
      current: m.current,
      trend: 'stable' as const,
    })),
    learningRequirements: learningReqs,
    aiCounterparts,
    evolutionStage: seed.evolutionStage,
    evolutionStageLabel: ROLE_EVOLUTION_LABELS[seed.evolutionStage],
    evolutionScore,
    evolutionEvents,
    understandsWorkNotTitle: true,
  };
}

function buildInsights(roles: OrganizationalRoleDefinition[]): RoleIntelligenceInsight[] {
  const insights: RoleIntelligenceInsight[] = [];

  for (const role of roles.filter((r) => r.titleVsWorkGap)) {
    insights.push({
      id: `insight-gap-${role.roleKey}`,
      insight: role.titleVsWorkGap!,
      roleTitle: role.title,
      category: 'title-mismatch',
      severity: 'watch',
      recommendedAction: `Update role definition for ${role.title} to reflect actual responsibilities.`,
    });
  }

  const evolving = roles.filter((r) => r.evolutionStage === 'evolving' || r.evolutionStage === 'splitting');
  for (const role of evolving) {
    insights.push({
      id: `insight-evo-${role.roleKey}`,
      insight: `${role.title} is evolving — new responsibilities and workflows detected as organization grows.`,
      roleTitle: role.title,
      category: 'evolution',
      severity: 'info',
      recommendedAction: 'Review Role Evolution™ events and update learning requirements.',
    });
  }

  const marketing = roles.find((r) => r.roleKey === 'marketing-director');
  if (marketing && marketing.requiredSkills.some((s) => s.includes('SEO'))) {
    insights.push({
      id: 'insight-marketing-seo',
      insight: 'Marketing Director role requires Advanced SEO — verify skill coverage matches role definition.',
      roleTitle: 'Marketing Director',
      category: 'gap',
      severity: 'attention',
      recommendedAction: 'Cross-reference Skill Graph™ for SEO expertise gaps.',
    });
  }

  const dispatcher = roles.find((r) => r.roleKey === 'dispatcher');
  if (dispatcher && dispatcher.peopleCount >= 1) {
    insights.push({
      id: 'insight-dispatch-mentor',
      insight: 'Dispatcher role has mature workflows — strong candidate for mentoring new operations hires.',
      roleTitle: 'Dispatcher',
      category: 'learning',
      severity: 'info',
      recommendedAction: 'Assign dispatcher as operations onboarding mentor.',
    });
  }

  const noAutomation = roles.filter((r) => r.requiredAutomations.length < 2);
  if (noAutomation.length > 0) {
    insights.push({
      id: 'insight-automation',
      insight: `${noAutomation.length} roles have limited automation coverage — manual workflow burden may be high.`,
      roleTitle: 'Multiple roles',
      category: 'automation',
      severity: 'watch',
      recommendedAction: 'Register role workflows in Automation Registry™.',
    });
  }

  return insights;
}

function buildDomainStatuses(roles: OrganizationalRoleDefinition[]): RoleDomainStatus[] {
  const totalResp = roles.reduce((s, r) => s + r.responsibilities.length, 0);
  const totalWf = roles.reduce((s, r) => s + r.dailyWorkflows.length, 0);
  const totalAuth = roles.filter((r) => r.decisionAuthority !== 'advisory').length;
  const totalSkills = roles.reduce((s, r) => s + r.requiredSkills.length, 0);
  const totalEvo = roles.reduce((s, r) => s + r.evolutionEvents.length, 0);
  const totalAi = roles.reduce((s, r) => s + r.aiCounterparts.length, 0);

  const scores: Record<(typeof ROLE_INTELLIGENCE_DOMAINS)[number], { count: number; score: number; summary: string }> = {
    responsibilities: { count: totalResp, score: Math.min(96, 40 + totalResp * 2), summary: `${totalResp} responsibilities mapped across ${roles.length} roles — actual work, not titles.` },
    workflows: { count: totalWf, score: Math.min(94, 45 + totalWf * 6), summary: `${totalWf} daily workflows instrumented per role definition.` },
    authority: { count: totalAuth, score: Math.min(92, 50 + totalAuth * 8), summary: `${totalAuth} roles with defined decision authority scopes.` },
    skills: { count: totalSkills, score: Math.min(90, 40 + totalSkills * 2), summary: 'Required skills linked to Skill Graph™ per role.' },
    evolution: { count: totalEvo, score: Math.min(88, 35 + totalEvo * 5), summary: `Role Evolution™ — ${totalEvo} evolution events tracked as organization grows.` },
    'ai-counterparts': { count: totalAi, score: Math.min(95, 50 + totalAi * 10), summary: `${totalAi} AI Employee counterparts mapped to role workflows.` },
  };

  return ROLE_INTELLIGENCE_DOMAINS.map((domain) => ({
    domain,
    label: ROLE_DOMAIN_LABELS[domain],
    score: scores[domain].score,
    count: scores[domain].count,
    summary: scores[domain].summary,
  }));
}

export function computeIntelligenceScore(domains: RoleDomainStatus[], roles: OrganizationalRoleDefinition[]): number {
  const avgDomain = domains.reduce((s, d) => s + d.score, 0) / Math.max(1, domains.length);
  const avgEvolution = roles.reduce((s, r) => s + r.evolutionScore, 0) / Math.max(1, roles.length);
  return Math.min(98, Math.round(avgDomain * 0.55 + avgEvolution * 0.45));
}

export function buildDockRoleLine(profile: OrganizationRoleIntelligenceProfile): string {
  const gap = profile.titleWorkGaps > 0
    ? `${profile.titleWorkGaps} title/work gaps detected`
    : 'titles aligned with actual work';
  return `${profile.rolesDefined} roles defined · ${profile.peopleMapped} people mapped · ${gap} — Studio OS understands work, not titles.`;
}

export function buildOrganizationRoleIntelligenceProfile(organizationId: string): OrganizationRoleIntelligenceProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const identity = getOrganizationIdentityGraphProfile(organizationId);
  const profProfiles = getOrganizationProfessionalProfilesProfile(organizationId);
  const skillGraph = getOrganizationSkillGraphProfile(organizationId);
  const automation = getOrganizationAutomationRegistryProfile(organizationId);
  const docs = getOrganizationDocumentationRegistryProfile(organizationId);
  const institute = getOrganizationStudioInstituteProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const roles = ROLE_SEEDS.map((seed) =>
    buildRoleDefinition(organizationId, seed, profProfiles, identity, skillGraph, brain, automation, docs, institute)
  );

  const insights = buildInsights(roles);
  const domainStatuses = buildDomainStatuses(roles);

  const registry: OrganizationRoleIntelligenceProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    intelligenceScore: 0,
    rolesDefined: roles.length,
    peopleMapped: roles.reduce((s, r) => s + r.peopleCount, 0),
    evolutionEventsTotal: roles.reduce((s, r) => s + r.evolutionEvents.length, 0),
    titleWorkGaps: roles.filter((r) => r.titleVsWorkGap).length,
    aiCounterpartsActive: roles.reduce((s, r) => s + r.aiCounterparts.length, 0),
    roles,
    insights,
    domainStatuses,
    selectedRoleId: roles.find((r) => r.roleKey === 'project-manager')?.id ?? roles[0]?.id ?? null,
    dockRoleLine: '',
    workNotTitles: true,
    syncedSources: [
      'identity-graph',
      'professional-profile',
      'skill-graph',
      'profession-brain',
      'automation-registry',
      'documentation-registry',
      'studio-institute',
    ],
    lastSyncedAt: now,
  };

  registry.intelligenceScore = computeIntelligenceScore(domainStatuses, roles);
  registry.dockRoleLine = buildDockRoleLine(registry);
  return registry;
}

export function summarizeRoleIntelligence(profile: OrganizationRoleIntelligenceProfile): string {
  return [
    profile.dockRoleLine,
    `${profile.rolesDefined} roles · ${profile.evolutionEventsTotal} evolution events · intelligence ${profile.intelligenceScore}%.`,
    'Role Intelligence™ — understand work, not titles. Role Evolution™ keeps definitions current.',
  ].join(' ');
}

export function getSelectedRole(profile: OrganizationRoleIntelligenceProfile) {
  return profile.roles.find((r) => r.id === profile.selectedRoleId) ?? profile.roles[0] ?? null;
}

export function explainRoleById(roleId: string, profile: OrganizationRoleIntelligenceProfile): string | null {
  const role = profile.roles.find((r) => r.id === roleId);
  if (!role) return null;
  return [
    `${role.title} — ${role.department}`,
    `Work: ${role.actualWorkSummary}`,
    `${role.responsibilities.length} responsibilities · ${role.dailyWorkflows.length} workflows`,
    `Authority: ${role.decisionAuthorityLabel} (${role.authorityScope.join('; ')})`,
    `Skills: ${role.requiredSkills.join(', ')}`,
    `Brains: ${role.relatedProfessionBrains.join(', ')}`,
    role.titleVsWorkGap ? `Title gap: ${role.titleVsWorkGap}` : 'Title aligned with work',
    `Evolution: ${role.evolutionStageLabel} (${role.evolutionEvents.length} events)`,
    role.aiCounterparts.length ? `AI counterparts: ${role.aiCounterparts.map((a) => a.name).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}
