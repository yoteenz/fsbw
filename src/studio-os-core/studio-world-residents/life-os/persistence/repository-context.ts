import { InMemoryResidentLifeRepository } from './in-memory-repository';
import type { ResidentLifeRepository } from './repository';
import { exportStoreToSnapshot, applySnapshotToStore } from './snapshot-utils';
import { getLifeOsStore, resetLifeOsStoreForTests } from '../life-os-store';

let activeRepository: ResidentLifeRepository | null = null;

export function setResidentLifeRepository(repo: ResidentLifeRepository | null): void {
  activeRepository = repo;
}

export function getResidentLifeRepository(): ResidentLifeRepository {
  if (!activeRepository) {
    activeRepository = new InMemoryResidentLifeRepository();
  }
  return activeRepository;
}

export async function persistLifeOsStore(): Promise<void> {
  const repo = getResidentLifeRepository();
  const snap = exportStoreToSnapshot(getLifeOsStore());
  await repo.saveSnapshot(snap);
}

export async function rehydrateLifeOsFromRepository(): Promise<boolean> {
  const repo = getResidentLifeRepository();
  const snap = await repo.loadSnapshot();
  if (!snap) return false;
  resetLifeOsStoreForTests();
  applySnapshotToStore(getLifeOsStore(), snap);
  return true;
}

export function resetRepositoryContextForTests(): void {
  activeRepository = null;
}
