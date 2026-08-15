export type AioRoadmapItemStatus = 'complete' | 'in-progress' | 'needed' | 'optional';

export interface AioRoadmapItem {
  id: string;
  label: string;
  status: AioRoadmapItemStatus;
}

export interface AioIntentCard {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: 'startup' | 'legal' | 'compliance' | 'dispatch' | 'freight' | 'insurance';
}

export interface AioServiceDivision {
  id: string;
  title: string;
  slug: string;
  icon: 'permitting' | 'formation' | 'insurance' | 'dispatching' | 'brokerage';
}

export interface AioBusinessStep {
  step: string;
  title: string;
  subtitle: string;
}

export interface AioDashboardMetric {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
}

export interface AioLoadPreview {
  id: string;
  origin: string;
  destination: string;
  pickup: string;
  delivery: string;
  rate: string;
  mileage: string;
  status: string;
}

export interface AioPortalNavItem {
  id: string;
  label: string;
  href: string;
  active?: boolean;
}
