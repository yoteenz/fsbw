import type { ExperienceLabIndustryPackOption, ExperienceLabIndustryPackOptionId } from './contract';

/** Experience Lab entry — Industry Pack selection replaces company switcher. */
export const EXPERIENCE_LAB_INDUSTRY_PACK_OPTIONS: ExperienceLabIndustryPackOption[] = [
  { optionId: 'hair-brand', displayName: 'Hair Brand', description: 'Full beauty brand headquarters', industryPackId: 'official-hair-brand', archetypeId: 'beauty' },
  { optionId: 'hair-salon', displayName: 'Hair Salon', description: 'Salon operations HQ', industryPackId: 'official-hair-salon', archetypeId: 'beauty' },
  { optionId: 'medical-practice', displayName: 'Medical Practice', description: 'Clinical practice HQ', industryPackId: 'official-doctor', archetypeId: 'healthcare' },
  { optionId: 'law-firm', displayName: 'Law Firm', description: 'Professional services HQ', industryPackId: 'official-law-firm', archetypeId: 'professional-services' },
  { optionId: 'real-estate', displayName: 'Real Estate', description: 'Brokerage HQ', industryPackId: 'official-realtor', archetypeId: 'real-estate' },
  { optionId: 'architecture', displayName: 'Architecture', description: 'Design firm HQ', industryPackId: 'official-architecture-firm', archetypeId: 'professional-services' },
  { optionId: 'restaurant', displayName: 'Restaurant', description: 'Restaurant HQ', industryPackId: 'official-restaurant', archetypeId: 'food-beverage' },
  { optionId: 'fitness', displayName: 'Fitness', description: 'Gym and studio HQ', industryPackId: 'official-fitness', archetypeId: 'fitness' },
  { optionId: 'creator', displayName: 'Creator', description: 'Creator studio HQ', industryPackId: 'official-marketing-agency', archetypeId: 'creative' },
  { optionId: 'agency', displayName: 'Agency', description: 'Marketing agency HQ', industryPackId: 'official-marketing-agency', archetypeId: 'creative' },
  { optionId: 'education', displayName: 'Education', description: 'Academy HQ', industryPackId: 'official-education-campus', archetypeId: 'education' },
  { optionId: 'e-commerce', displayName: 'E-Commerce', description: 'Retail operations HQ', industryPackId: 'official-boutique', archetypeId: 'retail' },
  { optionId: 'technology', displayName: 'Technology', description: 'Tech company HQ', industryPackId: 'official-technology-campus', archetypeId: 'technology' },
  { optionId: 'nonprofit', displayName: 'Nonprofit', description: 'Mission-driven HQ', industryPackId: 'official-nonprofit-hq', archetypeId: 'non-profit' },
  { optionId: 'hospitality', displayName: 'Hospitality', description: 'Hotel and venue HQ', industryPackId: 'official-hospitality-hq', archetypeId: 'hospitality' },
  { optionId: 'corporate', displayName: 'Corporate', description: 'Corporate headquarters', industryPackId: 'official-corporate-hq', archetypeId: 'professional-services' },
  { optionId: 'government', displayName: 'Government', description: 'Civic operations HQ', industryPackId: 'official-government-hq', archetypeId: 'government' },
  { optionId: 'custom-blank', displayName: 'Custom Blank Pack', description: 'Start from empty canonical shell', industryPackId: 'official-custom-blank', archetypeId: 'custom' },
];

export function getExperienceLabPackOption(optionId: ExperienceLabIndustryPackOptionId): ExperienceLabIndustryPackOption | undefined {
  return EXPERIENCE_LAB_INDUSTRY_PACK_OPTIONS.find((o) => o.optionId === optionId);
}

export function listExperienceLabPackOptions(): ExperienceLabIndustryPackOption[] {
  return [...EXPERIENCE_LAB_INDUSTRY_PACK_OPTIONS];
}
