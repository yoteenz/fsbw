import type { SimulationDepth, SimulationType, TimelineHorizon } from './types';

export const SIMULATION_ENGINE_STORAGE_KEY = 'studioOsSimulationEngine_v1';
export const SIMULATION_ENGINE_VERSION = 1;

export const SIMULATION_TYPE_LABELS: Record<SimulationType, string> = {
  'new-business-launch': 'New Business Launch',
  'product-launch': 'Product Launch',
  'pricing-change': 'Pricing Change',
  'subscription-change': 'Subscription Change',
  'marketing-campaign': 'Marketing Campaign',
  'brand-partnership': 'Brand Partnership',
  'content-strategy': 'Content Strategy',
  'marketplace-participation': 'Marketplace Participation',
  'new-hire': 'New Hire',
  layoff: 'Layoff',
  'team-expansion': 'Team Expansion',
  'new-workspace': 'New Workspace Creation',
  'budget-allocation': 'Budget Allocation',
  'advertising-spend': 'Advertising Spend',
  'affiliate-program': 'Affiliate Program',
  'inventory-planning': 'Inventory Planning',
  'automation-investment': 'Automation Investment',
  'software-cost': 'Software Costs',
  'international-expansion': 'International Expansion',
  'new-revenue-stream': 'New Revenue Stream',
  acquisition: 'Acquisition',
  merger: 'Merger',
  licensing: 'Licensing',
  custom: 'Custom Simulation',
};

export const SIMULATION_DEPTH_LABELS: Record<SimulationDepth, string> = {
  quick: 'Quick',
  standard: 'Standard',
  deep: 'Deep',
  strategic: 'Strategic',
};

export const TIMELINE_HORIZON_LABELS: Record<TimelineHorizon, string> = {
  '30-day': '30 Days',
  '90-day': '90 Days',
  '6-month': '6 Months',
  '1-year': '1 Year',
  '3-year': '3 Years',
  '5-year': '5 Years',
};

export const SIMULATION_BUILDER_STEPS = [
  'Choose Scenario',
  'Select Workspace',
  'Define Assumptions',
  'Select Depth',
  'Run Simulation',
] as const;

export const SIMULATION_DATA_SOURCES = [
  'Workspace History',
  'Company DNA',
  'Creative DNA',
  'Memory Bible',
  'Knowledge Graph',
  'Studio Intelligence',
  'Studio OS Labs',
  'Ecosystem Benchmarks',
  'Approved Assumptions',
] as const;
