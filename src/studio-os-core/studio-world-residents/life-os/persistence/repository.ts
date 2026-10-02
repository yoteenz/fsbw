import type { ResidentLifeEventEnvelope } from '../event-envelope';
import type { ResidentLifePersistedSnapshot } from './snapshot';
import type { CareerRequestRecord } from '../runtime/career-requests';
import type { ResidentRequestRecord } from '../life-os-domain-records';

export type TickLedgerEntry = {
  tickWindowId: string;
  worldId: string;
  organizationId: string;
  startedAt: string;
  completedAt: string;
  tickKind: 'world' | 'reflection';
  resultSummary?: string;
};

export interface ResidentLifeRepository {
  /** Load materialized + event tail into a snapshot (or null if empty). */
  loadSnapshot(): Promise<ResidentLifePersistedSnapshot | null>;
  saveSnapshot(snapshot: ResidentLifePersistedSnapshot): Promise<void>;

  appendEvent(event: ResidentLifeEventEnvelope): Promise<void>;
  listEventsSince(iso: string, limit?: number): Promise<ResidentLifeEventEnvelope[]>;

  tryRecordTick(entry: TickLedgerEntry): Promise<boolean>;
  hasTickWindow(tickWindowId: string): Promise<boolean>;

  upsertResidentRequest(request: ResidentRequestRecord): Promise<void>;
  listResidentRequests(): Promise<ResidentRequestRecord[]>;

  upsertCareerRequest(request: CareerRequestRecord): Promise<void>;
  listCareerRequests(): Promise<CareerRequestRecord[]>;
}

export interface ResidentLifeRepositoryFactory {
  forWorld(worldId: string, organizationId: string): ResidentLifeRepository;
}
