import type { HumanKnowledgeArtifact, OrganizationProfessionBrain } from './types';

export function generateHumanKnowledgeArtifacts(brain: OrganizationProfessionBrain): HumanKnowledgeArtifact[] {
  const artifacts: HumanKnowledgeArtifact[] = [];
  const faqEntries = brain.knowledgeEntries.filter((e) => e.kind === 'mistake' || e.kind === 'best-practice');

  artifacts.push({
    id: `hk-onboard-${brain.id}`,
    brainId: brain.id,
    type: 'onboarding',
    title: `${brain.label} · New Employee Orientation`,
    content: `Welcome to ${brain.label}. Learn WHY we operate this way — not only WHAT to click. Start with institutional stories and judgment patterns before procedures.`,
  });

  if (faqEntries.length > 0) {
    artifacts.push({
      id: `hk-faq-${brain.id}`,
      brainId: brain.id,
      type: 'faq',
      title: `${brain.label} · Frequently Asked Questions`,
      content: faqEntries.map((e) => `Q: ${e.title}\nA: ${e.why || e.what}`).join('\n\n'),
    });
  }

  artifacts.push({
    id: `hk-checklist-${brain.id}`,
    brainId: brain.id,
    type: 'checklist',
    title: `${brain.label} · Operational Checklist`,
    content: brain.knowledgeEntries
      .filter((e) => e.kind === 'business-rule' || e.kind === 'best-practice')
      .map((e) => `☐ ${e.title}: ${e.what}`)
      .join('\n') || 'Checklist evolves as the Profession Brain learns.',
  });

  artifacts.push({
    id: `hk-decision-${brain.id}`,
    brainId: brain.id,
    type: 'decision-tree',
    title: `${brain.label} · Decision Tree`,
    content:
      brain.judgmentPatterns.map((p) => `IF ${p.situation}\nTHEN ${p.professionalResponse}`).join('\n\n') ||
      'Decision trees strengthen with every correction.',
  });

  artifacts.push({
    id: `hk-scenario-${brain.id}`,
    brainId: brain.id,
    type: 'scenario',
    title: `${brain.label} · Scenario Learning`,
    content: `Practice scenarios use real organizational judgment — compare your decision to ${brain.label} patterns before acting.`,
  });

  return artifacts;
}

export function generateAllHumanKnowledge(
  brains: OrganizationProfessionBrain[]
): HumanKnowledgeArtifact[] {
  return brains.flatMap(generateHumanKnowledgeArtifacts);
}
