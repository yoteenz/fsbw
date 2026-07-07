import { getOrganizationIdentityGraphProfile } from '../identity-graph/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationProfessionalProfilesProfile } from '../professional-profile/store';
import { getOrganizationStudioInstituteProfile } from '../studio-institute/org-store';
import {
  SKILL_CATEGORY_LABELS,
  SKILL_GRAPH_DOMAIN_LABELS,
  SKILL_GRAPH_DOMAINS,
  SKILL_RELATIONSHIP_LABELS,
} from './constants';
import type {
  DepartmentSkillSummary,
  OrganizationSkillGraphProfile,
  OrganizationalSkillNode,
  SkillGraphDomainStatus,
  SkillHolder,
  SkillIntelligenceInsight,
  SkillRelationshipEdge,
  SkillCategory,
  ProficiencyLevel,
} from './types';

type SkillSeed = {
  name: string;
  category: SkillCategory;
  description: string;
  demandScore: number;
  defaultProficiency?: ProficiencyLevel;
};

const CORE_SKILL_SEEDS: SkillSeed[] = [
  { name: 'Studio OS Governance', category: 'technical', description: 'Platform administration and organizational intelligence systems.', demandScore: 85 },
  { name: 'Profession Brain™ Stewardship', category: 'technical', description: 'Encoding and evolving institutional expertise in living brains.', demandScore: 90 },
  { name: 'Organizational Intelligence', category: 'industry', description: 'Cross-system awareness of organizational health and capability.', demandScore: 88 },
  { name: 'Executive Decision Architecture', category: 'leadership', description: 'Strategic judgment, approval workflows, and founder alignment.', demandScore: 92 },
  { name: 'Brand Vision & Creative Direction', category: 'creative', description: 'Visual identity, campaign creative, and brand consistency.', demandScore: 78 },
  { name: 'Operations Coordination', category: 'operational', description: 'Day-to-day operational delivery and vendor coordination.', demandScore: 80 },
  { name: 'AI Prompt Engineering', category: 'ai', description: 'Structured prompts, registry governance, and AI behavior design.', demandScore: 95 },
  { name: 'Concierge Communication', category: 'communication', description: 'Executive briefing style, async updates, and stakeholder tone.', demandScore: 75 },
  { name: 'Team Management', category: 'management', description: 'Department leadership, accountability, and cross-functional delivery.', demandScore: 82 },
  { name: 'Revenue Development', category: 'sales', description: 'Pipeline growth, client relationships, and conversion strategy.', demandScore: 70 },
  { name: 'Digital Marketing', category: 'marketing', description: 'Campaign orchestration, audience targeting, and channel strategy.', demandScore: 88 },
  { name: 'Advanced SEO', category: 'marketing', description: 'Search optimization, content strategy, and organic growth mechanics.', demandScore: 92 },
  { name: 'Bookkeeping & Financial Reporting', category: 'finance', description: 'Monthly close, variance analysis, and payroll summaries.', demandScore: 85 },
  { name: 'Regulatory Compliance', category: 'compliance', description: 'Policy adherence, audit readiness, and governance documentation.', demandScore: 78 },
  { name: 'Safety Certification', category: 'certifications', description: 'Workplace safety protocols and certified specialist oversight.', demandScore: 70 },
  { name: 'English (Professional)', category: 'languages', description: 'Executive communication and documentation fluency.', demandScore: 60 },
  { name: 'Design Token Systems', category: 'software', description: 'Figma-to-code token pipelines and visual consistency tooling.', demandScore: 72 },
  { name: 'Asset Factory Equipment', category: 'equipment', description: 'Production tooling, factory workflows, and job orchestration.', demandScore: 65 },
  { name: 'Fuel Tax Operations', category: 'industry', description: 'Industry-specific compliance and operational tax workflows.', demandScore: 55 },
  { name: 'Customer Success', category: 'sales', description: 'Client retention, renewal briefs, and relationship-first updates.', demandScore: 76 },
];

function skillId(orgId: string, name: string): string {
  return `skill-${orgId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function categorizeSkill(raw: string): SkillCategory {
  const lower = raw.toLowerCase();
  if (/seo|marketing|campaign|brand|creative/.test(lower)) return 'marketing';
  if (/finance|bookkeep|payroll|budget/.test(lower)) return 'finance';
  if (/leadership|executive|founder|ceo|mentor/.test(lower)) return 'leadership';
  if (/ai|prompt|machine|intelligence/.test(lower)) return 'ai';
  if (/compliance|regulat|safety|audit/.test(lower)) return 'compliance';
  if (/communicat|briefing|writing/.test(lower)) return 'communication';
  if (/operat|dispatch|inventory|vendor/.test(lower)) return 'operational';
  if (/software|token|figma|code/.test(lower)) return 'software';
  if (/certif/.test(lower)) return 'certifications';
  if (/language|english|spanish/.test(lower)) return 'languages';
  if (/equipment|factory|production/.test(lower)) return 'equipment';
  if (/sales|revenue|client|customer/.test(lower)) return 'sales';
  if (/manag|team|department/.test(lower)) return 'management';
  if (/design|visual|creative/.test(lower)) return 'creative';
  if (/industry|domain|sector/.test(lower)) return 'industry';
  return 'technical';
}

function proficiencyFromScore(score: number): ProficiencyLevel {
  if (score >= 85) return 'expert';
  if (score >= 70) return 'proficient';
  if (score >= 50) return 'developing';
  return 'learning';
}

function buildHoldersForSkill(
  skillName: string,
  orgProfiles: ReturnType<typeof getOrganizationProfessionalProfilesProfile>
): SkillHolder[] {
  const holders: SkillHolder[] = [];
  const lower = skillName.toLowerCase();

  for (const profile of orgProfiles?.profiles ?? []) {
    const matched = profile.skills.some((s) => s.toLowerCase().includes(lower) || lower.includes(s.toLowerCase()));
    const brainMatch = profile.professionBrains.some((b) => b.label.toLowerCase().includes(lower.split(' ')[0] ?? ''));
    if (!matched && !brainMatch && !profile.skills.join(' ').toLowerCase().includes(lower.split(' ')[0] ?? '')) {
      continue;
    }

    const score = Math.min(98, profile.evolutionScore + (profile.professionBrains.length > 0 ? 5 : 0));
    const proficiency = proficiencyFromScore(score);

    holders.push({
      personId: profile.personId,
      personName: profile.displayName,
      department: profile.department,
      proficiency,
      proficiencyScore: score,
      canTeach: proficiency === 'expert' || proficiency === 'proficient',
      needsHelp: proficiency === 'learning',
    });
  }

  return holders;
}

function buildSkillNodes(organizationId: string): OrganizationalSkillNode[] {
  const profProfiles = getOrganizationProfessionalProfilesProfile(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const institute = getOrganizationStudioInstituteProfile(organizationId);

  const skillMap = new Map<string, SkillSeed>();

  for (const seed of CORE_SKILL_SEEDS) {
    skillMap.set(seed.name, seed);
  }

  for (const profile of profProfiles?.profiles ?? []) {
    for (const skill of profile.skills) {
      if (!skillMap.has(skill)) {
        skillMap.set(skill, {
          name: skill,
          category: categorizeSkill(skill),
          description: `Organizational capability — ${skill}.`,
          demandScore: 60,
        });
      }
    }
  }

  for (const brainNode of brain?.brains ?? []) {
    const name = `${brainNode.label} Expertise`;
    if (!skillMap.has(name)) {
      skillMap.set(name, {
        name,
        category: 'industry',
        description: `Profession Brain™ domain — ${brainNode.label}.`,
        demandScore: 70 + Math.round(brainNode.maturityPct / 5),
      });
    }
  }

  for (const cert of institute?.certifications ?? []) {
    if (!skillMap.has(cert.name)) {
      skillMap.set(cert.name, {
        name: cert.name,
        category: 'certifications',
        description: cert.requirement,
        demandScore: cert.status === 'earned' ? 50 : 75,
      });
    }
  }

  const nodes: OrganizationalSkillNode[] = [];

  for (const [name, seed] of skillMap) {
    const holders = buildHoldersForSkill(name, profProfiles);
    const expertCount = holders.filter((h) => h.proficiency === 'expert').length;
    const mentorCount = holders.filter((h) => h.canTeach).length;
    const learnersNeeded = holders.filter((h) => h.needsHelp).length;
    const holderCount = holders.length;

    let gapSeverity: OrganizationalSkillNode['gapSeverity'] = 'none';
    if (holderCount === 0 && seed.demandScore >= 80) gapSeverity = 'critical';
    else if (holderCount === 0) gapSeverity = 'gap';
    else if (expertCount === 0 && seed.demandScore >= 75) gapSeverity = 'watch';
    else if (mentorCount === 0 && holderCount > 0) gapSeverity = 'watch';

    const supplyScore = Math.min(98, holderCount * 20 + expertCount * 15 + mentorCount * 10);

    nodes.push({
      id: skillId(organizationId, name),
      name,
      category: seed.category,
      categoryLabel: SKILL_CATEGORY_LABELS[seed.category],
      description: seed.description,
      holders,
      holderCount,
      expertCount,
      mentorCount,
      learnersNeeded,
      demandScore: seed.demandScore,
      supplyScore,
      gapSeverity,
      searchableAsset: true,
    });
  }

  return nodes.sort((a, b) => b.demandScore - a.demandScore);
}

function buildSkillRelationships(skills: OrganizationalSkillNode[]): SkillRelationshipEdge[] {
  const edges: SkillRelationshipEdge[] = [];
  const byName = new Map(skills.map((s) => [s.name, s]));

  const addEdge = (
    from: OrganizationalSkillNode,
    to: OrganizationalSkillNode,
    type: SkillRelationshipEdge['relationshipType'],
    summary: string,
    strength: number
  ) => {
    edges.push({
      id: `rel-${from.id}-${to.id}-${type}`,
      fromSkillId: from.id,
      fromSkillName: from.name,
      toSkillId: to.id,
      toSkillName: to.name,
      relationshipType: type,
      relationshipTypeLabel: SKILL_RELATIONSHIP_LABELS[type],
      summary,
      strength,
    });
  };

  const pairs: [string, string, SkillRelationshipEdge['relationshipType'], string, number][] = [
    ['Digital Marketing', 'Advanced SEO', 'requires', 'Advanced SEO requires digital marketing foundation.', 85],
    ['Digital Marketing', 'Brand Vision & Creative Direction', 'complements', 'Marketing and creative direction reinforce campaign quality.', 78],
    ['AI Prompt Engineering', 'Profession Brain™ Stewardship', 'complements', 'AI skills complement Profession Brain™ encoding workflows.', 82],
    ['Bookkeeping & Financial Reporting', 'Regulatory Compliance', 'complements', 'Finance and compliance operate as paired organizational capabilities.', 75],
    ['Advanced SEO', 'Digital Marketing', 'highly-demanded', 'Advanced SEO expertise is highly demanded across growth initiatives.', 92],
    ['AI Prompt Engineering', 'Studio OS Governance', 'highly-demanded', 'AI prompt skills are highly demanded as organizational intelligence expands.', 95],
    ['Fuel Tax Operations', 'Bookkeeping & Financial Reporting', 'requires', 'Industry tax operations require bookkeeping proficiency.', 70],
    ['Safety Certification', 'Regulatory Compliance', 'complements', 'Safety certification complements compliance oversight.', 68],
    ['Design Token Systems', 'Brand Vision & Creative Direction', 'complements', 'Software design tokens complement creative direction systems.', 72],
    ['Fuel Tax Operations', 'Regulatory Compliance', 'becoming-outdated', 'Legacy manual tax workflows becoming outdated — automation recommended.', 55],
  ];

  for (const [fromName, toName, type, summary, strength] of pairs) {
    const from = byName.get(fromName);
    const to = byName.get(toName);
    if (from && to) addEdge(from, to, type, summary, strength);
  }

  return edges;
}

function buildInsights(skills: OrganizationalSkillNode[], departments: string[]): SkillIntelligenceInsight[] {
  const insights: SkillIntelligenceInsight[] = [];

  const seo = skills.find((s) => s.name === 'Advanced SEO');
  if (seo && seo.gapSeverity !== 'none') {
    insights.push({
      id: 'insight-seo-gap',
      insight: 'The marketing department lacks advanced SEO expertise.',
      category: 'gap',
      department: 'Marketing',
      skillName: 'Advanced SEO',
      severity: seo.gapSeverity === 'critical' ? 'urgent' : 'attention',
      recommendedAction: 'Assign SEO training path or engage Expert Marketplace™ specialist.',
    });
  }

  const bookkeeping = skills.find((s) => s.name.includes('Bookkeeping'));
  if (bookkeeping && bookkeeping.mentorCount >= 2) {
    const mentors = bookkeeping.holders.filter((h) => h.canTeach).map((h) => h.personName);
    insights.push({
      id: 'insight-bookkeeping-mentors',
      insight: `${mentors.length} employees could mentor new hires in bookkeeping.`,
      category: 'mentorship',
      department: 'Finance',
      skillName: bookkeeping.name,
      severity: 'info',
      recommendedAction: `Pair new hires with ${mentors.slice(0, 3).join(', ')} for structured mentorship.`,
    });
  }

  const safety = skills.find((s) => s.name === 'Safety Certification');
  if (safety && safety.expertCount === 0) {
    insights.push({
      id: 'insight-safety-gap',
      insight: 'Your organization has no certified safety specialist.',
      category: 'certification',
      department: 'Operations',
      skillName: 'Safety Certification',
      severity: 'urgent',
      recommendedAction: 'Initiate safety certification track through Studio Institute™.',
    });
  }

  const aiSkill = skills.find((s) => s.name === 'AI Prompt Engineering');
  if (aiSkill && aiSkill.demandScore >= 90) {
    insights.push({
      id: 'insight-ai-demand',
      insight: 'AI Prompt Engineering is highly demanded — limited mentor capacity relative to organizational need.',
      category: 'demand',
      skillName: 'AI Prompt Engineering',
      severity: 'watch',
      recommendedAction: 'Expand AI skills academy path and cross-department collaboration pairs.',
    });
  }

  const fuelTax = skills.find((s) => s.name === 'Fuel Tax Operations');
  if (fuelTax) {
    insights.push({
      id: 'insight-fuel-outdated',
      insight: 'Fuel Tax Operations workflows are becoming outdated — automation and Profession Brain™ encoding recommended.',
      category: 'outdated',
      skillName: 'Fuel Tax Operations',
      severity: 'watch',
      recommendedAction: 'Review Profession Brain™ for modernization opportunities.',
    });
  }

  for (const dept of departments.slice(0, 3)) {
    const deptSkills = skills.filter((s) => s.holders.some((h) => h.department === dept));
    const gaps = deptSkills.filter((s) => s.gapSeverity === 'gap' || s.gapSeverity === 'critical');
    if (gaps.length === 0 && deptSkills.length >= 2) {
      const experts = deptSkills.flatMap((s) => s.holders.filter((h) => h.canTeach && h.department === dept));
      if (experts.length >= 2) {
        insights.push({
          id: `insight-collab-${dept}`,
          insight: `${dept} has ${experts.length} teaching-capable members — strong collaboration potential for cross-training.`,
          category: 'collaboration',
          department: dept,
          severity: 'info',
          recommendedAction: `Form ${dept} skill circle for peer mentorship.`,
        });
      }
    }
  }

  return insights;
}

function buildDepartmentSummaries(skills: OrganizationalSkillNode[]): DepartmentSkillSummary[] {
  const deptSet = new Set<string>();
  for (const s of skills) {
    for (const h of s.holders) deptSet.add(h.department);
  }

  return [...deptSet].map((department) => {
    const deptSkills = skills.filter((s) => s.holders.some((h) => h.department === department));
    const expertCount = deptSkills.reduce((n, s) => n + s.holders.filter((h) => h.department === department && h.proficiency === 'expert').length, 0);
    const gapCount = deptSkills.filter((s) => s.gapSeverity !== 'none' && s.holders.every((h) => h.department !== department || h.proficiency === 'learning')).length;
    const missingSkills = deptSkills.filter((s) => s.holderCount === 0).map((s) => s.name).slice(0, 3);

    return {
      department,
      skillCount: deptSkills.length,
      expertCount,
      gapCount,
      topSkills: deptSkills.sort((a, b) => b.demandScore - a.demandScore).slice(0, 4).map((s) => s.name),
      missingSkills,
    };
  });
}

function buildDomainStatuses(
  skills: OrganizationalSkillNode[],
  insights: SkillIntelligenceInsight[],
  relationships: SkillRelationshipEdge[]
): SkillGraphDomainStatus[] {
  const mentors = skills.reduce((s, sk) => s + sk.mentorCount, 0);
  const gaps = skills.filter((s) => s.gapSeverity === 'gap' || s.gapSeverity === 'critical').length;
  const demanded = relationships.filter((r) => r.relationshipType === 'highly-demanded').length;
  const collab = insights.filter((i) => i.category === 'collaboration').length;

  const scores: Record<(typeof SKILL_GRAPH_DOMAINS)[number], { count: number; score: number; summary: string }> = {
    coverage: { count: skills.length, score: Math.min(96, 40 + skills.length * 3), summary: `${skills.length} skills tracked across ${new Set(skills.map((s) => s.category)).size} categories.` },
    mentorship: { count: mentors, score: Math.min(94, 35 + mentors * 5), summary: `${mentors} people can teach organizational skills.` },
    gaps: { count: gaps, score: Math.min(92, 90 - gaps * 8), summary: `${gaps} skill gaps detected — Studio Intelligence™ surfacing invisible knowledge needs.` },
    demand: { count: demanded, score: Math.min(90, 50 + demanded * 12), summary: `${demanded} highly demanded skill relationships mapped.` },
    collaboration: { count: collab, score: Math.min(88, 45 + collab * 10), summary: `${collab} collaboration opportunities identified across departments.` },
    visibility: { count: skills.filter((s) => s.holderCount > 0).length, score: Math.min(98, 50 + skills.filter((s) => s.holderCount > 0).length * 4), summary: 'Skills indexed as searchable organizational assets — knowledge no longer invisible.' },
  };

  return SKILL_GRAPH_DOMAINS.map((domain) => ({
    domain,
    label: SKILL_GRAPH_DOMAIN_LABELS[domain],
    score: scores[domain].score,
    count: scores[domain].count,
    summary: scores[domain].summary,
  }));
}

export function computeSkillGraphScore(domains: SkillGraphDomainStatus[], skills: OrganizationalSkillNode[]): number {
  const avgDomain = domains.reduce((s, d) => s + d.score, 0) / Math.max(1, domains.length);
  const visibility = skills.filter((s) => s.holderCount > 0).length / Math.max(1, skills.length);
  return Math.min(98, Math.round(avgDomain * 0.65 + visibility * 35));
}

export function buildDockSkillLine(profile: OrganizationSkillGraphProfile): string {
  const topInsight = profile.insights[0];
  if (topInsight) {
    return `${profile.skillsTracked} skills mapped · ${profile.mentorsAvailable} mentors · ${profile.gapsDetected} gaps — ${topInsight.insight}`;
  }
  return `${profile.skillsTracked} searchable skill assets — who knows what, who can teach, who needs help.`;
}

export function buildOrganizationSkillGraphProfile(organizationId: string): OrganizationSkillGraphProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const identity = getOrganizationIdentityGraphProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const skills = buildSkillNodes(organizationId);
  const relationships = buildSkillRelationships(skills);
  const departments = [...new Set(identity?.people.map((p) => p.department) ?? ['Executive', 'Operations', 'Marketing', 'Finance'])];
  const insights = buildInsights(skills, departments);
  const departmentSummaries = buildDepartmentSummaries(skills);
  const domainStatuses = buildDomainStatuses(skills, insights, relationships);

  const registry: OrganizationSkillGraphProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    graphScore: 0,
    skillsTracked: skills.length,
    categoriesRepresented: new Set(skills.map((s) => s.category)).size,
    mentorsAvailable: skills.reduce((s, sk) => s + sk.mentorCount, 0),
    gapsDetected: skills.filter((s) => s.gapSeverity === 'gap' || s.gapSeverity === 'critical').length,
    highlyDemandedSkills: relationships.filter((r) => r.relationshipType === 'highly-demanded').length,
    skills,
    relationships,
    insights,
    departmentSummaries,
    domainStatuses,
    selectedSkillId: skills.find((s) => s.demandScore >= 90)?.id ?? skills[0]?.id ?? null,
    dockSkillLine: '',
    searchableOrganizationalAssets: true,
    syncedSources: ['professional-profile', 'identity-graph', 'profession-brain', 'studio-institute'],
    lastSyncedAt: now,
  };

  registry.graphScore = computeSkillGraphScore(domainStatuses, skills);
  registry.dockSkillLine = buildDockSkillLine(registry);
  return registry;
}

export function summarizeSkillGraph(profile: OrganizationSkillGraphProfile): string {
  return [
    profile.dockSkillLine,
    `${profile.skillsTracked} skills · ${profile.mentorsAvailable} mentors · ${profile.gapsDetected} gaps · graph ${profile.graphScore}%.`,
    'Skill Graph™ — searchable organizational assets. Knowledge no longer invisible.',
  ].join(' ');
}

export function getSelectedSkill(profile: OrganizationSkillGraphProfile) {
  return profile.skills.find((s) => s.id === profile.selectedSkillId) ?? profile.skills[0] ?? null;
}
