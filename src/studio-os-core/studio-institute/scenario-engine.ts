import type { OrganizationProfessionBrainProfile } from '../profession-brain/types';
import type { InstituteScenario } from './types';

const SCENARIO_TEMPLATES: { match: RegExp; title: string; teachFocus: string }[] = [
  { match: /receipt|mileage|fuel/i, title: 'Customer forgot receipts', teachFocus: 'Reconcile without panic — professional judgment from Fuel Tax Brain.' },
  { match: /reconcile|report|filing/i, title: 'Fuel report does not reconcile', teachFocus: 'Trace exceptions before filing — preserve compliance and client trust.' },
  { match: /estimate|paint|reject/i, title: 'Painting estimate was rejected', teachFocus: 'Surface prep standards and scope communication.' },
  { match: /dispatch|delay|shipment/i, title: 'Shipment delayed · crew reroute', teachFocus: 'Customer commitments vs operational reality.' },
  { match: /membership|dispute|refund/i, title: 'Membership dispute', teachFocus: 'Policy + empathy — CX without abandoning standards.' },
  { match: /late|notice|deadline/i, title: 'Late filing notice received', teachFocus: 'Escalation paths and licensed review when required.' },
  { match: /mistake|error|wrong/i, title: 'Employee mistake detected', teachFocus: 'Living knowledge update — strengthen the Profession Brain.' },
];

export function generateScenariosFromProfile(
  profile: OrganizationProfessionBrainProfile
): InstituteScenario[] {
  const scenarios: InstituteScenario[] = [];

  for (const brain of profile.brains) {
    for (const pattern of brain.judgmentPatterns.slice(0, 3)) {
      scenarios.push({
        id: `scenario-${brain.id}-${pattern.id}`,
        brainId: brain.id,
        title: pattern.situation,
        narrative: pattern.professionalResponse,
        teachFocus: pattern.notJustProcedure || pattern.reasoning,
        audiences: ['employee', 'manager', 'executive'],
        difficulty: 'intermediate',
        decisionBased: true,
      });
    }

    for (const template of SCENARIO_TEMPLATES) {
      const hits = brain.knowledgeEntries.some(
        (e) => template.match.test(e.title) || template.match.test(e.what)
      );
      if (hits) {
        scenarios.push({
          id: `scenario-tpl-${brain.id}-${template.title.replace(/\s+/g, '-').toLowerCase()}`,
          brainId: brain.id,
          title: template.title,
          narrative: `Realistic ${brain.label} scenario — ${template.title.toLowerCase()}.`,
          teachFocus: template.teachFocus,
          audiences: ['employee', 'manager', 'customer'],
          difficulty: 'foundational',
          decisionBased: true,
        });
      }
    }
  }

  return scenarios.slice(0, 24);
}
