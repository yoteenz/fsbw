import type { IndustryId } from '../industry-architecture/types';
import type { MonitoringCategory } from './types';

export type IndustryFilterProfile = {
  summary: string;
  priorityCategories: MonitoringCategory[];
  exampleFocus: string[];
};

const INDUSTRY_FILTERS: Partial<Record<IndustryId, IndustryFilterProfile>> = {
  'law-firm': {
    summary: 'Court rulings · legislative updates · legal technology — filtered for your practice.',
    priorityCategories: ['legislation', 'government-regulations', 'industry-news', 'technology-advances', 'professional-certifications'],
    exampleFocus: ['Court rulings', 'Legislative updates', 'Legal technology'],
  },
  painting: {
    summary: 'Material pricing · contractor regulations · housing market — filtered for field operations.',
    priorityCategories: ['market-trends', 'government-regulations', 'economic-indicators', 'consumer-behavior', 'competitor-activity'],
    exampleFocus: ['Material pricing', 'Contractor regulations', 'Housing market'],
  },
  contractor: {
    summary: 'Material pricing · contractor regulations · housing market — filtered for field operations.',
    priorityCategories: ['market-trends', 'government-regulations', 'economic-indicators', 'consumer-behavior', 'competitor-activity'],
    exampleFocus: ['Material pricing', 'Contractor regulations', 'Housing market'],
  },
  construction: {
    summary: 'Material pricing · safety regulations · housing market — filtered for construction operations.',
    priorityCategories: ['government-regulations', 'market-trends', 'economic-indicators', 'security-risks', 'legislation'],
    exampleFocus: ['Material pricing', 'Safety regulations', 'Housing market'],
  },
  beauty: {
    summary: 'Beauty trends · manufacturing · shipping · social media — filtered for your brand.',
    priorityCategories: ['social-trends', 'consumer-behavior', 'market-trends', 'competitor-activity', 'platform-updates'],
    exampleFocus: ['Beauty trends', 'Manufacturing', 'Shipping', 'Social media trends'],
  },
  creator: {
    summary: 'Platform updates · social trends · AI tools · audience behavior — filtered for creators.',
    priorityCategories: ['platform-updates', 'social-trends', 'artificial-intelligence', 'consumer-behavior', 'competitor-activity'],
    exampleFocus: ['Platform algorithm changes', 'Content trends', 'Monetization shifts'],
  },
  ecommerce: {
    summary: 'Consumer behavior · platform updates · shipping · competitor pricing — filtered for commerce.',
    priorityCategories: ['consumer-behavior', 'platform-updates', 'market-trends', 'economic-indicators', 'competitor-activity'],
    exampleFocus: ['Shopping behavior', 'Marketplace policy', 'Fulfillment costs'],
  },
  medical: {
    summary: 'Regulations · certifications · technology · patient trends — filtered for healthcare.',
    priorityCategories: ['government-regulations', 'professional-certifications', 'technology-advances', 'legislation', 'security-risks'],
    exampleFocus: ['Healthcare regulations', 'Clinical technology', 'Compliance updates'],
  },
  dental: {
    summary: 'Dental regulations · certifications · patient trends — filtered for dental practice.',
    priorityCategories: ['government-regulations', 'professional-certifications', 'technology-advances', 'consumer-behavior'],
    exampleFocus: ['Dental board updates', 'Clinical technology', 'Patient expectations'],
  },
  restaurant: {
    summary: 'Food safety · labor regulations · consumer dining trends — filtered for hospitality.',
    priorityCategories: ['government-regulations', 'consumer-behavior', 'economic-indicators', 'legislation', 'market-trends'],
    exampleFocus: ['Food safety rules', 'Labor costs', 'Dining trends'],
  },
  agency: {
    summary: 'Client industries · platform updates · AI creative tools · market shifts — filtered for agencies.',
    priorityCategories: ['artificial-intelligence', 'platform-updates', 'market-trends', 'competitor-activity', 'social-trends'],
    exampleFocus: ['AI creative tools', 'Platform policy', 'Client industry shifts'],
  },
};

const DEFAULT_FILTER: IndustryFilterProfile = {
  summary: 'Industry news · regulations · technology · market trends — filtered for your organization.',
  priorityCategories: [
    'industry-news',
    'market-trends',
    'government-regulations',
    'technology-advances',
    'economic-indicators',
  ],
  exampleFocus: ['Industry news', 'Regulations', 'Technology advances'],
};

export function getIndustryFilterProfile(industryId: string): IndustryFilterProfile {
  return INDUSTRY_FILTERS[industryId as IndustryId] ?? DEFAULT_FILTER;
}

export function computeCategoryRelevance(
  category: MonitoringCategory,
  industryId: string
): number {
  const filter = getIndustryFilterProfile(industryId);
  const priorityIndex = filter.priorityCategories.indexOf(category);
  if (priorityIndex >= 0) return 95 - priorityIndex * 8;
  if (category === 'security-risks' || category === 'software-updates') return 72;
  if (category === 'artificial-intelligence') return 68;
  return 45;
}

export function shouldSurfaceSignal(relevancePct: number): boolean {
  return relevancePct >= 65;
}
