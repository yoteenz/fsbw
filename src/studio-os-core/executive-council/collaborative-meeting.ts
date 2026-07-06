import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationSuccessionProfile } from '../succession-mode/store';
import { selectExecutivesForQuery } from './digital-executives';
import type { DigitalExecutive, ExecutiveContribution } from './org-types';

type CouncilContext = {
  companyName: string;
  healthScore?: number;
  weakArea?: string;
  riskTolerance?: string;
  memoryHint?: string;
  successionHint?: string;
};

function loadCouncilContext(organizationId: string): CouncilContext {
  const health = getOrganizationHealthIndexProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const succession = getOrganizationSuccessionProfile(organizationId);

  return {
    companyName: health?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    healthScore: health?.executiveHealthScore,
    weakArea: health?.weakAreas[0]?.label,
    riskTolerance: genome?.decisionDna.riskTolerance,
    memoryHint: memory?.compoundingRecommendations[0]?.title,
    successionHint: succession?.recommendations[0]?.title,
  };
}

function stanceFromConfidence(confidence: number): ExecutiveContribution['stance'] {
  if (confidence >= 82) return 'support';
  if (confidence >= 65) return 'neutral';
  return 'caution';
}

function buildContribution(
  executive: DigitalExecutive,
  query: string,
  ctx: CouncilContext
): ExecutiveContribution {
  const q = query.toLowerCase();
  let analysis = `${executive.name} evaluates "${query}" from a ${executive.department.toLowerCase()} perspective.`;
  const evidence: string[] = [];
  const concerns: string[] = [];
  const opportunities: string[] = [];
  let confidence = 78;

  if (executive.id === 'marketing-concierge') {
    analysis = `Marketing analyzes demand signals and positioning fit for this initiative at ${ctx.companyName}.`;
    evidence.push('Audience engagement trends · campaign readiness · brand alignment checks');
    if (/revenue|growth|increase/.test(q)) {
      opportunities.push('Relationship-driven demand may compound without paid acquisition pressure');
      concerns.push('Vanity metrics could misalign creative with brand identity');
      confidence = 84;
    }
  } else if (executive.id === 'finance-concierge') {
    analysis = `Finance evaluates profitability, cash impact, and unit economics before committing resources.`;
    evidence.push('Revenue runway · margin sensitivity · investment payback horizon');
    if (/revenue|pricing|cost/.test(q)) {
      opportunities.push('Pricing refinement may lift margin without volume sacrifice');
      concerns.push('Front-loaded spend without validated conversion erodes runway');
      confidence = 81;
    }
  } else if (executive.id === 'operations-concierge') {
    analysis = `Operations evaluates whether current capacity and workflows can absorb this initiative.`;
    evidence.push('Workflow throughput · bottleneck map · delegation readiness');
    concerns.push(ctx.weakArea ? `${ctx.weakArea} may constrain execution bandwidth` : 'Cross-team coordination load during peak delivery');
    opportunities.push('Phased rollout reduces operational shock while preserving momentum');
    confidence = 79;
  } else if (executive.id === 'cx-concierge') {
    analysis = `Customer Experience evaluates trust, retention, and journey impact on existing relationships.`;
    evidence.push('Journey friction scores · support load · retention cohort signals');
    concerns.push('Scale before experience readiness amplifies churn risk');
    opportunities.push('Improved onboarding compounds lifetime value from new demand');
    confidence = 86;
  } else if (executive.id === 'strategy-concierge') {
    analysis = `Strategy identifies long-term implications and alignment with organizational legacy.`;
    evidence.push('Competitive positioning · founder philosophy · multi-year trajectory');
    if (ctx.riskTolerance) {
      evidence.push(`Decision DNA risk tolerance: ${ctx.riskTolerance}`);
    }
    concerns.push('Short-term revenue gains that conflict with enduring brand promise');
    opportunities.push('Disciplined growth strengthens institutional reputation over decades');
    confidence = 83;
  } else if (executive.id === 'revenue-concierge') {
    analysis = `Revenue evaluates monetization paths, pricing leverage, and pipeline quality.`;
    evidence.push('Conversion funnel · tier mix · recurring revenue composition');
    opportunities.push('Expand high-LTV segments before broad acquisition');
    concerns.push('Discounting to hit targets erodes long-term pricing power');
    confidence = 80;
  } else if (executive.id === 'legal-concierge') {
    analysis = `Legal surfaces compliance exposure and contractual obligations tied to this decision.`;
    evidence.push('Regulatory scope · vendor terms · data handling requirements');
    concerns.push('Rapid expansion without legal review creates latent liability');
    confidence = 77;
  } else if (executive.id === 'research-concierge') {
    analysis = `Research validates assumptions with market intelligence and competitive evidence.`;
    evidence.push('Competitive scan · category trends · customer research gaps');
    opportunities.push('Evidence-backed positioning reduces guesswork in go-to-market');
    confidence = 76;
  } else if (executive.id === 'production-concierge') {
    analysis = `Production assesses delivery timelines, quality gates, and resource allocation.`;
    evidence.push('Production queue depth · approval cycle · render/delivery capacity');
    concerns.push('Parallel initiatives may delay flagship deliverables');
    confidence = 78;
  } else {
    analysis = `${executive.name} contributes ${executive.department} perspective: ${executive.focus}.`;
    evidence.push(`${executive.department} readiness signals · cross-functional dependencies`);
  }

  if (ctx.healthScore !== undefined && ctx.healthScore < 70) {
    concerns.push(`Executive Health at ${ctx.healthScore}% — address weak areas before aggressive moves`);
    confidence -= 4;
  }
  if (ctx.memoryHint) {
    evidence.push(`Organizational memory: ${ctx.memoryHint}`);
  }
  if (ctx.successionHint) {
    concerns.push(`Succession consideration: ${ctx.successionHint}`);
  }

  return {
    id: `contrib-${executive.id}-${Date.now()}`,
    executiveId: executive.id,
    executiveName: executive.name,
    department: executive.department,
    analysis,
    evidence,
    concerns,
    opportunities,
    confidencePct: Math.max(55, Math.min(95, confidence)),
    stance: stanceFromConfidence(confidence),
  };
}

export function generateExecutiveContributions(
  organizationId: string,
  query: string,
  roster: DigitalExecutive[]
): ExecutiveContribution[] {
  const ctx = loadCouncilContext(organizationId);
  const participants = selectExecutivesForQuery(query, roster);
  return participants.map((exec) => buildContribution(exec, query, ctx));
}
