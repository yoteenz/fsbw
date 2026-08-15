import { AIO_STORAGE_KEYS, readStorage, writeStorage } from '../storage/demoStorage';

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
    return readStorage(AIO_STORAGE_KEYS.servicePlan, []);
  }

  save(items: ServicePlanItem[]): void {
    writeStorage(AIO_STORAGE_KEYS.servicePlan, items);
  }

  add(item: ServicePlanItem): void {
    const current = this.load();
    if (current.some((i) => i.slug === item.slug)) return;
    this.save([...current, item]);
    window.dispatchEvent(new Event('aio-service-plan-change'));
  }

  remove(slug: string): void {
    this.save(this.load().filter((i) => i.slug !== slug));
    window.dispatchEvent(new Event('aio-service-plan-change'));
  }

  clear(): void {
    writeStorage(AIO_STORAGE_KEYS.servicePlan, []);
  }
}

export const servicePlanRepository = new LocalDemoServicePlanRepository();
