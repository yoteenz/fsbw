import { HEADQUARTERS_GENERATION_PROPOSALS } from '../outputs';
import type {
  DiscoveryOrbConfiguration,
  GeneratedDepartment,
  GeneratedDiscoveryObject,
  GeneratedHeadquarters,
  GeneratedMission,
  GeneratedRoom,
  DiscoverySession,
} from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function inferOrbConfiguration(session: DiscoverySession): DiscoveryOrbConfiguration {
  const tone =
    session.founder.leadershipStyle?.toLowerCase().includes('direct') ? 'executive' : 'consultative';
  const escalation =
    session.dependencies.some((dep) => dep.requiredApprovals.some((a) => a.toLowerCase().includes('founder')))
      ? 'founder-first'
      : 'collaborative';

  return {
    strategistTone: tone,
    briefingCadence: session.overallProgressPercent >= 50 ? 'proactive' : 'milestone-only',
    escalationStyle: escalation,
    proactiveInsights: true,
    milestoneLanguage: true,
  };
}

export function generateDepartments(session: DiscoverySession): GeneratedDepartment[] {
  const departments: GeneratedDepartment[] = [
    {
      id: uid('dept'),
      name: 'Executive Command',
      wing: 'Executive Lobby',
      rationale: 'Founder decision graph and mission priorities require an executive command environment.',
      priority: 'essential',
    },
  ];

  if (session.company.offers.length || session.discoveredSystems.some((s) => s.category === 'delivery')) {
    departments.push({
      id: uid('dept'),
      name: 'Operations',
      wing: 'Operations Wing',
      rationale: 'Delivery systems and operational workflows were mapped during discovery.',
      priority: 'essential',
    });
  }

  if (session.company.customerSegments.length) {
    departments.push({
      id: uid('dept'),
      name: 'Customer Experience',
      wing: 'Growth Wing',
      rationale: 'Customer segments and journey stages were identified.',
      priority: 'recommended',
    });
  }

  if (session.responses.some((r) => r.phaseId === 'knowledge-discovery')) {
    departments.push({
      id: uid('dept'),
      name: 'Knowledge & Training',
      wing: 'Knowledge Wing',
      rationale: 'Knowledge discovery captured SOPs and institutional memory candidates.',
      priority: 'recommended',
    });
  }

  if (session.company.revenueSources.length) {
    departments.push({
      id: uid('dept'),
      name: 'Finance & Revenue',
      wing: 'Financial Wing',
      rationale: 'Revenue sources and pricing logic inform financial operations.',
      priority: 'recommended',
    });
  }

  return departments;
}

export function generateRooms(departments: GeneratedDepartment[]): GeneratedRoom[] {
  const rooms: GeneratedRoom[] = [];

  for (const dept of departments) {
    if (dept.name === 'Executive Command') {
      rooms.push({
        id: uid('room'),
        name: 'Strategy Council',
        departmentId: dept.id,
        purpose: 'Executive decisions, mission review, and founder briefings.',
        workspaceType: 'strategy',
      });
    }
    if (dept.name === 'Operations') {
      rooms.push({
        id: uid('room'),
        name: 'Operations Console',
        departmentId: dept.id,
        purpose: 'Workflow monitoring, dependency tracking, and delivery coordination.',
        workspaceType: 'operations',
      });
    }
    if (dept.name === 'Knowledge & Training') {
      rooms.push({
        id: uid('room'),
        name: 'Knowledge Library',
        departmentId: dept.id,
        purpose: 'SOPs, policies, Profession Brain seeds, and training paths.',
        workspaceType: 'knowledge',
      });
    }
    if (dept.name === 'Customer Experience') {
      rooms.push({
        id: uid('room'),
        name: 'Customer Journey Studio',
        departmentId: dept.id,
        purpose: 'Customer segments, journey mapping, and experience standards.',
        workspaceType: 'customer',
      });
    }
  }

  return rooms;
}

export function generateMissions(session: DiscoverySession): GeneratedMission[] {
  const missions: GeneratedMission[] = [];

  const topRisk = session.risks.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))[0];
  if (topRisk) {
    missions.push({
      id: uid('mission'),
      title: `Reduce: ${topRisk.title}`,
      objective: topRisk.mitigation ?? 'Resolve the highest-severity operational risk surfaced during discovery.',
      priority: topRisk.severity === 'critical' ? 'critical' : 'high',
      sourceRiskId: topRisk.id,
    });
  }

  if (session.founder.goals[0]) {
    missions.push({
      id: uid('mission'),
      title: `Advance goal: ${session.founder.goals[0]}`,
      objective: 'Translate founder goal into a measurable first-quarter mission in Mission Control.',
      priority: 'high',
    });
  }

  if (session.companyGenome?.automationOpportunities[0]) {
    const auto = session.companyGenome.automationOpportunities[0];
    missions.push({
      id: uid('mission'),
      title: `Begin Shadow Mode: ${auto.workflowName}`,
      objective: auto.description,
      priority: 'medium',
    });
  }

  return missions;
}

function severityWeight(severity: string): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[severity] ?? 0;
}

export function generateDiscoveryObjects(session: DiscoverySession): GeneratedDiscoveryObject[] {
  const now = new Date().toISOString();
  const objects: GeneratedDiscoveryObject[] = [];

  if (session.founder.mission) {
    objects.push({
      id: uid('obj'),
      title: 'Founder Genome™ draft',
      objectType: 'founder-genome',
      sourcePhaseId: 'founder-discovery',
      generatedAt: now,
    });
  }

  if (session.company.offers.length) {
    objects.push({
      id: uid('obj'),
      title: 'Offer Catalog™',
      objectType: 'offer-catalog',
      sourcePhaseId: 'company-discovery',
      generatedAt: now,
    });
  }

  if (session.relationships.length) {
    objects.push({
      id: uid('obj'),
      title: 'Operational Graph™',
      objectType: 'operational-graph',
      sourcePhaseId: 'relationship-discovery',
      generatedAt: now,
    });
  }

  if (session.companyGenome) {
    objects.push({
      id: uid('obj'),
      title: 'Company Genome™',
      objectType: 'company-genome',
      sourcePhaseId: 'business-genome',
      generatedAt: session.companyGenome.generatedAt,
    });
  }

  return objects;
}

export function generateHeadquartersProposal(session: DiscoverySession): GeneratedHeadquarters | null {
  if (!session.companyGenome || session.overallProgressPercent < 50) return null;

  const proposal = HEADQUARTERS_GENERATION_PROPOSALS[0];
  const maturity =
    session.genomeCompletionPercent >= 85 ? 'ready' : session.genomeCompletionPercent >= 60 ? 'proposed' : 'draft';

  return {
    id: uid('hq'),
    title: proposal?.title ?? 'Executive Headquarters™',
    description:
      proposal?.description ??
      `Headquarters generated for ${session.company.companyName} from Company Genome evidence.`,
    maturityLevel: maturity,
    generatedAt: new Date().toISOString(),
  };
}

export function generateHeadquartersPackage(session: DiscoverySession): {
  headquarters: GeneratedHeadquarters | null;
  departments: GeneratedDepartment[];
  rooms: GeneratedRoom[];
  missions: GeneratedMission[];
  orbConfiguration: DiscoveryOrbConfiguration;
  generatedObjects: GeneratedDiscoveryObject[];
} {
  const departments = generateDepartments(session);
  return {
    headquarters: generateHeadquartersProposal(session),
    departments,
    rooms: generateRooms(departments),
    missions: generateMissions(session),
    orbConfiguration: inferOrbConfiguration(session),
    generatedObjects: generateDiscoveryObjects(session),
  };
}
