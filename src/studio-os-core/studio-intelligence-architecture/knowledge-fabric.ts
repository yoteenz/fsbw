import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationOperatingManualProfile } from '../organization-operating-manual/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationLegacyVaultProfile } from '../legacy-vault/store';
import { getOrganizationStudioInstituteProfile } from '../studio-institute/org-store';
import { getOrganizationWorldKnowledgeProfile } from '../world-knowledge-engine/store';
import { getOrganizationKnowledgeCommerceProfile } from '../knowledge-commerce/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { KNOWLEDGE_FABRIC_NODE_LABELS } from './constants';
import type { KnowledgeFabricEdge, KnowledgeFabricNode } from './types';

function node(
  id: string,
  type: KnowledgeFabricNode['type'],
  label: string,
  summary: string,
  connectionCount: number,
  trustPct: number,
  sourceSystem: string
): KnowledgeFabricNode {
  return {
    id,
    type,
    typeLabel: KNOWLEDGE_FABRIC_NODE_LABELS[type],
    label,
    summary,
    connectionCount,
    trustPct,
    sourceSystem,
  };
}

export function buildKnowledgeFabricNodes(organizationId: string, companyName: string): KnowledgeFabricNode[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const manual = getOrganizationOperatingManualProfile(organizationId);
  const vault = getOrganizationLegacyVaultProfile(organizationId);
  const institute = getOrganizationStudioInstituteProfile(organizationId);
  const world = getOrganizationWorldKnowledgeProfile(organizationId);
  const commerce = getOrganizationKnowledgeCommerceProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);

  const brainCount = brain?.brains?.length ?? 2;
  const memoryCount = memory?.records?.length ?? 4;
  const manualSections = manual?.documents?.length ?? 12;
  const vaultMoments = vault?.archiveEntries?.length ?? 6;

  return [
    node('org-root', 'organizations', companyName, 'Active organization — identity anchor in Knowledge Fabric™', 14, 96, 'organization-context'),
    node('dept-ops', 'departments', 'Operations', 'Department workflows · SOPs · automation touchpoints', 8, 88, 'industry-architecture'),
    node('dept-mkt', 'departments', 'Marketing', 'Campaigns · content · customer-facing knowledge', 7, 85, 'industry-architecture'),
    node('people-founders', 'people', 'Founders & Executives', 'Leadership · decisions · relationship preferences', 9, 92, 'relationship-memory'),
    node('customers-core', 'customers', 'Customer Relationships', 'History · preferences · recurring requests', 6, 84, 'relationship-memory'),
    node('docs-policies', 'documents', 'Policy Library', `${manualSections} operating manual sections · searchable`, 10, 90, 'organization-operating-manual'),
    node('projects-active', 'projects', 'Active Projects', 'Campaigns · launches · initiatives in flight', 5, 82, 'work-orchestration'),
    node('meetings-council', 'meetings', 'Executive Council Sessions', `${council?.decisionHistory?.length ?? 3} collaborative decisions recorded`, 7, 91, 'executive-council'),
    node('decisions-recent', 'decisions', 'Organizational Decisions', 'Decision history with outcomes · lessons learned', 8, 89, 'executive-council'),
    node('sops-library', 'sops', 'Standard Operating Procedures', 'Auto-generated from Profession Brain™ · Institute paths', 9, 87, 'studio-institute'),
    node('policies-trust', 'policies', 'Trust & Compliance Policies', 'Professional scope · review requirements · regulated guidance', 6, 93, 'professional-trust-framework'),
    node('brain-hub', 'profession-brains', 'Profession Brains™', `${brainCount} institutional intelligence surfaces · expertise preserved`, 12, brain?.overallMaturityPct ?? 86, 'profession-brain'),
    node('genome-identity', 'organization-genomes', 'Organization Genome™', genome?.identityCore.mission ?? 'Identity · tone · values · decision principles', 11, 94, 'organization-genome'),
    node('memory-archive', 'memory-engine', 'Memory Engine™', `${memoryCount} preserved outcomes · what worked · what failed`, 10, 88, 'memory-engine'),
    node('vault-history', 'legacy-vault', 'Legacy Vault™', `${vaultMoments} archived moments · version history preserved`, 7, 95, 'legacy-vault'),
    node('institute-learning', 'studio-institute', 'Studio Institute™', `${institute?.artifacts?.filter((a) => a.type === 'course').length ?? 4} learning paths from Profession Brain™`, 8, 86, 'studio-institute'),
    node('manual-handbook', 'operating-manual', 'Operating Manual™', `${manualSections} sections · single source of operational truth`, 9, 92, 'organization-operating-manual'),
    node('world-signals', 'world-knowledge-engine', 'World Knowledge Engine™', `${world?.filteredSignals?.length ?? 5} filtered external signals · industry-relevant only`, 6, 83, 'world-knowledge-engine'),
    node('commerce-products', 'knowledge-commerce', 'Knowledge Commerce™', `${commerce?.products?.length ?? 2} monetized expertise surfaces`, 5, 80, 'knowledge-commerce'),
  ];
}

export function buildKnowledgeFabricEdges(nodes: KnowledgeFabricNode[]): KnowledgeFabricEdge[] {
  const find = (id: string) => nodes.find((n) => n.id === id);
  const edges: KnowledgeFabricEdge[] = [];

  const link = (from: string, to: string, relationship: string, strengthPct: number) => {
    if (find(from) && find(to)) {
      edges.push({ id: `${from}-${to}`, fromNodeId: from, toNodeId: to, relationship, strengthPct });
    }
  };

  link('org-root', 'brain-hub', 'preserves expertise via', 95);
  link('org-root', 'genome-identity', 'expresses identity through', 94);
  link('brain-hub', 'institute-learning', 'teaches through', 90);
  link('brain-hub', 'sops-library', 'generates', 88);
  link('brain-hub', 'memory-archive', 'validates with', 87);
  link('genome-identity', 'policies-trust', 'governs scope via', 92);
  link('memory-archive', 'decisions-recent', 'informs', 89);
  link('manual-handbook', 'docs-policies', 'documents', 93);
  link('manual-handbook', 'sops-library', 'operationalizes', 91);
  link('vault-history', 'org-root', 'preserves legacy of', 96);
  link('world-signals', 'brain-hub', 'updates', 78);
  link('commerce-products', 'brain-hub', 'monetizes surfaces from', 82);
  link('meetings-council', 'decisions-recent', 'records', 90);
  link('people-founders', 'meetings-council', 'participates in', 88);
  link('customers-core', 'memory-archive', 'contributes history to', 84);

  return edges;
}

export function summarizeKnowledgeFabric(nodes: KnowledgeFabricNode[], edges: KnowledgeFabricEdge[]): string {
  const avgTrust = Math.round(nodes.reduce((s, n) => s + n.trustPct, 0) / Math.max(1, nodes.length));
  return `Knowledge Fabric™ — ${nodes.length} nodes · ${edges.length} connections · ${avgTrust}% avg trust. Interconnected organizational intelligence — internally a knowledge graph, externally Knowledge Fabric™.`;
}
