import type { BriefingCadence, BusinessHealthCategory } from './types';

export const STUDIO_INTELLIGENCE_STORAGE_KEY = 'studioOsIntelligence_v1';
export const STUDIO_INTELLIGENCE_VERSION = 1;

export const BRIEFING_CADENCE_LABELS: Record<BriefingCadence, string> = {
  morning: 'Morning Briefing',
  weekly: 'Weekly Briefing',
  monthly: 'Monthly Briefing',
  quarterly: 'Quarterly Briefing',
};

export const BUSINESS_HEALTH_CATEGORY_LABELS: Record<BusinessHealthCategory, string> = {
  financial: 'Financial Health',
  growth: 'Growth',
  operations: 'Operations',
  automation: 'Automation',
  'customer-satisfaction': 'Customer Satisfaction',
  'brand-strength': 'Brand Strength',
  marketplace: 'Marketplace Activity',
  'team-health': 'Team Health',
  'risk-exposure': 'Risk Exposure',
  'knowledge-maturity': 'Knowledge Maturity',
};

export const CONNECTED_SYSTEMS = [
  'Company DNA',
  'Creative DNA',
  'Memory Bible',
  'Writing Bible',
  'Knowledge Graph',
  'Growth Network',
  'Talent Network',
  'Marketplace',
  'Business Model Engine',
  'Studio OS Labs',
  'Governance',
  'Ecosystem',
] as const;
