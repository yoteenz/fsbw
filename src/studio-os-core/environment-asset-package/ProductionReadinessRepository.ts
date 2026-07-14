import type {
  PackageAuditEntry,
  ProductionReadinessRecord,
} from './ProductionReadinessGate';
import { buildReadinessId } from './ProductionReadinessGate';

/** Persist Production Readiness alongside Environment Packages. */
const READINESS_BY_PACKAGE = new Map<string, ProductionReadinessRecord>();
const READINESS_BY_ID = new Map<string, ProductionReadinessRecord>();

export class ProductionReadinessRepository {
  save(record: ProductionReadinessRecord): void {
    READINESS_BY_PACKAGE.set(record.packageId, record);
    READINESS_BY_ID.set(record.readinessId, record);
  }

  getByPackageId(packageId: string): ProductionReadinessRecord | null {
    return READINESS_BY_PACKAGE.get(packageId) ?? null;
  }

  getByReadinessId(readinessId: string): ProductionReadinessRecord | null {
    return READINESS_BY_ID.get(readinessId) ?? null;
  }

  listAll(): ProductionReadinessRecord[] {
    return [...READINESS_BY_PACKAGE.values()];
  }
}

let defaultRepo: ProductionReadinessRepository | null = null;

export function getProductionReadinessRepository(): ProductionReadinessRepository {
  if (!defaultRepo) defaultRepo = new ProductionReadinessRepository();
  return defaultRepo;
}

export function saveProductionReadiness(record: ProductionReadinessRecord): void {
  getProductionReadinessRepository().save(record);
}

export function getProductionReadinessForPackage(
  packageId: string
): ProductionReadinessRecord | null {
  return getProductionReadinessRepository().getByPackageId(packageId);
}

export function appendPackageAuditEntry(
  record: ProductionReadinessRecord,
  entry: Omit<PackageAuditEntry, 'id' | 'packageId'>
): ProductionReadinessRecord {
  const auditEntry: PackageAuditEntry = {
    id: `audit.${record.packageId}.${record.auditLog.length + 1}`,
    packageId: record.packageId,
    ...entry,
  };
  return {
    ...record,
    auditLog: [...record.auditLog, auditEntry],
    updatedAt: entry.occurredAt,
  };
}

export function resetProductionReadinessRepository(): void {
  READINESS_BY_PACKAGE.clear();
  READINESS_BY_ID.clear();
  defaultRepo = null;
}

export function ensureReadinessIdForPackage(packageId: string): string {
  return buildReadinessId(packageId);
}
