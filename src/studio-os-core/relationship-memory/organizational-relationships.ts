import { getOrganizationCrossOrgIntelligenceProfile } from '../cross-organization-intelligence/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { RELATIONSHIP_ENTITY_LABELS, RELATIONSHIP_ENTITY_TYPES } from './constants';
import type { OrganizationalRelationshipMemory, RelationshipEntityType } from './types';

const ENTITY_FROM_NETWORK: Partial<Record<string, RelationshipEntityType>> = {
  clients: 'clients',
  suppliers: 'suppliers',
  agencies: 'partners',
  'preferred-partners': 'partners',
  'internal-companies': 'departments',
  'family-businesses': 'partners',
};

const DEMO_EMPLOYEES: { name: string; comm: string; cadence: string; workflow: string; requests: string[] }[] = [
  {
    name: 'Operations Lead',
    comm: 'Async updates with end-of-day summary — prefers Slack over email for urgent items.',
    cadence: 'Weekly ops review · daily standup optional',
    workflow: 'Operational approvals before founder review on routine spend.',
    requests: ['Inventory reports', 'Vendor coordination', 'Schedule adjustments'],
  },
  {
    name: 'Marketing Director',
    comm: 'Visual mockups and campaign previews before launch approval.',
    cadence: 'Bi-weekly creative review · ad-hoc for launches',
    workflow: 'Creative review → Marketing sign-off → founder final approval.',
    requests: ['Campaign assets', 'Brand compliance checks', 'Launch timelines'],
  },
];

const DEMO_DEPARTMENTS: { name: string; comm: string; cadence: string; workflow: string; requests: string[] }[] = [
  {
    name: 'Finance',
    comm: 'Formal written summaries — numbers with context, not raw exports.',
    cadence: 'Monthly close review · quarterly planning',
    workflow: 'Finance prepares → Operations validates → founder approves financial decisions.',
    requests: ['Budget variance reports', 'Payroll summaries', 'Tax filing prep'],
  },
  {
    name: 'Customer Success',
    comm: 'Relationship-first updates — client sentiment before ticket counts.',
    cadence: 'Weekly client pulse · milestone celebrations as they occur',
    workflow: 'CS escalates exceptions — standard renewals handled within department.',
    requests: ['Renewal briefs', 'Escalation summaries', 'NPS follow-ups'],
  },
];

function buildRelationship(
  id: string,
  entityType: RelationshipEntityType,
  entityName: string,
  preferredCommunication: string,
  meetingCadence: string,
  approvalWorkflow: string,
  recurringRequests: string[],
  interactionCount: number
): OrganizationalRelationshipMemory {
  return {
    id,
    entityType,
    entityName,
    preferredCommunication,
    meetingCadence,
    approvalWorkflow,
    recurringRequests,
    interactionCount,
  };
}

export function buildOrganizationalRelationshipMemories(organizationId: string): OrganizationalRelationshipMemory[] {
  const crossOrg = getOrganizationCrossOrgIntelligenceProfile(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const relationships: OrganizationalRelationshipMemory[] = [];

  for (const member of crossOrg?.founderNetwork ?? []) {
    const entityType = ENTITY_FROM_NETWORK[member.networkType] ?? 'partners';
    relationships.push(
      buildRelationship(
        `rel-${organizationId}-${member.id}`,
        entityType,
        member.organizationName,
        `Professional tone · ${member.relationship.split(' · ')[0]}`,
        entityType === 'clients' ? 'Quarterly business review · milestone check-ins' : 'As-needed · project-based cadence',
        entityType === 'clients'
          ? 'Account team prepares → founder approves strategic changes only.'
          : 'Permission-based collaboration — explicit approval before sharing resources.',
        member.sharedCapabilities.slice(0, 3),
        member.trustLevel === 'trusted' ? 24 : member.trustLevel === 'verified' ? 12 : 4
      )
    );
  }

  for (const [index, employee] of DEMO_EMPLOYEES.entries()) {
    relationships.push(
      buildRelationship(
        `rel-${organizationId}-employee-${index}`,
        'employees',
        employee.name,
        employee.comm,
        employee.cadence,
        employee.workflow,
        employee.requests,
        18 + index * 6
      )
    );
  }

  for (const [index, dept] of DEMO_DEPARTMENTS.entries()) {
    relationships.push(
      buildRelationship(
        `rel-${organizationId}-dept-${index}`,
        'departments',
        dept.name,
        dept.comm,
        dept.cadence,
        dept.workflow,
        dept.requests,
        32 + index * 8
      )
    );
  }

  if (brain?.companyName) {
    const supplier = relationships.find((r) => r.entityType === 'suppliers');
    if (supplier) {
      supplier.recurringRequests = [
        ...supplier.recurringRequests,
        `${brain.companyName} operational supplies`,
      ];
    }
  }

  return RELATIONSHIP_ENTITY_TYPES.flatMap((entityType) =>
    relationships.filter((r) => r.entityType === entityType)
  ).slice(0, 14);
}

export function entityTypeLabel(type: RelationshipEntityType): string {
  return RELATIONSHIP_ENTITY_LABELS[type];
}

export function countRelationshipsByType(
  relationships: OrganizationalRelationshipMemory[]
): Record<RelationshipEntityType, number> {
  const counts = Object.fromEntries(RELATIONSHIP_ENTITY_TYPES.map((t) => [t, 0])) as Record<
    RelationshipEntityType,
    number
  >;
  for (const r of relationships) counts[r.entityType] += 1;
  return counts;
}
