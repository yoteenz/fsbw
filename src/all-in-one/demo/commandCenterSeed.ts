import type { OrganizationMember } from './demoTypes';

export function createCommandCenterSeedData(): {
  portalMemberRole: OrganizationMember['role'];
  organizationMembers: OrganizationMember[];
} {
  const now = new Date().toISOString();
  return {
    portalMemberRole: 'owner',
    organizationMembers: [
      { id: 'mem-a-1', organizationId: 'client-a', name: 'Marcus Webb', email: 'marcus.demo@summitridge.example', role: 'owner', status: 'active', lastActivityAt: now },
      { id: 'mem-b-1', organizationId: 'client-b', name: 'Diana Cole', email: 'diana.demo@heartland.example', role: 'owner', status: 'active', lastActivityAt: now },
      { id: 'mem-b-2', organizationId: 'client-b', name: 'Sam Driver', email: 'sam.demo@heartland.example', role: 'driver', status: 'active', lastActivityAt: now },
      { id: 'mem-c-1', organizationId: 'client-c', name: 'Chris Nguyen', email: 'chris.demo@pioneerfleet.example', role: 'admin', status: 'active', lastActivityAt: now },
      { id: 'mem-c-2', organizationId: 'client-c', name: 'Alex Ops', email: 'alex.demo@pioneerfleet.example', role: 'operations', status: 'active', lastActivityAt: now },
      { id: 'mem-d-1', organizationId: 'client-d', name: 'Kevin Shaw', email: 'kevin.demo@blueline.example', role: 'owner', status: 'active', lastActivityAt: now },
      { id: 'mem-e-1', organizationId: 'client-e', name: 'Elena Vasquez', email: 'elena.demo@northstar.example', role: 'owner', status: 'active', lastActivityAt: now },
      { id: 'mem-f-1', organizationId: 'client-f', name: 'Chris Delta', email: 'chris.demo@deltahaul.example', role: 'owner', status: 'active', lastActivityAt: now },
      { id: 'mem-g-1', organizationId: 'client-g', name: 'Pat Ridge', email: 'pat.demo@ridgeline.example', role: 'owner', status: 'active', lastActivityAt: now },
    ],
  };
}
