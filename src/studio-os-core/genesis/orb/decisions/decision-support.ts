import { buildHeadquartersCompanyProjection } from '../../executive-headquarters/projections/company-projection';
import type { OrbDecisionDraft } from '../types';

/** Decision Support — Universal Decision Engine™ adapter */
export function buildOrbDecisionDrafts(): OrbDecisionDraft[] {
  const company = buildHeadquartersCompanyProjection();
  return [
    {
      decisionId: 'dec-launch-priority',
      frame: `Should ${company.companyDisplayName} prioritize platform readiness or department wing expansion this week?`,
      options: [
        {
          label: 'Platform readiness',
          tradeoff: 'Delays visible department expansion',
          reversibility: 'High — can revisit next week',
        },
        {
          label: 'Department wing expansion',
          tradeoff: 'May reduce focus on core Launch Stack stability',
          reversibility: 'Medium — expansion previews are reversible',
        },
        {
          label: 'Split focus with guarded milestones',
          tradeoff: 'Increases cognitive load',
          reversibility: 'High',
        },
      ],
      evidence: [
        'Mission queue has one blocked and one awaiting-approval item',
        'Company pulse trending upward on operations and CX',
      ],
      confidence: 0.82,
      recommendedOption: 'Platform readiness',
      stakeholders: ['Founder', 'Operations', 'Strategy'],
      sourceSystems: ['Decision Engine™', 'Mission Engine™', 'Company Health Index™'],
    },
  ];
}
