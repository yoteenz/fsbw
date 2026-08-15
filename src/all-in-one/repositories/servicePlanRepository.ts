import { demoServicePlanRepository } from '../data/repositories/demoRepositories';

export interface ServicePlanItem {
  slug: string;
  title: string;
  division: string;
  addedAt: string;
  reason?: string;
  fromRoadmap?: boolean;
}

export type { ServicePlanRepository } from '../data/repositories/types';

/** @deprecated Prefer useAioRepositories() */
export const servicePlanRepository = demoServicePlanRepository;
