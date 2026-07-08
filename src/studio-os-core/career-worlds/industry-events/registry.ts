import type { CareerWorldEventCategory, CareerWorldEventInstance } from '../core/schemas';

export type IndustryEventTemplate = {
  id: string;
  title: string;
  category: CareerWorldEventCategory;
  description: string;
  durationDays: number;
  economyImpact: number;
  reputationImpact: number;
};

/** Generic event templates — professions customize via blueprint hooks, not hardcoded logic. */
export const INDUSTRY_EVENT_TEMPLATES: IndustryEventTemplate[] = [
  {
    id: 'industry-conference',
    title: 'Industry Conference',
    category: 'industry-conference',
    description: 'Professionals gather for keynotes, networking, and certification opportunities.',
    durationDays: 3,
    economyImpact: 0.05,
    reputationImpact: 4,
  },
  {
    id: 'client-emergency',
    title: 'Client Emergency',
    category: 'client-emergency',
    description: 'A high-priority client needs immediate professional attention.',
    durationDays: 1,
    economyImpact: 0.02,
    reputationImpact: 6,
  },
  {
    id: 'product-launch',
    title: 'Product Launch',
    category: 'product-launch',
    description: 'A major launch reshapes market attention and client demand.',
    durationDays: 5,
    economyImpact: 0.08,
    reputationImpact: 3,
  },
  {
    id: 'competition',
    title: 'Professional Competition',
    category: 'competition',
    description: 'Peers compete for recognition, clients, and industry awards.',
    durationDays: 7,
    economyImpact: 0.03,
    reputationImpact: 8,
  },
  {
    id: 'economic-shift',
    title: 'Economic Shift',
    category: 'economic-shift',
    description: 'Market conditions change client budgets and hiring patterns.',
    durationDays: 14,
    economyImpact: -0.06,
    reputationImpact: 0,
  },
  {
    id: 'trend-change',
    title: 'Trend Change',
    category: 'trend-change',
    description: 'A new industry trend opens opportunities for early adopters.',
    durationDays: 21,
    economyImpact: 0.04,
    reputationImpact: 2,
  },
  {
    id: 'certification-exam',
    title: 'Certification Exam Window',
    category: 'certification-exam',
    description: 'Certification bodies open examination and credentialing periods.',
    durationDays: 5,
    economyImpact: 0,
    reputationImpact: 5,
  },
  {
    id: 'community-collaboration',
    title: 'Community Collaboration',
    category: 'community-collaboration',
    description: 'Professionals collaborate on a shared community challenge.',
    durationDays: 10,
    economyImpact: 0.01,
    reputationImpact: 3,
  },
  {
    id: 'technology-change',
    title: 'Technology Change',
    category: 'technology-change',
    description: 'New tools or methods reshape how the profession operates.',
    durationDays: 30,
    economyImpact: 0.06,
    reputationImpact: 4,
  },
  {
    id: 'seasonal-challenge',
    title: 'Seasonal Challenge',
    category: 'seasonal-challenge',
    description: 'A time-limited seasonal opportunity unique to this period.',
    durationDays: 14,
    economyImpact: 0.02,
    reputationImpact: 2,
  },
];

export function spawnEventFromTemplate(
  template: IndustryEventTemplate,
  startDay: number
): CareerWorldEventInstance {
  return {
    id: `${template.id}-${startDay}-${Date.now()}`,
    templateId: template.id,
    title: template.title,
    category: template.category,
    startsDay: startDay,
    endsDay: startDay + template.durationDays,
    status: 'active',
    impactSummary: template.description,
  };
}

export function pickRandomEventTemplate(): IndustryEventTemplate {
  const index = Math.floor(Math.random() * INDUSTRY_EVENT_TEMPLATES.length);
  return INDUSTRY_EVENT_TEMPLATES[index]!;
}
