import type { ResidentLifeEventEnvelope } from '../event-envelope';
import type { ResidentRequestRecord } from '../life-os-domain-records';
import type { CareerRequestRecord } from '../runtime/career-requests';
import type { ResidentLifePersistedSnapshot } from './snapshot';
import { defaultEmptySnapshot } from './snapshot-utils';
import type { ResidentLifeRepository, TickLedgerEntry } from './repository';

/** Test / local persistence — holds snapshot in process memory. */
export class InMemoryResidentLifeRepository implements ResidentLifeRepository {
  private snapshot: ResidentLifePersistedSnapshot | null = null;
  private tickWindows = new Set<string>();

  constructor(initial?: ResidentLifePersistedSnapshot | null) {
    this.snapshot = initial ?? null;
    if (initial?.completedTickWindows) {
      for (const w of initial.completedTickWindows) this.tickWindows.add(w);
    }
  }

  async loadSnapshot(): Promise<ResidentLifePersistedSnapshot | null> {
    return this.snapshot ? structuredClone(this.snapshot) : null;
  }

  async saveSnapshot(snapshot: ResidentLifePersistedSnapshot): Promise<void> {
    this.snapshot = structuredClone(snapshot);
    for (const w of snapshot.completedTickWindows ?? []) this.tickWindows.add(w);
  }

  async appendEvent(event: ResidentLifeEventEnvelope): Promise<void> {
    if (!this.snapshot) this.snapshot = defaultEmptySnapshot();
    this.snapshot.events.push(structuredClone(event));
  }

  async listEventsSince(iso: string, limit = 500): Promise<ResidentLifeEventEnvelope[]> {
    if (!this.snapshot) return [];
    return this.snapshot.events.filter((e) => e.timestamp >= iso).slice(-limit);
  }

  async tryRecordTick(entry: TickLedgerEntry): Promise<boolean> {
    if (this.tickWindows.has(entry.tickWindowId)) return false;
    this.tickWindows.add(entry.tickWindowId);
    if (!this.snapshot) this.snapshot = defaultEmptySnapshot();
    this.snapshot.completedTickWindows = [...this.tickWindows];
    return true;
  }

  async hasTickWindow(tickWindowId: string): Promise<boolean> {
    return this.tickWindows.has(tickWindowId);
  }

  async upsertResidentRequest(request: ResidentRequestRecord): Promise<void> {
    if (!this.snapshot) this.snapshot = defaultEmptySnapshot();
    const idx = this.snapshot.residentRequests.findIndex((r) => r.requestId === request.requestId);
    if (idx >= 0) this.snapshot.residentRequests[idx] = structuredClone(request);
    else this.snapshot.residentRequests.push(structuredClone(request));
  }

  async listResidentRequests(): Promise<ResidentRequestRecord[]> {
    return this.snapshot?.residentRequests ?? [];
  }

  async upsertCareerRequest(request: CareerRequestRecord): Promise<void> {
    if (!this.snapshot) this.snapshot = defaultEmptySnapshot();
    const idx = this.snapshot.careerRequests.findIndex((r) => r.careerRequestId === request.careerRequestId);
    if (idx >= 0) this.snapshot.careerRequests[idx] = structuredClone(request);
    else this.snapshot.careerRequests.push(structuredClone(request));
  }

  async listCareerRequests(): Promise<CareerRequestRecord[]> {
    return this.snapshot?.careerRequests ?? [];
  }
}
