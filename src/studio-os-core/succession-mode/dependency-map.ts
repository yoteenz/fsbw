import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type { KnowledgeDependencyNode } from './types';

function answer(promptId: string, blueprint: ReturnType<typeof getOrganizationDiscoveryBlueprint>): string {
  return blueprint?.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

export function buildKnowledgeDependencyMap(organizationId: string): KnowledgeDependencyNode[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const nodes: KnowledgeDependencyNode[] = [];

  const founderOnly = answer('founder-only-you', blueprint);
  if (founderOnly) {
    nodes.push({
      id: 'dep-founder-only',
      area: 'Founder-exclusive decisions',
      dependencyType: 'founder-only',
      riskLevel: 'high',
      description: founderOnly.slice(0, 160),
      recommendation: 'Preserve in Profession Brain — cross-train successor or delegate with Trust Framework.',
    });
  }

  const founderStress = answer('founder-stress', blueprint);
  if (founderStress) {
    nodes.push({
      id: 'dep-founder-stress',
      area: 'High-stress founder workflows',
      dependencyType: 'founder-only',
      riskLevel: 'high',
      description: founderStress.slice(0, 120),
      recommendation: 'Document stress triggers and escalation paths in Brain memory graph.',
    });
  }

  const unwritten = answer('decision-unwritten', blueprint);
  if (unwritten) {
    nodes.push({
      id: 'dep-unwritten',
      area: 'Unwritten decision rules',
      dependencyType: 'uncaptured',
      riskLevel: 'high',
      description: unwritten.slice(0, 120),
      preserveInBrainId: brain?.brains[0]?.id,
      recommendation: 'Capture unwritten rules as Profession Brain judgment patterns immediately.',
    });
  }

  const wisdomNever = answer('wisdom-never-outsource', blueprint);
  if (wisdomNever) {
    nodes.push({
      id: 'dep-never-outsource',
      area: 'Never-outsource knowledge',
      dependencyType: 'founder-only',
      riskLevel: 'medium',
      description: wisdomNever.slice(0, 120),
      recommendation: 'Define what must stay internal vs what can delegate — preserve in Brain.',
    });
  }

  if (!answer('people-employees', blueprint)) {
    nodes.push({
      id: 'dep-people-gap',
      area: 'Team knowledge map',
      dependencyType: 'uncaptured',
      riskLevel: 'medium',
      description: 'People chapter incomplete — role knowledge not mapped.',
      recommendation: 'Complete Blueprint people chapter for cross-training visibility.',
    });
  }

  nodes.push(
    {
      id: 'dep-vendor-demo',
      area: 'External vendor relationships',
      dependencyType: 'vendor-only',
      riskLevel: 'medium',
      description: 'Key vendor contacts and negotiation history may live outside Studio OS.',
      recommendation: 'Document vendor judgment in Profession Brain — not just contact lists.',
    },
    {
      id: 'dep-manager-approvals',
      area: 'Manager approval workflows',
      dependencyType: 'manager-only',
      riskLevel: 'medium',
      description: 'Department managers may hold process knowledge not yet in Brain.',
      recommendation: 'Sync manager SOPs to Profession Brain via Studio Institute checklists.',
    }
  );

  if (brain) {
    for (const b of brain.brains.slice(0, 2)) {
      if (b.knowledgeEntries.length < 5) {
        nodes.push({
          id: `dep-brain-thin-${b.id}`,
          area: `${b.label} expertise`,
          dependencyType: 'employee-only',
          riskLevel: 'high',
          description: `Only ${b.knowledgeEntries.length} knowledge entries — expertise may live in one person.`,
          preserveInBrainId: b.id,
          recommendation: `Expand ${b.label} Profession Brain before founder unavailability.`,
        });
      }
    }
  }

  return nodes;
}
