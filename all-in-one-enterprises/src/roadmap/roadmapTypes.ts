export type RoadmapItemStatus =
  | 'completed'
  | 'in_progress'
  | 'recommended'
  | 'needs_review'
  | 'not_sure'
  | 'optional'
  | 'not_applicable';

export type RoadmapCategory =
  | 'business'
  | 'authority'
  | 'registration'
  | 'tax'
  | 'insurance'
  | 'compliance'
  | 'operations'
  | 'factoring'
  | 'brokerage';

export interface RoadmapItem {
  id: string;
  category: RoadmapCategory;
  title: string;
  description: string;
  status: RoadmapItemStatus;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  acronym?: string;
  acronymExplanation?: string;
  serviceAvailable: boolean;
  serviceSlug?: string;
  requiredForProgress: boolean;
  source: 'intake' | 'rule' | 'goal';
}

export interface RoadmapResult {
  items: RoadmapItem[];
  complianceProgress: number;
  businessServicesProgress: number;
  generatedAt: string;
  summary: string;
  crossSellRecommendations: CrossSellRecommendation[];
}

export interface CrossSellRecommendation {
  id: string;
  title: string;
  message: string;
  serviceSlug: string;
}

export const ROADMAP_CATEGORY_LABELS: Record<RoadmapCategory, string> = {
  business: 'Business Foundation',
  authority: 'Authority',
  registration: 'Registration & Tax',
  tax: 'Registration & Tax',
  insurance: 'Protection',
  compliance: 'Compliance',
  operations: 'Operations',
  factoring: 'Cash Flow',
  brokerage: 'Brokerage',
};

export const ROADMAP_STATUS_LABELS: Record<RoadmapItemStatus, string> = {
  completed: 'Complete',
  in_progress: 'In Progress',
  recommended: 'Recommended',
  needs_review: 'Needs Review',
  not_sure: 'Not Sure',
  optional: 'Optional',
  not_applicable: 'N/A',
};

export const ACRONYM_GLOSSARY: Record<string, string> = {
  IRP: 'Apportioned vehicle registration used by qualifying interstate commercial carriers.',
  IFTA: 'A system used by qualifying interstate carriers to report and distribute fuel taxes.',
  'BOC-3': 'A filing that designates process agents for certain federally regulated motor carriers.',
  USDOT: 'A unique identifier assigned by the U.S. Department of Transportation for safety monitoring.',
  MC: 'Motor carrier operating authority issued by the FMCSA for interstate commerce.',
};
