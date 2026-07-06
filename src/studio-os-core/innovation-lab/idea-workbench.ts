import type { IdeaWorkbench } from './types';

type IdeaTemplateInput = {
  title: string;
  category: string;
  sourceId: string;
  stage: string;
  confidencePct: number;
  revenuePotentialScore: number;
};

function difficultyFromScore(revenue: number, confidence: number): IdeaWorkbench['difficulty'] {
  const avg = (revenue + confidence) / 2;
  if (avg >= 75) return 'high';
  if (avg >= 55) return 'medium';
  return 'low';
}

function riskFromStage(stage: string): IdeaWorkbench['risk'] {
  if (stage === 'archived' || stage === 'completed') return 'low';
  if (stage === 'prototype' || stage === 'testing' || stage === 'launching') return 'medium';
  if (stage === 'discovered' || stage === 'researching') return 'medium';
  return 'low';
}

export function buildIdeaWorkbench(
  idea: IdeaTemplateInput,
  organizationId: string,
  companyName: string,
  industryId: string
): IdeaWorkbench {
  const difficulty = difficultyFromScore(idea.revenuePotentialScore, idea.confidencePct);
  const risk = riskFromStage(idea.stage);

  const departments =
    idea.category.includes('marketing') || idea.category === 'marketing-campaigns'
      ? ['Marketing', 'Creative', 'Distribution']
      : idea.category.includes('automation') || idea.category === 'workflows'
        ? ['Operations', 'Technology', 'Finance']
        : idea.category.includes('course') || idea.category.includes('knowledge')
          ? ['Studio Institute', 'Knowledge Commerce', 'Marketing']
          : ['Strategy', 'Operations', 'Finance'];

  return {
    executiveSummary: `${idea.title} — generated from ${idea.sourceId.replace(/-/g, ' ')} for ${companyName}. Confidence ${idea.confidencePct}%.`,
    problemBeingSolved: `A recurring gap in ${industryId.replace(/-/g, ' ')} — customers and operations signal demand for ${idea.category.replace(/-/g, ' ')} innovation.`,
    opportunityAnalysis: `Market alignment strong — revenue potential score ${idea.revenuePotentialScore}%. Fits organizational capabilities and ${companyName} brand positioning.`,
    potentialCustomers: `Existing customers · adjacent market segments · ${industryId.replace(/-/g, ' ')} professionals seeking structured solutions.`,
    revenuePotential:
      idea.revenuePotentialScore >= 75
        ? `High — estimated ${idea.revenuePotentialScore}% revenue potential within 12 months.`
        : idea.revenuePotentialScore >= 60
          ? `Moderate — ${idea.revenuePotentialScore}% potential with phased launch.`
          : `Exploratory — ${idea.revenuePotentialScore}% potential; validate before investment.`,
    difficulty,
    risk,
    requiredDepartments: departments,
    prototypeStatus:
      idea.stage === 'prototype' || idea.stage === 'testing'
        ? 'Concept mockups and workflow diagrams prepared — awaiting founder review.'
        : idea.stage === 'approved' || idea.stage === 'launching'
          ? 'Prototype validated — launch assets in preparation.'
          : idea.stage === 'completed'
            ? 'Launched and operational.'
            : idea.stage === 'archived'
              ? 'Archived for future reference — searchable in Innovation Lab.'
              : 'Early concept — research phase active.',
    research: `Evidence gathered from ${idea.sourceId.replace(/-/g, ' ')} · customer patterns · competitive landscape · historical performance for org ${organizationId.slice(0, 8)}.`,
    executiveCouncilFeedback: `Council reviewed feasibility — recommends ${idea.stage === 'archived' ? 'archiving with lessons preserved' : 'continuing to ' + idea.stage} with cross-department validation.`,
    founderNotes: 'Add founder perspective, constraints, and strategic alignment notes here.',
    supportingFiles: ['Opportunity Brief.pdf', 'Market Research Summary.pdf', 'Prototype Concept.png'],
    innovationTimeline: [
      `Discovered — sourced from ${idea.sourceId.replace(/-/g, ' ')}`,
      idea.stage !== 'discovered' ? `Advanced to ${idea.stage}` : 'Research scheduled',
      idea.revenuePotentialScore >= 70 ? 'Revenue opportunity flagged' : 'Validation in progress',
    ],
  };
}
