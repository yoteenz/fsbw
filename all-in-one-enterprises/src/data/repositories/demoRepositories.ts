import { defaultIntakeAnswers } from '../../intake/intakeTypes';
import {
  getStore,
  saveIntake,
  saveRoadmap,
  saveServicePlan,
  addToServicePlan,
  removeFromServicePlan,
  submitServiceRequest,
  updateRequestStatus,
  assignRequest,
} from '../../demo/demoActions';
import { loadDemoStore, resetDemoStore } from '../../demo/demoStore';
import type {
  IntakeRepository,
  OperationalDataRepository,
  RoadmapRepository,
  ServicePlanRepository,
  ServiceRequestRepository,
  SubmitRequestPayload,
} from './types';

export class DemoIntakeRepository implements IntakeRepository {
  load() {
    return getStore().intake;
  }

  async save(answers: ReturnType<IntakeRepository['load']>) {
    if (!answers) return;
    saveIntake(answers);
  }

  clear() {
    resetDemoStore();
  }
}

export class DemoRoadmapRepository implements RoadmapRepository {
  load() {
    return getStore().roadmap;
  }

  async save(result: NonNullable<ReturnType<RoadmapRepository['load']>>) {
    saveRoadmap(result);
  }

  clear() {
    resetDemoStore();
  }
}

export class DemoServicePlanRepository implements ServicePlanRepository {
  load() {
    return getStore().servicePlan;
  }

  async save(items: ReturnType<ServicePlanRepository['load']>) {
    saveServicePlan(items);
  }

  async add(item: ReturnType<ServicePlanRepository['load']>[number]) {
    addToServicePlan(item);
  }

  async remove(slug: string) {
    removeFromServicePlan(slug);
  }

  clear() {
    resetDemoStore();
  }
}

export class DemoServiceRequestRepository implements ServiceRequestRepository {
  async loadAll() {
    return getStore().requests;
  }

  async getById(id: string) {
    return getStore().requests.find((r) => r.id === id);
  }

  async create(payload: SubmitRequestPayload) {
    const planItems = payload.services.map((s) => ({
      slug: s.slug,
      title: s.title,
      division: s.division,
      addedAt: new Date().toISOString(),
    }));
    return submitServiceRequest({
      services: planItems,
      intake: payload.intake,
      roadmap: payload.roadmap,
      notes: payload.notes,
    });
  }

  async updateStatus(requestId: string, workflowStep: string, staffId?: string) {
    return updateRequestStatus(requestId, workflowStep, staffId);
  }

  async assign(requestId: string, staffId: string) {
    assignRequest(requestId, staffId);
  }

  clear() {
    resetDemoStore();
  }
}

export class DemoOperationalDataRepository implements OperationalDataRepository {
  async loadSnapshot() {
    return loadDemoStore();
  }

  isRealtime() {
    return true;
  }
}

export const demoIntakeRepository = new DemoIntakeRepository();
export const demoRoadmapRepository = new DemoRoadmapRepository();
export const demoServicePlanRepository = new DemoServicePlanRepository();
export const demoServiceRequestRepository = new DemoServiceRequestRepository();
export const demoOperationalDataRepository = new DemoOperationalDataRepository();

/** Guest intake before account creation */
const GUEST_INTAKE_KEY = 'aio_guest_intake';

export function saveGuestIntake(answers: typeof defaultIntakeAnswers): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_INTAKE_KEY, JSON.stringify(answers));
}

export function loadGuestIntake(): typeof defaultIntakeAnswers | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GUEST_INTAKE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as typeof defaultIntakeAnswers;
  } catch {
    return null;
  }
}

export function clearGuestIntake(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_INTAKE_KEY);
}
