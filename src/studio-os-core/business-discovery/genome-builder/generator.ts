import { BUSINESS_DISCOVERY_ENGINE_VERSION } from '../constants';
import { generateDiscoveryRecommendations } from '../discovery-insights/generator';
import { detectAutomationOpportunities } from '../discovery-engine/automation-engine';
import { analyzeBusinessRisks } from '../discovery-engine/risk-analyzer';
import type {
  CompanyGenome,
  CompanyGenomeGraphEdge,
  CompanyGenomeGraphNode,
  DiscoveryRecommendation,
  DiscoverySession,
  DiscoveredSystem,
} from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function systemsToNodes(systems: DiscoveredSystem[], nodeType: CompanyGenomeGraphNode['nodeType']): CompanyGenomeGraphNode[] {
  return systems.map((system) => ({
    id: system.id,
    label: system.name,
    nodeType,
    metadata: { category: system.category, confidence: system.confidence },
  }));
}

function relationshipsToEdges(session: DiscoverySession): CompanyGenomeGraphEdge[] {
  return session.relationships.map((rel) => ({
    id: rel.id,
    from: rel.fromSystemId,
    to: rel.toSystemId,
    edgeType: rel.relationshipType === 'depends-on' ? 'depends-on' : 'feeds',
    label: rel.label,
  }));
}

function buildCustomerJourney(session: DiscoverySession): string[] {
  const journey: string[] = ['Discover'];
  if (session.company.market) journey.push('Evaluate market fit');
  if (session.company.customerSegments.length) journey.push('Choose offer');
  journey.push('Purchase');
  if (session.company.operationsSummary) journey.push('Receive delivery');
  journey.push('Return / refer');
  return journey;
}

function buildRevenueGraph(session: DiscoverySession): {
  nodes: CompanyGenomeGraphNode[];
  edges: CompanyGenomeGraphEdge[];
} {
  const nodes: CompanyGenomeGraphNode[] = session.company.revenueSources.map((source, index) => ({
    id: uid('rev'),
    label: source,
    nodeType: 'revenue',
    metadata: { index },
  }));

  const offerNodes: CompanyGenomeGraphNode[] = session.company.offers.map((offer) => ({
    id: uid('offer'),
    label: offer,
    nodeType: 'system',
  }));

  const edges: CompanyGenomeGraphEdge[] = offerNodes.map((offer) => ({
    id: uid('edge'),
    from: offer.id,
    to: nodes[0]?.id ?? offer.id,
    edgeType: 'feeds',
    label: 'Generates revenue',
  }));

  return { nodes: [...nodes, ...offerNodes], edges };
}

function buildDecisionGraph(session: DiscoverySession): {
  nodes: CompanyGenomeGraphNode[];
  edges: CompanyGenomeGraphEdge[];
} {
  const nodes: CompanyGenomeGraphNode[] = [
    {
      id: uid('decision'),
      label: session.founder.displayName,
      nodeType: 'decision',
      metadata: { role: 'founder' },
    },
  ];

  if (session.founder.decisionStyle) {
    nodes.push({
      id: uid('decision'),
      label: session.founder.decisionStyle,
      nodeType: 'decision',
      metadata: { type: 'decision-style' },
    });
  }

  for (const dep of session.dependencies) {
    for (const approval of dep.requiredApprovals) {
      nodes.push({
        id: uid('decision'),
        label: approval,
        nodeType: 'decision',
        metadata: { workflow: dep.workflowName },
      });
    }
  }

  return { nodes, edges: [] };
}

function buildAiOpportunities(session: DiscoverySession): DiscoveryRecommendation[] {
  return generateDiscoveryRecommendations(session)
    .filter((rec) => rec.category === 'automation' || rec.category === 'knowledge')
    .slice(0, 4);
}

export function generateCompanyGenome(session: DiscoverySession): CompanyGenome {
  const operationalNodes = systemsToNodes(session.discoveredSystems, 'system');
  const operationalEdges = relationshipsToEdges(session);

  const knowledgeNodes: CompanyGenomeGraphNode[] = session.responses
    .filter((response) => response.phaseId === 'knowledge-discovery')
    .map((response) => ({
      id: uid('know'),
      label: response.questionId,
      nodeType: 'knowledge',
      metadata: { wordCount: response.wordCount },
    }));

  const automationOpportunities = detectAutomationOpportunities(session);
  const operationalRisks = analyzeBusinessRisks(session);
  const revenueGraph = buildRevenueGraph(session);
  const decisionGraph = buildDecisionGraph(session);

  const completionSignals = [
    session.discoveredSystems.length >= 2,
    session.relationships.length >= 1,
    session.dependencies.length >= 1,
    session.responses.length >= 8,
    operationalRisks.length >= 1,
  ];
  const completionPercent = Math.round(
    (completionSignals.filter(Boolean).length / completionSignals.length) * 100
  );

  return {
    id: uid('genome'),
    sessionId: session.id,
    organizationId: session.organizationId,
    version: BUSINESS_DISCOVERY_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    completionPercent,
    businessSystems: session.discoveredSystems,
    dependencies: session.dependencies,
    operationalGraph: { nodes: operationalNodes, edges: operationalEdges },
    knowledgeGraph: { nodes: knowledgeNodes, edges: [] },
    customerJourney: buildCustomerJourney(session),
    revenueGraph,
    decisionGraph,
    automationOpportunities,
    aiOpportunities: buildAiOpportunities(session),
    operationalRisks,
  };
}

export function buildDependencyGraphPreview(session: DiscoverySession): {
  nodes: CompanyGenomeGraphNode[];
  edges: CompanyGenomeGraphEdge[];
} {
  if (session.companyGenome) {
    return session.companyGenome.operationalGraph;
  }
  return {
    nodes: systemsToNodes(session.discoveredSystems, 'system'),
    edges: relationshipsToEdges(session),
  };
}
