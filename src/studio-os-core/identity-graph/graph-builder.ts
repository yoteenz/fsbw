import { getOrganizationCrossOrgIntelligenceProfile } from '../cross-organization-intelligence/store';
import { getOrganizationExpertMarketplaceProfile } from '../expert-marketplace/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import { getOrganizationWisdomProfile } from '../wisdom-capture/store';
import {
  IDENTITY_GRAPH_DOMAIN_LABELS,
  IDENTITY_GRAPH_DOMAINS,
  IDENTITY_TYPE_LABELS,
  IDENTITY_TYPES,
  RELATIONSHIP_EDGE_LABELS,
} from './constants';
import type {
  IdentityGraphCluster,
  IdentityGraphDomainStatus,
  IdentityPersonProfile,
  IdentityRelationshipEdge,
  IdentityType,
  OrganizationIdentityGraphProfile,
  PermissionLevel,
  RelationshipEdgeType,
} from './types';

function personId(orgId: string, slug: string): string {
  return `identity-${orgId}-${slug}`;
}

function buildFounderPerson(organizationId: string, companyName: string): IdentityPersonProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const rel = getOrganizationRelationshipMemoryProfile(organizationId);
  const founderPrefs = rel?.founderPreferences ?? [];

  return {
    id: personId(organizationId, 'founder'),
    displayName: 'Founder',
    identityType: 'founder',
    identityTypeLabel: IDENTITY_TYPE_LABELS.founder,
    personalSummary: `Founding leader of ${companyName} — sets vision, approves strategic decisions, and shapes organizational culture.`,
    organizationSummary: `${companyName} was built around founder judgment encoded in Profession Brain™ and organizational memory.`,
    department: 'Executive',
    role: 'Founder & CEO',
    skills: ['Leadership', 'Strategy', 'Brand Vision', 'Decision Architecture'],
    expertise: brain?.industryId ? [`${brain.industryId} operations`, 'Organizational design', 'Studio OS governance'] : ['Organizational design', 'Studio OS governance'],
    responsibilities: [
      'Set organizational direction and approve major decisions',
      'Protect brand, trust, and operational excellence',
      'Encode judgment into Profession Brain™ and institutional memory',
    ],
    projects: ['Studio OS Headquarters', 'Profession Brain™ institutionalization', 'Mission Control oversight'],
    knowledgeContributions: [
      {
        id: 'kc-founder-brain',
        title: 'Profession Brain™ judgment encoding',
        type: 'brain-entry',
        contributedAt: new Date().toISOString(),
        impactSummary: 'Founder decision patterns preserved for organizational continuity.',
      },
    ],
    achievements: [
      { id: 'ach-founder-1', title: 'Founded organization', achievedAt: new Date().toISOString(), category: 'leadership' },
    ],
    communicationPreferences: founderPrefs
      .filter((p) => p.type === 'communication-style' || p.type === 'reporting-formats')
      .map((p) => p.learnedPreference)
      .slice(0, 3)
      .concat(['Executive briefings with context before detail']),
    lifeCulturePreferences: [
      { id: 'lcp-founder-1', category: 'Work rhythm', preference: 'Deep focus blocks protected — interruptions only for urgent trust issues.', source: 'observed' },
      { id: 'lcp-founder-2', category: 'Decision style', preference: 'Recommend before changing — explain before acting.', source: 'declared' },
    ],
    learningHistory: [
      { id: 'lh-founder-1', title: 'Studio OS organizational intelligence', completedAt: new Date().toISOString(), outcome: 'Active practitioner', source: 'studio-institute' },
    ],
    permissions: 'owner',
    goals: ['Build an organization that outlasts any single person', 'Make Studio OS worthy of daily trust'],
    professionalInterests: ['Organizational intelligence', 'Institutional memory', 'Executive systems'],
    trustScore: 100,
    relationshipCount: 0,
    lastActiveAt: new Date().toISOString(),
    firstClassCitizen: true,
  };
}

function mapEntityToIdentityType(entityType: string): IdentityType {
  const map: Record<string, IdentityType> = {
    employees: 'employee',
    clients: 'customer',
    partners: 'partner',
    suppliers: 'vendor',
    departments: 'employee',
  };
  return map[entityType] ?? 'partner';
}

function buildPersonFromRelationship(
  organizationId: string,
  entity: {
    id: string;
    entityType: string;
    entityName: string;
    preferredCommunication: string;
    meetingCadence: string;
    approvalWorkflow: string;
    recurringRequests: string[];
    interactionCount: number;
  }
): IdentityPersonProfile {
  const identityType = mapEntityToIdentityType(entity.entityType);
  const isDept = entity.entityType === 'departments';

  return {
    id: personId(organizationId, entity.id.replace(`rel-${organizationId}-`, '')),
    displayName: entity.entityName,
    identityType: isDept ? 'employee' : identityType,
    identityTypeLabel: isDept ? 'Department Lead' : IDENTITY_TYPE_LABELS[identityType],
    personalSummary: isDept
      ? `${entity.entityName} department — functional area with recurring operational rhythms.`
      : `Professional relationship with ${entity.entityName} — tracked through Relationship Memory™.`,
    organizationSummary: entity.approvalWorkflow,
    department: isDept ? entity.entityName : entity.entityType === 'employees' ? 'Operations' : 'External',
    role: isDept ? `${entity.entityName} Lead` : entity.entityName,
    skills: entity.recurringRequests.slice(0, 3),
    expertise: entity.recurringRequests,
    responsibilities: [entity.approvalWorkflow, ...entity.recurringRequests.slice(0, 2)],
    projects: entity.recurringRequests.map((r, i) => `${r} initiative ${i + 1}`).slice(0, 3),
    knowledgeContributions: [],
    achievements: [],
    communicationPreferences: [entity.preferredCommunication, entity.meetingCadence],
    lifeCulturePreferences: [
      {
        id: `lcp-${entity.id}`,
        category: 'Communication',
        preference: entity.preferredCommunication,
        source: 'observed',
      },
    ],
    learningHistory: [],
    permissions: identityType === 'customer' || identityType === 'vendor' ? 'guest' : ('contributor' as PermissionLevel),
    goals: entity.recurringRequests.slice(0, 2),
    professionalInterests: entity.recurringRequests,
    trustScore: Math.min(95, 50 + entity.interactionCount),
    relationshipCount: 0,
    lastActiveAt: new Date().toISOString(),
    firstClassCitizen: true,
  };
}

function buildNetworkPerson(
  organizationId: string,
  member: { id: string; organizationName: string; relationship: string; networkType: string; sharedCapabilities: string[]; trustLevel: string },
  identityType: IdentityType
): IdentityPersonProfile {
  return {
    id: personId(organizationId, `network-${member.id}`),
    displayName: member.organizationName,
    identityType,
    identityTypeLabel: IDENTITY_TYPE_LABELS[identityType],
    personalSummary: `${member.organizationName} — ${member.relationship}`,
    organizationSummary: `Connected via Cross-Organization Intelligence™ · ${member.networkType}`,
    department: 'External Network',
    role: identityType === 'customer' ? 'Client Organization' : identityType === 'partner' ? 'Strategic Partner' : 'Network Contact',
    skills: member.sharedCapabilities,
    expertise: member.sharedCapabilities,
    responsibilities: [`Maintain ${member.relationship.toLowerCase()} with ${member.organizationName}`],
    projects: member.sharedCapabilities.slice(0, 2).map((c) => `${c} collaboration`),
    knowledgeContributions: [],
    achievements: [],
    communicationPreferences: ['Professional tone · permission-based collaboration'],
    lifeCulturePreferences: [],
    learningHistory: [],
    permissions: 'viewer' as PermissionLevel,
    goals: member.sharedCapabilities.slice(0, 2),
    professionalInterests: member.sharedCapabilities,
    trustScore: member.trustLevel === 'trusted' ? 88 : member.trustLevel === 'verified' ? 72 : 55,
    relationshipCount: 0,
    lastActiveAt: new Date().toISOString(),
    firstClassCitizen: true,
  };
}

function buildExpertPerson(
  organizationId: string,
  expert: { id: string; name: string; specialty: string; trustScore: number }
): IdentityPersonProfile {
  return {
    id: personId(organizationId, `expert-${expert.id}`),
    displayName: expert.name,
    identityType: 'expert',
    identityTypeLabel: IDENTITY_TYPE_LABELS.expert,
    personalSummary: `${expert.name} — ${expert.specialty} expert available through Expert Marketplace™.`,
    organizationSummary: 'External expertise engaged through governed marketplace protocols.',
    department: 'Expert Network',
    role: expert.specialty,
    skills: [expert.specialty, 'Advisory', 'Domain expertise'],
    expertise: [expert.specialty],
    responsibilities: ['Provide governed expert guidance', 'Maintain marketplace trust standards'],
    projects: [`${expert.specialty} advisory engagement`],
    knowledgeContributions: [
      {
        id: `kc-expert-${expert.id}`,
        title: `${expert.specialty} expertise`,
        type: 'mentorship',
        contributedAt: new Date().toISOString(),
        impactSummary: 'Expert knowledge available on demand through marketplace.',
      },
    ],
    achievements: [],
    communicationPreferences: ['Structured advisory sessions · documented recommendations'],
    lifeCulturePreferences: [],
    learningHistory: [],
    permissions: 'contributor',
    goals: ['Share expertise responsibly', 'Maintain marketplace trust score'],
    professionalInterests: [expert.specialty],
    trustScore: expert.trustScore,
    relationshipCount: 0,
    lastActiveAt: new Date().toISOString(),
    firstClassCitizen: true,
  };
}

function buildSeedPeople(organizationId: string, companyName: string): IdentityPersonProfile[] {
  const people: IdentityPersonProfile[] = [buildFounderPerson(organizationId, companyName)];

  const rel = getOrganizationRelationshipMemoryProfile(organizationId);
  for (const entity of rel?.organizationalRelationships ?? []) {
    people.push(buildPersonFromRelationship(organizationId, entity));
  }

  const crossOrg = getOrganizationCrossOrgIntelligenceProfile(organizationId);
  for (const member of crossOrg?.founderNetwork ?? []) {
    const typeMap: Record<string, IdentityType> = {
      clients: 'customer',
      suppliers: 'vendor',
      agencies: 'partner',
      'preferred-partners': 'partner',
      'internal-companies': 'partner',
      'family-businesses': 'partner',
    };
    const identityType = typeMap[member.networkType] ?? 'partner';
    if (!people.some((p) => p.displayName === member.organizationName)) {
      people.push(buildNetworkPerson(organizationId, member, identityType));
    }
  }

  const marketplace = getOrganizationExpertMarketplaceProfile(organizationId);
  for (const listing of marketplace?.listings?.slice(0, 4) ?? []) {
    const profile = listing.profile;
    people.push(
      buildExpertPerson(organizationId, {
        id: profile.brainId,
        name: profile.expertName,
        specialty: profile.specialties[0] ?? profile.services[0] ?? 'Expert',
        trustScore: Math.round(profile.rating * 20),
      })
    );
  }

  const wisdom = getOrganizationWisdomProfile(organizationId);
  if (wisdom?.wisdomLibrary?.length) {
    const founder = people.find((p) => p.identityType === 'founder');
    if (founder) {
      founder.knowledgeContributions = [
        ...founder.knowledgeContributions,
        ...wisdom.wisdomLibrary.slice(0, 3).map((w, i) => ({
          id: `kc-wisdom-${i}`,
          title: w.wisdom.slice(0, 60),
          type: 'wisdom' as const,
          contributedAt: w.capturedAt,
          impactSummary: w.category,
        })),
      ];
    }
  }

  if (!people.some((p) => p.identityType === 'investor')) {
    people.push({
      id: personId(organizationId, 'investor-seed'),
      displayName: 'Strategic Investor',
      identityType: 'investor',
      identityTypeLabel: IDENTITY_TYPE_LABELS.investor,
      personalSummary: 'Growth capital partner with governance interest in organizational maturity.',
      organizationSummary: `${companyName} investor relationship — aligned on long-term organizational intelligence.`,
      department: 'Capital',
      role: 'Strategic Investor',
      skills: ['Capital allocation', 'Governance', 'Growth strategy'],
      expertise: ['Organizational scaling', 'Studio OS maturity'],
      responsibilities: ['Quarterly governance review', 'Strategic milestone accountability'],
      projects: ['Organizational maturity investment'],
      knowledgeContributions: [],
      achievements: [],
      communicationPreferences: ['Formal quarterly updates · metrics-first briefings'],
      lifeCulturePreferences: [],
      learningHistory: [],
      permissions: 'viewer',
      goals: ['Sustainable organizational growth', 'Trustworthy operational intelligence'],
      professionalInterests: ['Organizational intelligence', 'Governance'],
      trustScore: 78,
      relationshipCount: 0,
      lastActiveAt: new Date().toISOString(),
      firstClassCitizen: true,
    });
  }

  if (!people.some((p) => p.identityType === 'advisor')) {
    people.push({
      id: personId(organizationId, 'advisor-seed'),
      displayName: 'Executive Advisor',
      identityType: 'advisor',
      identityTypeLabel: IDENTITY_TYPE_LABELS.advisor,
      personalSummary: 'Trusted external advisor — mentors founder on strategic decisions.',
      organizationSummary: 'Advisory relationship complementing Executive Council™ deliberation.',
      department: 'Advisory',
      role: 'Executive Advisor',
      skills: ['Mentorship', 'Strategic counsel', 'Industry perspective'],
      expertise: ['Executive decision architecture'],
      responsibilities: ['Mentor founder on high-stakes decisions', 'Provide outside perspective'],
      projects: ['Executive advisory cadence'],
      knowledgeContributions: [],
      achievements: [],
      communicationPreferences: ['Monthly advisory sessions · candid written feedback'],
      lifeCulturePreferences: [],
      learningHistory: [],
      permissions: 'guest',
      goals: ['Strengthen founder decision quality'],
      professionalInterests: ['Leadership development'],
      trustScore: 82,
      relationshipCount: 0,
      lastActiveAt: new Date().toISOString(),
      firstClassCitizen: true,
    });
  }

  if (!people.some((p) => p.identityType === 'contractor')) {
    people.push({
      id: personId(organizationId, 'contractor-seed'),
      displayName: 'Specialist Contractor',
      identityType: 'contractor',
      identityTypeLabel: IDENTITY_TYPE_LABELS.contractor,
      personalSummary: 'Project-based specialist — engaged for defined deliverables with clear scope.',
      organizationSummary: 'Contract engagement governed through permissions and project boundaries.',
      department: 'Projects',
      role: 'Specialist Contractor',
      skills: ['Project delivery', 'Technical execution'],
      expertise: ['Scoped deliverables'],
      responsibilities: ['Deliver contracted outcomes within defined permissions'],
      projects: ['Active contract engagement'],
      knowledgeContributions: [],
      achievements: [],
      communicationPreferences: ['Project channel updates · milestone-based check-ins'],
      lifeCulturePreferences: [],
      learningHistory: [],
      permissions: 'contributor',
      goals: ['Deliver contracted outcomes on schedule'],
      professionalInterests: ['Project excellence'],
      trustScore: 70,
      relationshipCount: 0,
      lastActiveAt: new Date().toISOString(),
      firstClassCitizen: true,
    });
  }

  if (!people.some((p) => p.identityType === 'applicant')) {
    people.push({
      id: personId(organizationId, 'applicant-seed'),
      displayName: 'Prospective Team Member',
      identityType: 'applicant',
      identityTypeLabel: IDENTITY_TYPE_LABELS.applicant,
      personalSummary: 'Candidate in hiring pipeline — identity forming through discovery and interviews.',
      organizationSummary: 'Applicant identity tracked before full organizational membership.',
      department: 'Hiring',
      role: 'Applicant',
      skills: ['Under evaluation'],
      expertise: [],
      responsibilities: ['Complete discovery process', 'Demonstrate role fit'],
      projects: ['Hiring evaluation'],
      knowledgeContributions: [],
      achievements: [],
      communicationPreferences: ['Professional interview cadence'],
      lifeCulturePreferences: [],
      learningHistory: [],
      permissions: 'guest',
      goals: ['Join organization with clear role alignment'],
      professionalInterests: ['Organizational contribution'],
      trustScore: 45,
      relationshipCount: 0,
      lastActiveAt: new Date().toISOString(),
      firstClassCitizen: true,
    });
  }

  return people;
}

export function buildIdentityRelationships(
  _organizationId: string,
  people: IdentityPersonProfile[]
): IdentityRelationshipEdge[] {
  const edges: IdentityRelationshipEdge[] = [];
  const founder = people.find((p) => p.identityType === 'founder');
  const employees = people.filter((p) => p.identityType === 'employee');
  const customers = people.filter((p) => p.identityType === 'customer');
  const partners = people.filter((p) => p.identityType === 'partner');
  const experts = people.filter((p) => p.identityType === 'expert');
  const advisor = people.find((p) => p.identityType === 'advisor');

  const addEdge = (
    from: IdentityPersonProfile,
    to: IdentityPersonProfile,
    edgeType: RelationshipEdgeType,
    summary: string,
    strength: number,
    bidirectional = false
  ) => {
    edges.push({
      id: `edge-${from.id}-${to.id}-${edgeType}`,
      fromPersonId: from.id,
      fromPersonName: from.displayName,
      toPersonId: to.id,
      toPersonName: to.displayName,
      edgeType,
      edgeTypeLabel: RELATIONSHIP_EDGE_LABELS[edgeType],
      strength,
      summary,
      bidirectional,
    });
  };

  if (founder) {
    for (const emp of employees.slice(0, 6)) {
      addEdge(emp, founder, 'reports-to', `${emp.displayName} reports to founder for strategic approvals.`, 85);
      addEdge(founder, emp, 'mentors', `Founder mentors ${emp.displayName} on organizational judgment.`, 75, true);
      addEdge(founder, emp, 'works-with', `Founder works with ${emp.displayName} on ${emp.department} priorities.`, 70, true);
    }
    for (const cust of customers.slice(0, 4)) {
      addEdge(founder, cust, 'clients-served', `Founder serves ${cust.displayName} as strategic client relationship.`, 80);
      addEdge(cust, founder, 'organizations', `${cust.displayName} organization connected to headquarters.`, 65, true);
    }
    for (const partner of partners.slice(0, 3)) {
      addEdge(founder, partner, 'collaborates-with', `Strategic collaboration with ${partner.displayName}.`, 78, true);
    }
    if (advisor) {
      addEdge(advisor, founder, 'mentors', 'Executive advisor mentors founder on strategic decisions.', 88);
    }
    for (const expert of experts.slice(0, 2)) {
      addEdge(founder, expert, 'collaborates-with', `Engages ${expert.displayName} for governed expert guidance.`, 72, true);
    }
    const investor = people.find((p) => p.identityType === 'investor');
    if (investor) {
      addEdge(investor, founder, 'ownership', 'Investor holds governance stake in organizational growth.', 70);
    }
  }

  for (let i = 0; i < employees.length - 1; i++) {
    const a = employees[i];
    const b = employees[i + 1];
    if (a && b) {
      addEdge(a, b, 'works-with', `${a.displayName} collaborates with ${b.displayName} cross-functionally.`, 60, true);
      addEdge(a, b, 'teams', `Shared team rhythms between ${a.department} and ${b.department}.`, 55, true);
    }
  }

  for (const emp of employees.slice(0, 3)) {
    for (const cust of customers.slice(0, 2)) {
      addEdge(emp, cust, 'clients-served', `${emp.displayName} serves ${cust.displayName} operationally.`, 65);
    }
  }

  const applicant = people.find((p) => p.identityType === 'applicant');
  if (founder && applicant) {
    addEdge(applicant, founder, 'referred-by', 'Applicant referred through hiring pipeline evaluation.', 40);
  }

  return edges;
}

function countRelationshipsPerPerson(people: IdentityPersonProfile[], edges: IdentityRelationshipEdge[]): IdentityPersonProfile[] {
  const counts = new Map<string, number>();
  for (const e of edges) {
    counts.set(e.fromPersonId, (counts.get(e.fromPersonId) ?? 0) + 1);
    if (e.bidirectional) counts.set(e.toPersonId, (counts.get(e.toPersonId) ?? 0) + 1);
    else counts.set(e.toPersonId, (counts.get(e.toPersonId) ?? 0) + 1);
  }
  return people.map((p) => ({ ...p, relationshipCount: counts.get(p.id) ?? 0 }));
}

function buildDomainStatuses(people: IdentityPersonProfile[], edges: IdentityRelationshipEdge[]): IdentityGraphDomainStatus[] {
  const typesRepresented = new Set(people.map((p) => p.identityType)).size;
  const totalSkills = people.reduce((s, p) => s + p.skills.length, 0);
  const totalKnowledge = people.reduce((s, p) => s + p.knowledgeContributions.length, 0);
  const cultureCount = people.reduce((s, p) => s + p.lifeCulturePreferences.length, 0);

  const scores: Record<(typeof IDENTITY_GRAPH_DOMAINS)[number], { count: number; score: number; summary: string }> = {
    people: { count: people.length, score: Math.min(98, 40 + people.length * 4), summary: `${people.length} living identities · ${typesRepresented} identity types represented.` },
    relationships: { count: edges.length, score: Math.min(96, 35 + edges.length * 2), summary: `${edges.length} relationship edges mapped across the organization.` },
    expertise: { count: totalSkills, score: Math.min(94, 50 + totalSkills * 2), summary: `${totalSkills} skills and expertise areas indexed per person.` },
    responsibilities: { count: people.reduce((s, p) => s + p.responsibilities.length, 0), score: Math.min(92, 55 + people.length * 3), summary: 'Role responsibilities tracked for every connected identity.' },
    knowledge: { count: totalKnowledge, score: Math.min(90, 45 + totalKnowledge * 5), summary: `${totalKnowledge} knowledge contributions linked to people.` },
    permissions: { count: people.length, score: Math.min(88, 60 + people.filter((p) => p.permissions !== 'guest').length * 2), summary: 'Permission levels assigned per identity — governed access.' },
    culture: { count: cultureCount, score: Math.min(86, 40 + cultureCount * 4), summary: `${cultureCount} Life & Culture Preferences™ captured through observation.` },
  };

  return IDENTITY_GRAPH_DOMAINS.map((domain) => ({
    domain,
    label: IDENTITY_GRAPH_DOMAIN_LABELS[domain],
    score: scores[domain].score,
    count: scores[domain].count,
    summary: scores[domain].summary,
  }));
}

function buildClusters(people: IdentityPersonProfile[], edges: IdentityRelationshipEdge[]): IdentityGraphCluster[] {
  return IDENTITY_TYPES.filter((t) => people.some((p) => p.identityType === t)).map((identityType) => {
    const clusterPeople = people.filter((p) => p.identityType === identityType);
    const personIds = new Set(clusterPeople.map((p) => p.id));
    const relCount = edges.filter((e) => personIds.has(e.fromPersonId) || personIds.has(e.toPersonId)).length;
    return {
      id: `cluster-${identityType}`,
      label: IDENTITY_TYPE_LABELS[identityType],
      identityTypes: [identityType],
      personCount: clusterPeople.length,
      relationshipCount: relCount,
      summary: `${clusterPeople.length} ${IDENTITY_TYPE_LABELS[identityType].toLowerCase()} identities · ${relCount} connected relationships.`,
    };
  });
}

export function computeGraphScore(domains: IdentityGraphDomainStatus[], peopleCount: number): number {
  const avgDomain = domains.reduce((s, d) => s + d.score, 0) / Math.max(1, domains.length);
  return Math.min(98, Math.round(avgDomain * 0.7 + Math.min(peopleCount * 2, 28)));
}

export function buildDockIdentityLine(profile: OrganizationIdentityGraphProfile): string {
  const founder = profile.people.find((p) => p.identityType === 'founder');
  const topRel = profile.relationships[0];
  if (founder && topRel) {
    return `${profile.peopleCount} people · ${profile.relationshipCount} relationships — ${founder.displayName} at center; ${topRel.edgeTypeLabel} ${topRel.toPersonName}.`;
  }
  return `${profile.peopleCount} living identities mapped — people are first-class citizens in ${profile.companyName}.`;
}

export function buildOrganizationIdentityGraphProfile(organizationId: string): OrganizationIdentityGraphProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  let people = buildSeedPeople(organizationId, companyName);
  const relationships = buildIdentityRelationships(organizationId, people);
  people = countRelationshipsPerPerson(people, relationships);

  const domainStatuses = buildDomainStatuses(people, relationships);
  const clusters = buildClusters(people, relationships);
  const identityTypesRepresented = new Set(people.map((p) => p.identityType)).size;
  const departmentsMapped = new Set(people.map((p) => p.department)).size;

  const profile: OrganizationIdentityGraphProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    graphScore: 0,
    peopleCount: people.length,
    relationshipCount: relationships.length,
    identityTypesRepresented,
    departmentsMapped,
    people,
    relationships,
    domainStatuses,
    clusters,
    selectedPersonId: people.find((p) => p.identityType === 'founder')?.id ?? people[0]?.id ?? null,
    dockIdentityLine: '',
    peopleFirstClassCitizens: true,
    syncedSources: [
      'relationship-memory',
      'cross-organization-intelligence',
      'profession-brain',
      'expert-marketplace',
      'wisdom-capture',
      'business-discovery-blueprint',
    ],
    lastSyncedAt: now,
  };

  profile.graphScore = computeGraphScore(domainStatuses, people.length);
  profile.dockIdentityLine = buildDockIdentityLine(profile);
  return profile;
}

export function summarizeIdentityGraph(profile: OrganizationIdentityGraphProfile): string {
  return [
    profile.dockIdentityLine,
    `${profile.peopleCount} people · ${profile.relationshipCount} relationships · ${profile.identityTypesRepresented} identity types · graph score ${profile.graphScore}%.`,
    'Identity Graph™ — every person is a living profile. Organizations are built from people.',
  ].join(' ');
}

export function getSelectedPerson(profile: OrganizationIdentityGraphProfile) {
  return profile.people.find((p) => p.id === profile.selectedPersonId) ?? profile.people[0] ?? null;
}
