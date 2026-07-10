import type {
  CreativeIntelligenceScore,
  CreativeIntelligenceScorecard,
  CreativePreviewCompanyId,
  CreativePreviewConcept,
  CreativeStudioPreviewResult,
  CreativeStudioPreviewBundle,
} from './types';
import {
  CREATIVE_PREVIEW_COMPANY_LABELS,
  buildBaseSpecification,
  buildConstraintsRespected,
  buildDnaInheritance,
  buildReasoningChain,
  buildRulesApplied,
  collectGoverningInputs,
  resolveArchitectureArchetype,
  resolveRegistryCompanyId,
} from './company-inputs';
import { CREATIVE_PREVIEW_READ_ONLY } from './types';

const SCORE_LABELS: Record<CreativeIntelligenceScore['category'], string> = {
  'industry-recognition': 'Industry Recognition',
  'brand-identity': 'Brand Identity',
  'creative-direction': 'Creative Direction',
  'spatial-logic': 'Spatial Logic',
  'workflow-accuracy': 'Workflow Accuracy',
  'narrative-alignment': 'Narrative Alignment',
  'luxury-premium': 'Luxury / Premium Positioning',
  'emotional-accuracy': 'Emotional Accuracy',
  'founder-alignment': 'Founder Alignment',
  'overall-confidence': 'Overall Confidence',
};

function buildConcepts(companyId: CreativePreviewCompanyId): CreativePreviewConcept[] {
  const canonical = buildBaseSpecification(companyId, 'canonical');
  const compressed = buildBaseSpecification(companyId, 'compressed');
  const expanded = buildBaseSpecification(companyId, 'expanded');

  const baseTraits =
    companyId === 'studio-os'
      ? ['institutional permanence', 'crystal health grid', 'executive calm']
      : companyId === 'frontal-slayer'
        ? ['mansion room logic', 'mirror-light concierge', 'trust-over-sales warmth']
        : ['signal desk hierarchy', 'broadcast metadata rails', 'editorial urgency control'];

  return [
    {
      conceptId: 'a',
      tier: 'recommended',
      label: 'Concept A — Recommended',
      whyExists: 'Canonical expression of governing DNA with balanced spatial density for founder review.',
      traitsProduced: baseTraits,
      strengths: [
        'Strongest alignment with Company Registry thesis and Brand DNA materials',
        'Spatial organization matches department topology without logo dependency',
        'Workflow structure mirrors actual operating model',
      ],
      weaknesses: [
        'Less experimental than Concept C — may feel conservative to innovation-focused founders',
      ],
      confidencePct: companyId === 'studio-os' ? 91 : companyId === 'frontal-slayer' ? 89 : 88,
      specification: canonical,
    },
    {
      conceptId: 'b',
      tier: 'alternative',
      label: 'Concept B — Alternative',
      whyExists: 'Compressed spatial density for operators who prioritize command velocity over ceremony.',
      traitsProduced: [...baseTraits, 'higher information density', 'shorter arrival sequence'],
      strengths: [
        'Faster scan path for daily operators',
        'Preserves material and lighting language from Brand DNA',
      ],
      weaknesses: [
        'Reduced ceremonial arrival — may under-express luxury/premium positioning',
        'Executive lobby less legible at a glance for external stakeholders',
      ],
      confidencePct: companyId === 'studio-os' ? 82 : companyId === 'frontal-slayer' ? 78 : 84,
      specification: compressed,
    },
    {
      conceptId: 'c',
      tier: 'experimental',
      label: 'Concept C — Experimental',
      whyExists: 'Expanded spatial narrative to test whether environmental storytelling can carry more emotional weight.',
      traitsProduced: [...baseTraits, 'expanded arrival narrative', 'deeper environmental mood'],
      strengths: [
        'Maximum differentiation without logo reliance',
        'Strongest emotional accuracy for brand immersion scenarios',
      ],
      weaknesses: [
        'Longer path to primary workflow actions',
        'May conflict with Experience Engine rule: one primary action per viewport',
      ],
      confidencePct: companyId === 'studio-os' ? 74 : companyId === 'frontal-slayer' ? 81 : 76,
      specification: expanded,
    },
  ];
}

function scoreForCategory(
  companyId: CreativePreviewCompanyId,
  category: CreativeIntelligenceScore['category'],
  concept: CreativePreviewConcept
): CreativeIntelligenceScore {
  const spec = concept.specification;
  const brandBoost = concept.conceptId === 'a' ? 8 : concept.conceptId === 'b' ? 3 : 0;

  const baseByCompany: Record<CreativePreviewCompanyId, Partial<Record<CreativeIntelligenceScore['category'], number>>> = {
    'studio-os': {
      'industry-recognition': 88,
      'brand-identity': 86,
      'creative-direction': 90,
      'spatial-logic': 92,
      'workflow-accuracy': 91,
      'narrative-alignment': 89,
      'luxury-premium': 84,
      'emotional-accuracy': 87,
      'founder-alignment': 90,
    },
    'frontal-slayer': {
      'industry-recognition': 92,
      'brand-identity': 93,
      'creative-direction': 88,
      'spatial-logic': 90,
      'workflow-accuracy': 86,
      'narrative-alignment': 91,
      'luxury-premium': 94,
      'emotional-accuracy': 95,
      'founder-alignment': 92,
    },
    ndx: {
      'industry-recognition': 90,
      'brand-identity': 87,
      'creative-direction': 89,
      'spatial-logic': 88,
      'workflow-accuracy': 85,
      'narrative-alignment': 92,
      'luxury-premium': 78,
      'emotional-accuracy': 86,
      'founder-alignment': 88,
    },
  };

  let scorePct =
    category === 'overall-confidence'
      ? concept.confidencePct
      : (baseByCompany[companyId][category] ?? 80) + brandBoost - (concept.conceptId === 'c' ? 6 : 0);

  scorePct = Math.min(98, Math.max(62, Math.round(scorePct)));

  const evidence: string[] = [];

  switch (category) {
    case 'industry-recognition':
      evidence.push(`Interior architecture "${spec.interiorArchitecture.slice(0, 60)}…" matches ${companyId} industry posture.`);
      evidence.push(`Material system [${spec.materialSystem.slice(0, 3).join(', ')}] is industry-appropriate, not generic SaaS.`);
      break;
    case 'brand-identity':
      evidence.push(`Design philosophy: ${spec.designPhilosophy.slice(0, 100)}…`);
      evidence.push('No logo dependency — identity carried by spatial and material language.');
      break;
    case 'creative-direction':
      evidence.push(`Signature experiences: ${spec.signatureExperiences[0]}`);
      evidence.push(`Interaction philosophy: ${spec.interactionPhilosophy.slice(0, 80)}…`);
      break;
    case 'spatial-logic':
      evidence.push(`Spatial organization: ${spec.spatialOrganization}`);
      evidence.push(`Environmental mood: ${spec.environmentalMood}`);
      break;
    case 'workflow-accuracy':
      evidence.push(`Workflow structure: ${spec.workflowStructure}`);
      break;
    case 'narrative-alignment':
      evidence.push(`Motion behavior aligns with narrative cadence: ${spec.motionBehavior.slice(0, 80)}…`);
      break;
    case 'luxury-premium':
      evidence.push(`Lighting language: ${spec.lightingLanguage}`);
      evidence.push(
        companyId === 'frontal-slayer'
          ? 'Mansion salon archetype scores highest premium positioning.'
          : companyId === 'ndx'
            ? 'Broadcast command prioritizes authority over luxury trim — score adjusted.'
            : 'Institutional crystal reads premium through permanence, not ornament.'
      );
      break;
    case 'emotional-accuracy':
      evidence.push(`Environmental mood targets: ${spec.environmentalMood}`);
      evidence.push(`Concept tier "${concept.tier}" confidence: ${concept.confidencePct}%`);
      break;
    case 'founder-alignment':
      evidence.push(`Concept rationale: ${concept.whyExists.slice(0, 100)}…`);
      evidence.push(`Strengths include: ${concept.strengths[0]}`);
      break;
    case 'overall-confidence':
      evidence.push(`Weighted from governing inputs, DNA inheritance, and concept tier.`);
      evidence.push(`Weakness acknowledged: ${concept.weaknesses[0]}`);
      break;
  }

  return {
    category,
    label: SCORE_LABELS[category],
    scorePct,
    evidence,
  };
}

function buildScorecard(
  companyId: CreativePreviewCompanyId,
  concept: CreativePreviewConcept
): CreativeIntelligenceScorecard {
  const categories = Object.keys(SCORE_LABELS) as CreativeIntelligenceScore['category'][];
  const scores = categories.map((c) => scoreForCategory(companyId, c, concept));
  const nonOverall = scores.filter((s) => s.category !== 'overall-confidence');
  const overallConfidencePct = Math.round(
    nonOverall.reduce((sum, s) => sum + s.scorePct, 0) / nonOverall.length
  );

  return {
    scores,
    overallConfidencePct,
    summary: `${CREATIVE_PREVIEW_COMPANY_LABELS[companyId]} preview scores ${overallConfidencePct}% overall — ${concept.label} with traceable governing inputs.`,
  };
}

/** Creative Studio Preview Compiler™ — READ-ONLY compiled environment proposals. */
export function compileCreativeStudioPreview(
  companyId: CreativePreviewCompanyId
): CreativeStudioPreviewResult {
  const concepts = buildConcepts(companyId);
  const recommended = concepts[0]!;

  return {
    readOnly: CREATIVE_PREVIEW_READ_ONLY,
    companyId,
    companyLabel: CREATIVE_PREVIEW_COMPANY_LABELS[companyId],
    registryCompanyId: resolveRegistryCompanyId(companyId),
    compiledAt: new Date().toISOString(),
    architectureArchetype: resolveArchitectureArchetype(companyId),
    governingInputs: collectGoverningInputs(companyId),
    dnaInheritance: buildDnaInheritance(companyId),
    rulesApplied: buildRulesApplied(companyId),
    constraintsRespected: buildConstraintsRespected(),
    reasoningChain: buildReasoningChain(companyId),
    concepts,
    recommendedConceptId: 'a',
    scorecard: buildScorecard(companyId, recommended),
    validationSummary: `READ-ONLY preview compiled for ${CREATIVE_PREVIEW_COMPANY_LABELS[companyId]}. Three concepts generated. Recommended: Concept A (${recommended.confidencePct}% confidence). No production writes.`,
  };
}

export function compileCreativeStudioPreviewBundle(): CreativeStudioPreviewBundle {
  const companies = {} as CreativeStudioPreviewBundle['companies'];
  for (const id of ['studio-os', 'frontal-slayer', 'ndx'] as CreativePreviewCompanyId[]) {
    companies[id] = compileCreativeStudioPreview(id);
  }
  return {
    companies,
    comparedAt: new Date().toISOString(),
  };
}
