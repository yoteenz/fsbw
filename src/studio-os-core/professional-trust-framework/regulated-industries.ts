import type { RegulatedIndustryRule } from './types';
import { REGULATED_PROFESSIONS } from './constants';

const INDUSTRY_PROFESSION_MAP: Record<string, (typeof REGULATED_PROFESSIONS)[number][]> = {
  'law-firm': ['law', 'compliance'],
  medical: ['medicine', 'healthcare', 'compliance'],
  dental: ['medicine', 'healthcare'],
  'financial-services': ['taxes', 'accounting', 'financial-planning', 'insurance'],
  insurance: ['insurance', 'compliance'],
  construction: ['construction', 'engineering', 'architecture'],
  restaurant: ['food-safety', 'compliance'],
};

export function buildRegulatedIndustryRules(industryId: string): RegulatedIndustryRule[] {
  const professions = INDUSTRY_PROFESSION_MAP[industryId] ?? [];
  if (professions.length === 0) {
    return REGULATED_PROFESSIONS.slice(0, 4).map((profession) => ({
      profession,
      industryId: 'general',
      additionalRequirements: [`${profession} actions require scope review when applicable.`],
      reviewRequiredActions: ['Final submission', 'Licensed sign-off'],
    }));
  }

  return professions.map((profession) => ({
    profession,
    industryId,
    additionalRequirements: getAdditionalRequirements(profession),
    reviewRequiredActions: getReviewRequiredActions(profession),
  }));
}

function getAdditionalRequirements(profession: (typeof REGULATED_PROFESSIONS)[number]): string[] {
  const map: Partial<Record<(typeof REGULATED_PROFESSIONS)[number], string[]>> = {
    law: ['No legal opinions without attorney review', 'Conflict checks mandatory'],
    taxes: ['Licensed preparer review before filing', 'Document retention standards'],
    medicine: ['No diagnosis without licensed clinician', 'HIPAA-aware communication'],
    accounting: ['CPA review for attestations', 'GAAP compliance awareness'],
    construction: ['Permit and code compliance review', 'Licensed contractor sign-off'],
    'food-safety': ['Health department standards', 'Allergen disclosure requirements'],
  };
  return map[profession] ?? [`${profession} professional review when outcomes affect customers.`];
}

function getReviewRequiredActions(profession: (typeof REGULATED_PROFESSIONS)[number]): string[] {
  return [
    'Final customer-facing decisions',
    'Regulatory submissions',
    `${profession} licensed sign-off`,
  ];
}
