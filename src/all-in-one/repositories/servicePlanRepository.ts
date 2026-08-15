import { getStore, addToServicePlan, removeFromServicePlan } from '../demo/demoActions';
import { resetDemoStore, updateDemoStore } from '../demo/demoStore';

export interface ServicePlanItem {
  slug: string;
  title: string;
  division: string;
  addedAt: string;
  reason?: string;
  fromRoadmap?: boolean;
}

export interface ServicePlanRepository {
  load(): ServicePlanItem[];
  save(items: ServicePlanItem[]): void;
  add(item: ServicePlanItem): void;
  remove(slug: string): void;
  clear(): void;
}

export class LocalDemoServicePlanRepository implements ServicePlanRepository {
  load(): ServicePlanItem[] {
    return getStore().servicePlan;
  }

  save(items: ServicePlanItem[]): void {
    updateDemoStore((s) => {
      s.servicePlan = items;
      return s;
    });
  }

  add(item: ServicePlanItem): void {
    addToServicePlan(item);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('aio-service-plan-change'));
  }

  remove(slug: string): void {
    removeFromServicePlan(slug);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('aio-service-plan-change'));
  }

  clear(): void {
    resetDemoStore();
  }
}

export const servicePlanRepository = new LocalDemoServicePlanRepository();
