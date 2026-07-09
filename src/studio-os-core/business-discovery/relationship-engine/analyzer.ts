import type {
  BusinessDiscoveryPhaseId,
  BusinessDependency,
  BusinessRelationship,
  DiscoveredSystem,
  DiscoveryCompanyProfile,
  DiscoveryFounderProfile,
  DiscoveryResponse,
  DiscoverySession,
} from '../types';

function stableId(prefix: string, key: string): string {
  const hash = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `${prefix}-${hash.toString(36)}`;
}

function responseMap(responses: DiscoveryResponse[], phaseId: BusinessDiscoveryPhaseId): Map<string, string> {
  return new Map(
    responses.filter((response) => response.phaseId === phaseId).map((response) => [response.questionId, response.answer])
  );
}

export function extractFounderProfile(
  founder: DiscoveryFounderProfile,
  responses: DiscoveryResponse[]
): DiscoveryFounderProfile {
  const map = responseMap(responses, 'founder-discovery');
  return {
    ...founder,
    vision: map.get('vision') ?? founder.vision,
    mission: map.get('mission') ?? founder.mission,
    values: parseList(map.get('values') ?? '', founder.values),
    goals: parseList(map.get('goals') ?? '', founder.goals),
    longTermAmbition: map.get('ambition') ?? founder.longTermAmbition,
    decisionStyle: map.get('decision-style') ?? founder.decisionStyle,
    leadershipStyle: map.get('leadership-style') ?? founder.leadershipStyle,
    successDefinition: map.get('success-definition') ?? founder.successDefinition,
  };
}

export function extractCompanyProfile(
  company: DiscoveryCompanyProfile,
  responses: DiscoveryResponse[]
): DiscoveryCompanyProfile {
  const map = responseMap(responses, 'company-discovery');
  return {
    ...company,
    businessModel: map.get('business-model') ?? company.businessModel,
    offers: parseList(map.get('offers') ?? '', company.offers),
    customerSegments: parseList(map.get('customers') ?? '', company.customerSegments),
    market: map.get('market') ?? company.market,
    revenueSources: parseList(map.get('revenue') ?? '', company.revenueSources),
    pricingLogic: map.get('pricing') ?? company.pricingLogic,
    operationsSummary: map.get('operations') ?? company.operationsSummary,
    teamSummary: map.get('team-tech-brand') ?? company.teamSummary,
    brandStandards: map.get('team-tech-brand') ?? company.brandStandards,
  };
}

function parseList(raw: string, fallback: string[]): string[] {
  if (!raw.trim()) return fallback;
  return raw
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function inferDiscoveredSystems(session: DiscoverySession): DiscoveredSystem[] {
  const systems: DiscoveredSystem[] = [];
  const company = session.company;

  if (company.businessModel) {
    systems.push({
      id: stableId('system', 'value-creation'),
      name: 'Value Creation',
      category: 'operations',
      description: company.businessModel,
      sourcePhaseId: 'company-discovery',
      confidence: 82,
    });
  }

  if (company.offers.length) {
    systems.push({
      id: stableId('system', 'offer-delivery'),
      name: 'Offer Delivery',
      category: 'delivery',
      description: `Delivers: ${company.offers.join(', ')}`,
      sourcePhaseId: 'company-discovery',
      confidence: 78,
    });
  }

  if (company.revenueSources.length) {
    systems.push({
      id: stableId('system', 'revenue-engine'),
      name: 'Revenue Engine',
      category: 'finance',
      description: `Revenue from: ${company.revenueSources.join(', ')}`,
      sourcePhaseId: 'company-discovery',
      confidence: 80,
    });
  }

  if (company.customerSegments.length) {
    systems.push({
      id: stableId('system', 'customer-experience'),
      name: 'Customer Experience',
      category: 'growth',
      description: `Serves: ${company.customerSegments.join(', ')}`,
      sourcePhaseId: 'company-discovery',
      confidence: 76,
    });
  }

  if (company.operationsSummary) {
    systems.push({
      id: stableId('system', 'operations-workflow'),
      name: 'Operations Workflow',
      category: 'operations',
      description: company.operationsSummary,
      sourcePhaseId: 'relationship-discovery',
      confidence: 74,
    });
  }

  const knowledgeMap = responseMap(session.responses, 'knowledge-discovery');
  if (knowledgeMap.size > 0) {
    systems.push({
      id: stableId('system', 'knowledge-foundation'),
      name: 'Knowledge Foundation',
      category: 'knowledge',
      description: 'Documented SOPs, policies, and institutional knowledge captured during discovery.',
      sourcePhaseId: 'knowledge-discovery',
      confidence: 70,
    });
  }

  return systems;
}

export function inferBusinessRelationships(systems: DiscoveredSystem[]): BusinessRelationship[] {
  const relationships: BusinessRelationship[] = [];
  const byCategory = (category: DiscoveredSystem['category']) =>
    systems.filter((system) => system.category === category);

  const delivery = byCategory('delivery')[0];
  const revenue = byCategory('finance')[0];
  const customer = byCategory('growth')[0];
  const operations = byCategory('operations')[0];
  const knowledge = byCategory('knowledge')[0];

  if (customer && delivery) {
    relationships.push({
      id: stableId('rel', `${customer.id}-${delivery.id}`),
      fromSystemId: customer.id,
      toSystemId: delivery.id,
      relationshipType: 'feeds',
      label: 'Customer demand drives delivery',
      sourcePhaseId: 'relationship-discovery',
    });
  }

  if (delivery && revenue) {
    relationships.push({
      id: stableId('rel', `${delivery.id}-${revenue.id}`),
      fromSystemId: delivery.id,
      toSystemId: revenue.id,
      relationshipType: 'delivers-to',
      label: 'Delivery produces revenue events',
      sourcePhaseId: 'relationship-discovery',
    });
  }

  if (operations && delivery) {
    relationships.push({
      id: stableId('rel', `${operations.id}-${delivery.id}`),
      fromSystemId: operations.id,
      toSystemId: delivery.id,
      relationshipType: 'depends-on',
      label: 'Delivery depends on operational workflow',
      sourcePhaseId: 'relationship-discovery',
    });
  }

  if (knowledge && operations) {
    relationships.push({
      id: stableId('rel', `${knowledge.id}-${operations.id}`),
      fromSystemId: knowledge.id,
      toSystemId: operations.id,
      relationshipType: 'informs',
      label: 'Knowledge informs operational execution',
      sourcePhaseId: 'relationship-discovery',
    });
  }

  return relationships;
}

export function inferBusinessDependencies(session: DiscoverySession): BusinessDependency[] {
  const dependencies: BusinessDependency[] = [];
  const relMap = responseMap(session.responses, 'relationship-discovery');

  if (session.company.operationsSummary || relMap.get('workflows')) {
    dependencies.push({
      id: stableId('dep', 'request-to-delivery'),
      workflowName: 'Request to delivery',
      requiredInputs: parseList(relMap.get('inputs') ?? 'Customer request, scope, resources', []),
      requiredApprovals: parseList(relMap.get('ownership') ?? 'Founder approval for exceptions', []),
      owner: session.founder.displayName,
      bottleneckRisk: session.responses.filter((r) => r.phaseId === 'relationship-discovery').length < 3 ? 'high' : 'medium',
      sourcePhaseId: 'relationship-discovery',
    });
  }

  const knowledgeAnswers = session.responses.filter((r) => r.phaseId === 'knowledge-discovery');
  if (knowledgeAnswers.length > 0 && knowledgeAnswers.length < 4) {
    dependencies.push({
      id: stableId('dep', 'knowledge-decisions'),
      workflowName: 'Knowledge-dependent decisions',
      requiredInputs: ['Documented SOPs', 'Policy references', 'Brand standards'],
      requiredApprovals: ['Team lead review'],
      bottleneckRisk: 'medium',
      sourcePhaseId: 'knowledge-discovery',
    });
  }

  return dependencies;
}

export function analyzeRelationships(session: DiscoverySession): {
  systems: DiscoveredSystem[];
  relationships: BusinessRelationship[];
  dependencies: BusinessDependency[];
} {
  const systems = inferDiscoveredSystems(session);
  const relationships = inferBusinessRelationships(systems);
  const dependencies = inferBusinessDependencies(session);
  return { systems, relationships, dependencies };
}
