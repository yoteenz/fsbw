import { readExecutiveOrganizationStore } from '../executive-organization/store';
import { getOrganizationIdentityGraphProfile } from '../identity-graph/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationRoleIntelligenceProfile } from '../role-intelligence/store';
import {
  HIERARCHY_DOMAIN_LABELS,
  HIERARCHY_DOMAINS,
  HIERARCHY_LINK_LABELS,
  HIERARCHY_NODE_LABELS,
  STRUCTURE_TYPE_LABELS,
  STRUCTURE_TYPES,
} from './constants';
import type {
  ApprovalRoute,
  HierarchyDomainStatus,
  HierarchyInsight,
  HierarchyLink,
  HierarchyLinkType,
  HierarchyNode,
  HierarchyNodeType,
  OrganizationHierarchyProfile,
  StructureSupportSummary,
  StructureType,
} from './types';

type NodeSeed = {
  id: string;
  label: string;
  nodeType: HierarchyNodeType;
  department?: string;
  location?: string;
  personId?: string;
  headcount?: number;
  managerId?: string | null;
  managerName?: string | null;
  parentIds?: string[];
  structureTypes?: StructureType[];
  summary: string;
  active?: boolean;
};

type LinkSeed = {
  id: string;
  fromId: string;
  toId: string;
  linkType: HierarchyLinkType;
  summary: string;
  strength?: number;
  bidirectional?: boolean;
};

function nodeId(orgId: string, slug: string): string {
  return `hier-${orgId}-${slug}`;
}

function linkId(orgId: string, slug: string): string {
  return `link-${orgId}-${slug}`;
}

function mapIdentityTypeToNodeType(identityType: string): HierarchyNodeType {
  const map: Record<string, HierarchyNodeType> = {
    founder: 'founder',
    employee: 'employee',
    contractor: 'contractor',
    partner: 'partner',
    advisor: 'advisor',
    vendor: 'partner',
    expert: 'advisor',
    customer: 'partner',
    investor: 'partner',
    applicant: 'employee',
  };
  return map[identityType] ?? 'employee';
}

function buildCoreNodes(organizationId: string, companyName: string): NodeSeed[] {
  const execOrg = readExecutiveOrganizationStore();
  const nodes: NodeSeed[] = [
    {
      id: nodeId(organizationId, 'org-root'),
      label: companyName,
      nodeType: 'organization',
      headcount: 0,
      structureTypes: ['standard', 'multi-location'],
      summary: `${companyName} — organizational root. Functions across locations, departments, and matrix lines.`,
      active: true,
    },
    {
      id: nodeId(organizationId, 'founder'),
      label: 'Founder',
      nodeType: 'founder',
      department: 'Executive',
      personId: `identity-${organizationId}-founder`,
      headcount: 1,
      managerId: null,
      parentIds: [nodeId(organizationId, 'org-root')],
      structureTypes: ['family-business'],
      summary: 'Founding leader — ultimate approval authority and cultural anchor.',
      active: true,
    },
    {
      id: nodeId(organizationId, 'shared-services'),
      label: 'Shared Services',
      nodeType: 'shared-service',
      department: 'Shared Services',
      headcount: 4,
      managerId: nodeId(organizationId, 'founder'),
      managerName: 'Founder',
      parentIds: [nodeId(organizationId, 'org-root')],
      structureTypes: ['shared-department', 'matrix'],
      summary: 'Finance, HR, and IT shared across departments — matrix support lines.',
      active: true,
    },
    {
      id: nodeId(organizationId, 'location-hq'),
      label: 'Headquarters',
      nodeType: 'location',
      location: 'HQ',
      headcount: 0,
      parentIds: [nodeId(organizationId, 'org-root')],
      structureTypes: ['multi-location'],
      summary: 'Primary headquarters location.',
      active: true,
    },
    {
      id: nodeId(organizationId, 'location-branch'),
      label: 'Branch Office',
      nodeType: 'location',
      location: 'Branch',
      headcount: 0,
      parentIds: [nodeId(organizationId, 'org-root')],
      structureTypes: ['multi-location', 'franchise'],
      summary: 'Secondary location — franchise-style operations with local autonomy.',
      active: true,
    },
    {
      id: nodeId(organizationId, 'project-alpha'),
      label: 'Project Alpha Team',
      nodeType: 'project-team',
      department: 'Cross-Functional',
      headcount: 5,
      managerId: null,
      managerName: null,
      parentIds: [nodeId(organizationId, 'org-root')],
      structureTypes: ['project-team', 'matrix'],
      summary: 'Temporary cross-functional project team — no permanent manager assigned.',
      active: true,
    },
  ];

  for (const exec of execOrg.executives) {
    nodes.push({
      id: nodeId(organizationId, `exec-${exec.id}`),
      label: exec.title,
      nodeType: 'executive',
      department: exec.department,
      headcount: 1,
      managerId: nodeId(organizationId, 'founder'),
      managerName: 'Founder',
      parentIds: [nodeId(organizationId, 'org-root')],
      structureTypes: ['holding-company'],
      summary: `${exec.mission} — executive leadership with department accountability.`,
      active: true,
    });
  }

  for (const dept of execOrg.departments) {
    const execNodeId = nodeId(organizationId, `exec-${dept.executiveId}`);
    nodes.push({
      id: nodeId(organizationId, `dept-${dept.id}`),
      label: dept.name,
      nodeType: 'department',
      department: dept.name,
      headcount: dept.teams.reduce((s, t) => s + t.workerIds.length, 0) + 1,
      managerId: execNodeId,
      managerName: execOrg.executives.find((e) => e.id === dept.executiveId)?.title ?? 'Executive',
      parentIds: [execNodeId, nodeId(organizationId, 'location-hq')],
      structureTypes: dept.name.toLowerCase().includes('operations') ? ['matrix'] : ['standard'],
      summary: `${dept.name} department — ${dept.objectives[0] ?? 'operational delivery'}.`,
      active: true,
    });

    for (const team of dept.teams) {
      const hasLead = Boolean(team.leadWorkerId);
      nodes.push({
        id: nodeId(organizationId, `team-${team.id}`),
        label: team.name,
        nodeType: 'team',
        department: dept.name,
        headcount: team.workerIds.length + (hasLead ? 1 : 0),
        managerId: hasLead ? nodeId(organizationId, `worker-${team.leadWorkerId}`) : null,
        managerName: hasLead
          ? execOrg.workers.find((w) => w.id === team.leadWorkerId)?.name ?? 'Team Lead'
          : null,
        parentIds: [nodeId(organizationId, `dept-${dept.id}`)],
        structureTypes: hasLead ? ['standard'] : ['project-team'],
        summary: `${team.name} team in ${dept.name}${hasLead ? '' : ' — no active manager'}.`,
        active: true,
      });
    }
  }

  for (const worker of execOrg.workers) {
    const isManager = execOrg.departments.some((d) => d.teams.some((t) => t.leadWorkerId === worker.id));
    nodes.push({
      id: nodeId(organizationId, `worker-${worker.id}`),
      label: worker.name,
      nodeType: isManager ? 'manager' : worker.type === 'freelancer' ? 'contractor' : 'employee',
      department: execOrg.departments.find((d) => d.id === worker.departmentId)?.name ?? 'Operations',
      headcount: 1,
      managerId: nodeId(organizationId, `dept-${worker.departmentId}`),
      managerName: execOrg.departments.find((d) => d.id === worker.departmentId)?.name ?? 'Department',
      parentIds: [nodeId(organizationId, `team-${worker.teamId}`)],
      structureTypes: worker.type === 'freelancer' ? ['matrix'] : ['standard'],
      summary: `${worker.role} — ${worker.skills.slice(0, 2).join(', ')}.`,
      active: true,
    });
  }

  return nodes;
}

function enrichNodesFromIdentity(
  organizationId: string,
  seeds: NodeSeed[],
  identity: ReturnType<typeof getOrganizationIdentityGraphProfile>
): NodeSeed[] {
  if (!identity) return seeds;

  const existingPersonIds = new Set(seeds.map((n) => n.personId).filter(Boolean));

  for (const person of identity.people) {
    if (person.identityType === 'founder') continue;
    const personNodeId = nodeId(organizationId, `person-${person.id}`);
    if (existingPersonIds.has(person.id)) continue;

    seeds.push({
      id: personNodeId,
      label: person.displayName,
      nodeType: mapIdentityTypeToNodeType(person.identityType),
      department: person.department,
      personId: person.id,
      headcount: 1,
      managerId: person.department.toLowerCase().includes('project')
        ? nodeId(organizationId, 'dept-operations')
        : null,
      parentIds: [nodeId(organizationId, 'org-root')],
      structureTypes:
        person.identityType === 'contractor'
          ? ['matrix', 'project-team']
          : person.identityType === 'partner' || person.identityType === 'advisor'
            ? ['holding-company']
            : ['standard'],
      summary: `${person.role} — ${person.organizationSummary.slice(0, 80)}`,
      active: true,
    });
    existingPersonIds.add(person.id);
  }

  return seeds;
}

function addMatrixSupportNode(organizationId: string, seeds: NodeSeed[]): NodeSeed {
  const matrixPerson: NodeSeed = {
    id: nodeId(organizationId, 'matrix-ops-finance'),
    label: 'Operations-Finance Liaison',
    nodeType: 'employee',
    department: 'Operations',
    headcount: 1,
    managerId: nodeId(organizationId, 'dept-operations'),
    managerName: 'Operations',
    parentIds: [
      nodeId(organizationId, 'dept-operations'),
      nodeId(organizationId, 'dept-finance'),
      nodeId(organizationId, 'shared-services'),
    ],
    structureTypes: ['matrix', 'shared-department'],
    summary: 'Supports three departments — Operations, Finance, and Shared Services (matrix assignment).',
    active: true,
  };
  seeds.push(matrixPerson);
  return matrixPerson;
}

function buildLinks(organizationId: string, nodes: HierarchyNode[]): HierarchyLink[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const links: LinkSeed[] = [];

  for (const node of nodes) {
    for (const parentId of node.parentIds) {
      const parent = nodeMap.get(parentId);
      if (!parent) continue;
      links.push({
        id: linkId(organizationId, `${node.id}-reports-${parentId}`),
        fromId: node.id,
        toId: parentId,
        linkType: 'reports-to',
        summary: `${node.label} reports to ${parent.label}`,
        strength: 85,
      });
    }
  }

  const sharedServices = nodes.find((n) => n.label === 'Shared Services');
  const operations = nodes.find((n) => n.department?.toLowerCase() === 'operations' && n.nodeType === 'department');
  const finance = nodes.find((n) => n.department?.toLowerCase() === 'finance' && n.nodeType === 'department');
  const matrixPerson = nodes.find((n) => n.id.includes('matrix-ops-finance'));

  if (matrixPerson && operations && finance && sharedServices) {
    for (const target of [operations, finance, sharedServices]) {
      links.push({
        id: linkId(organizationId, `matrix-${matrixPerson.id}-${target.id}`),
        fromId: matrixPerson.id,
        toId: target.id,
        linkType: 'matrix-support',
        summary: `${matrixPerson.label} provides matrix support to ${target.label}`,
        strength: 78,
        bidirectional: true,
      });
    }
  }

  if (operations && finance) {
    links.push({
      id: linkId(organizationId, 'approval-ops-finance'),
      fromId: operations.id,
      toId: finance.id,
      linkType: 'approval-route',
      summary: 'Operational approvals route through Operations before Finance',
      strength: 92,
    });
  }

  const founder = nodes.find((n) => n.nodeType === 'founder');
  const advisors = nodes.filter((n) => n.nodeType === 'advisor');
  for (const advisor of advisors) {
    if (founder) {
      links.push({
        id: linkId(organizationId, `advisory-${advisor.id}`),
        fromId: advisor.id,
        toId: founder.id,
        linkType: 'advisory',
        summary: `${advisor.label} advises founder leadership`,
        strength: 70,
        bidirectional: true,
      });
    }
  }

  const partners = nodes.filter((n) => n.nodeType === 'partner');
  for (const partner of partners.slice(0, 2)) {
    links.push({
      id: linkId(organizationId, `partnership-${partner.id}`),
      fromId: partner.id,
      toId: nodeId(organizationId, 'org-root'),
      linkType: 'partnership',
      summary: `${partner.label} — external partnership connection`,
      strength: 65,
      bidirectional: true,
    });
  }

  const projectTeam = nodes.find((n) => n.nodeType === 'project-team' && n.label.includes('Project Alpha'));
  if (projectTeam && operations) {
    links.push({
      id: linkId(organizationId, 'temp-project-ops'),
      fromId: projectTeam.id,
      toId: operations.id,
      linkType: 'temporary',
      summary: 'Project Alpha temporarily supported by Operations',
      strength: 60,
    });
  }

  return links.map((seed) => {
    const from = nodeMap.get(seed.fromId)!;
    const to = nodeMap.get(seed.toId)!;
    return {
      id: seed.id,
      fromNodeId: seed.fromId,
      fromLabel: from.label,
      toNodeId: seed.toId,
      toLabel: to.label,
      linkType: seed.linkType,
      linkTypeLabel: HIERARCHY_LINK_LABELS[seed.linkType],
      strength: seed.strength ?? 75,
      summary: seed.summary,
      bidirectional: seed.bidirectional ?? false,
    };
  });
}

function finalizeNodes(seeds: NodeSeed[]): HierarchyNode[] {
  return seeds.map((seed) => {
    const childIds = seeds.filter((s) => s.parentIds?.includes(seed.id)).map((s) => s.id);
    return {
      id: seed.id,
      label: seed.label,
      nodeType: seed.nodeType,
      nodeTypeLabel: HIERARCHY_NODE_LABELS[seed.nodeType],
      department: seed.department,
      location: seed.location,
      personId: seed.personId,
      headcount: seed.headcount ?? 1,
      managerId: seed.managerId ?? null,
      managerName: seed.managerName ?? null,
      parentIds: seed.parentIds ?? [],
      childIds,
      structureTypes: seed.structureTypes ?? ['standard'],
      summary: seed.summary,
      active: seed.active ?? true,
    };
  });
}

function buildApprovalRoutes(nodes: HierarchyNode[], links: HierarchyLink[]): ApprovalRoute[] {
  const routes: ApprovalRoute[] = [];
  const approvalLinks = links.filter((l) => l.linkType === 'approval-route');

  for (const link of approvalLinks) {
    routes.push({
      id: link.id,
      label: `${link.fromLabel} → ${link.toLabel} approval chain`,
      steps: [link.fromLabel, link.toLabel, 'Founder (exceptions)'],
      departments: [link.fromLabel, link.toLabel],
      reason: link.summary,
    });
  }

  if (!routes.length) {
    const ops = nodes.find((n) => n.department?.toLowerCase() === 'operations' && n.nodeType === 'department');
    const fin = nodes.find((n) => n.department?.toLowerCase() === 'finance' && n.nodeType === 'department');
    if (ops && fin) {
      routes.push({
        id: 'route-ops-finance-default',
        label: 'Operations → Finance approval chain',
        steps: ['Operations', 'Finance', 'Founder (exceptions)'],
        departments: ['Operations', 'Finance'],
        reason: 'This approval should route through Operations before Finance.',
      });
    }
  }

  return routes;
}

function buildInsights(nodes: HierarchyNode[], links: HierarchyLink[]): HierarchyInsight[] {
  const insights: HierarchyInsight[] = [];

  const opsFinanceRoute = links.find((l) => l.linkType === 'approval-route');
  if (opsFinanceRoute) {
    insights.push({
      id: 'insight-approval-route',
      insight: 'This approval should route through Operations before Finance.',
      category: 'routing',
      severity: 'info',
      recommendedAction: 'Configure approval workflows to enforce Operations → Finance sequence.',
      relatedNodeIds: [opsFinanceRoute.fromNodeId, opsFinanceRoute.toNodeId],
    });
  }

  const matrixPeople = nodes.filter((n) => n.parentIds.length >= 3 || n.structureTypes.includes('matrix'));
  const tripleDept = matrixPeople.find((n) => n.summary.includes('three departments'));
  if (tripleDept) {
    insights.push({
      id: 'insight-matrix-support',
      insight: 'This employee supports three departments.',
      category: 'matrix',
      severity: 'watch',
      recommendedAction: `Review capacity for ${tripleDept.label} — matrix assignments may create overload.`,
      relatedNodeIds: [tripleDept.id, ...tripleDept.parentIds],
    });
  }

  const unmanagedTeams = nodes.filter((n) => n.nodeType === 'team' && !n.managerId);
  for (const team of unmanagedTeams) {
    insights.push({
      id: `insight-no-manager-${team.id}`,
      insight: 'This team has no active manager.',
      category: 'manager',
      severity: 'attention',
      recommendedAction: `Assign an active manager to ${team.label} or convert to governed project team.`,
      relatedNodeIds: [team.id],
    });
  }

  const projectTeams = nodes.filter((n) => n.nodeType === 'project-team');
  if (projectTeams.length) {
    insights.push({
      id: 'insight-project-teams',
      insight: `${projectTeams.length} temporary project team(s) active — matrix and dotted-line reporting in effect.`,
      category: 'structure',
      severity: 'info',
      recommendedAction: 'Review project team charters and sunset dates.',
      relatedNodeIds: projectTeams.map((t) => t.id),
    });
  }

  const sharedServices = nodes.filter((n) => n.nodeType === 'shared-service');
  if (sharedServices.length) {
    insights.push({
      id: 'insight-shared-services',
      insight: `${sharedServices.length} shared service unit(s) support multiple departments simultaneously.`,
      category: 'shared-service',
      severity: 'info',
      recommendedAction: 'Ensure shared service SLAs are visible in Mission Control.',
      relatedNodeIds: sharedServices.map((s) => s.id),
    });
  }

  const familyNodes = nodes.filter((n) => n.structureTypes.includes('family-business'));
  if (familyNodes.length) {
    insights.push({
      id: 'insight-family-business',
      insight: 'Family business structure detected — founder retains cultural and approval centrality.',
      category: 'structure',
      severity: 'info',
      recommendedAction: 'Document succession paths for family-held roles.',
      relatedNodeIds: familyNodes.map((n) => n.id),
    });
  }

  return insights;
}

function buildStructureSupport(nodes: HierarchyNode[]): StructureSupportSummary[] {
  return STRUCTURE_TYPES.map((structureType) => {
    const matching = nodes.filter((n) => n.structureTypes.includes(structureType));
    return {
      structureType,
      structureTypeLabel: STRUCTURE_TYPE_LABELS[structureType],
      active: matching.length > 0,
      nodeCount: matching.length,
      summary:
        matching.length > 0
          ? `${matching.length} nodes — ${STRUCTURE_TYPE_LABELS[structureType]} patterns detected`
          : `${STRUCTURE_TYPE_LABELS[structureType]} — not active in current org model`,
    };
  });
}

function buildDomainStatuses(
  nodes: HierarchyNode[],
  links: HierarchyLink[],
  routes: ApprovalRoute[]
): HierarchyDomainStatus[] {
  const people = nodes.filter((n) =>
    ['founder', 'executive', 'manager', 'employee', 'contractor', 'partner', 'advisor'].includes(n.nodeType)
  );
  const departments = nodes.filter((n) => n.nodeType === 'department');
  const teams = nodes.filter((n) => n.nodeType === 'team' || n.nodeType === 'project-team');
  const matrix = links.filter((l) => l.linkType === 'matrix-support' || l.linkType === 'dotted-line');
  const shared = nodes.filter((n) => n.nodeType === 'shared-service');

  const scores: Record<(typeof HIERARCHY_DOMAINS)[number], { count: number; score: number; summary: string }> = {
    people: {
      count: people.length,
      score: Math.min(96, 45 + people.length * 3),
      summary: `${people.length} people mapped — founders, executives, managers, employees, contractors, partners, advisors.`,
    },
    departments: {
      count: departments.length,
      score: Math.min(94, 40 + departments.length * 8),
      summary: `${departments.length} departments connected to executive leadership.`,
    },
    teams: {
      count: teams.length,
      score: Math.min(92, 35 + teams.length * 6),
      summary: `${teams.length} teams including temporary project teams.`,
    },
    connections: {
      count: links.length,
      score: Math.min(95, 40 + links.length * 2),
      summary: `${links.length} hierarchy links — reporting, matrix, advisory, and partnership lines.`,
    },
    matrix: {
      count: matrix.length + shared.length,
      score: Math.min(90, 50 + matrix.length * 5 + shared.length * 8),
      summary: `${matrix.length} matrix links · ${shared.length} shared service units.`,
    },
    routing: {
      count: routes.length,
      score: Math.min(88, 55 + routes.length * 12),
      summary: `${routes.length} approval routes — how decisions actually flow.`,
    },
  };

  return HIERARCHY_DOMAINS.map((domain) => ({
    domain,
    label: HIERARCHY_DOMAIN_LABELS[domain],
    score: scores[domain].score,
    count: scores[domain].count,
    summary: scores[domain].summary,
  }));
}

export function computeHierarchyScore(domains: HierarchyDomainStatus[], nodes: HierarchyNode[]): number {
  const avgDomain = domains.reduce((s, d) => s + d.score, 0) / Math.max(1, domains.length);
  const connectionBonus = Math.min(15, nodes.filter((n) => n.parentIds.length > 1).length * 3);
  return Math.min(98, Math.round(avgDomain * 0.7 + connectionBonus));
}

export function buildDockHierarchyLine(profile: OrganizationHierarchyProfile): string {
  return `${profile.nodesMapped} nodes · ${profile.linksMapped} connections · ${profile.matrixAssignments} matrix assignments — hierarchy reflects how the organization actually functions.`;
}

export function buildOrganizationHierarchyProfile(organizationId: string): OrganizationHierarchyProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const identity = getOrganizationIdentityGraphProfile(organizationId);
  const roles = getOrganizationRoleIntelligenceProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  let seeds = buildCoreNodes(organizationId, companyName);
  seeds = enrichNodesFromIdentity(organizationId, seeds, identity);
  addMatrixSupportNode(organizationId, seeds);

  if (roles?.roles.length) {
    for (const role of roles.roles.slice(0, 3)) {
      if (!seeds.some((s) => s.department === role.department && s.nodeType === 'department')) {
        seeds.push({
          id: nodeId(organizationId, `dept-role-${role.roleKey}`),
          label: role.department,
          nodeType: 'department',
          department: role.department,
          headcount: role.peopleCount,
          parentIds: [nodeId(organizationId, 'org-root')],
          structureTypes: ['standard'],
          summary: `${role.department} — informed by Role Intelligence™ (${role.title}).`,
          active: true,
        });
      }
    }
  }

  const nodes = finalizeNodes(seeds);
  const links = buildLinks(organizationId, nodes);
  const approvalRoutes = buildApprovalRoutes(nodes, links);
  const insights = buildInsights(nodes, links);
  const domainStatuses = buildDomainStatuses(nodes, links, approvalRoutes);
  const structureSupport = buildStructureSupport(nodes);

  const matrixAssignments = nodes.filter((n) => n.parentIds.length > 1).length;
  const peopleCount = nodes.filter((n) =>
    ['founder', 'executive', 'manager', 'employee', 'contractor', 'partner', 'advisor'].includes(n.nodeType)
  ).length;

  const registry: OrganizationHierarchyProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    hierarchyScore: 0,
    nodesMapped: nodes.length,
    linksMapped: links.length,
    departmentsCount: nodes.filter((n) => n.nodeType === 'department').length,
    teamsCount: nodes.filter((n) => n.nodeType === 'team' || n.nodeType === 'project-team').length,
    peopleCount,
    matrixAssignments,
    sharedServicesCount: nodes.filter((n) => n.nodeType === 'shared-service').length,
    structureTypesActive: structureSupport.filter((s) => s.active).length,
    nodes,
    links,
    approvalRoutes,
    insights,
    domainStatuses,
    structureSupport,
    selectedNodeId: nodes.find((n) => n.nodeType === 'founder')?.id ?? nodes[0]?.id ?? null,
    dockHierarchyLine: '',
    functionsNotChart: true,
    syncedSources: ['identity-graph', 'executive-organization', 'role-intelligence', 'profession-brain'],
    lastSyncedAt: now,
  };

  registry.hierarchyScore = computeHierarchyScore(domainStatuses, nodes);
  registry.dockHierarchyLine = buildDockHierarchyLine(registry);
  return registry;
}

export function summarizeOrganizationalHierarchy(profile: OrganizationHierarchyProfile): string {
  return [
    profile.dockHierarchyLine,
    `${profile.departmentsCount} departments · ${profile.teamsCount} teams · ${profile.insights.length} intelligence signals.`,
    'Organizational Hierarchy™ — how organizations actually function, not just an org chart.',
  ].join(' ');
}

export function getSelectedNode(profile: OrganizationHierarchyProfile) {
  return profile.nodes.find((n) => n.id === profile.selectedNodeId) ?? profile.nodes[0] ?? null;
}

export function explainNodeById(nodeId: string, profile: OrganizationHierarchyProfile): string | null {
  const node = profile.nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const parentLabels = node.parentIds
    .map((id) => profile.nodes.find((n) => n.id === id)?.label)
    .filter(Boolean)
    .join(', ');
  const childLabels = node.childIds
    .map((id) => profile.nodes.find((n) => n.id === id)?.label)
    .filter(Boolean)
    .join(', ');
  return [
    `${node.label} — ${node.nodeTypeLabel}`,
    node.summary,
    parentLabels ? `Reports to / connected: ${parentLabels}` : '',
    childLabels ? `Children: ${childLabels}` : '',
    node.managerName ? `Manager: ${node.managerName}` : 'No active manager',
    `Structures: ${node.structureTypes.map((t) => STRUCTURE_TYPE_LABELS[t]).join(', ')}`,
  ]
    .filter(Boolean)
    .join(' · ');
}
