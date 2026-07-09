import type { BusinessVisualizationId } from './business-types';

export const BUSINESS_COMPANY_GENOME_STORAGE_KEY = 'studioOsBusinessCompanyGenome_v1';
export const BUSINESS_COMPANY_GENOME_VERSION = '1.0.0';
export const BUSINESS_COMPANY_GENOME_UPDATED_EVENT = 'studio-os-business-company-genome-updated';

export const BUSINESS_GENOME_PHILOSOPHY = [
  'Companies are living organisms — not static diagrams',
  'Every system owns data, produces events, and depends on others',
  'The genome maps how the business actually operates',
  'Dependencies, flows, risks, and opportunities stay current',
] as const;

export const BUSINESS_VISUALIZATIONS: {
  id: BusinessVisualizationId;
  label: string;
  description: string;
}[] = [
  {
    id: 'interactive-genome',
    label: 'INTERACTIVE GENOME',
    description: 'Full business organism — engines, systems, and connections',
  },
  {
    id: 'dependency-graph',
    label: 'DEPENDENCY GRAPH',
    description: 'Upstream and downstream system dependencies',
  },
  {
    id: 'revenue-flow',
    label: 'REVENUE FLOW',
    description: 'Money path from product to payment to repeat purchase',
  },
  {
    id: 'customer-journey',
    label: 'CUSTOMER JOURNEY',
    description: 'Visitor to advocate lifecycle across customer systems',
  },
  {
    id: 'founder-workflow',
    label: 'FOUNDER WORKFLOW',
    description: 'Vision to campaign to revenue founder decision chain',
  },
  {
    id: 'automation-map',
    label: 'AUTOMATION MAP',
    description: 'Automation opportunities ranked by impact and priority',
  },
  {
    id: 'risk-map',
    label: 'RISK MAP',
    description: 'Operational risks, bottlenecks, and single points of failure',
  },
  {
    id: 'ai-opportunity-map',
    label: 'AI OPPORTUNITY MAP',
    description: 'AI readiness and opportunity landscape by horizon',
  },
];

export const BUSINESS_ENGINE_LABELS = {
  desire: 'DESIRE ENGINE',
  product: 'PRODUCT ENGINE',
  client: 'CLIENT ENGINE',
  revenue: 'REVENUE ENGINE',
  operating: 'OPERATING ENGINE',
} as const;
