import type { PermitApplication } from './permit-engine';
import type { OccupancyPermit } from './occupancy-permit';
import type { MunicipalLedgerEntry } from './municipal-ledger';

export const MUNICIPAL_DASHBOARD_VERSION = 'municipal-dashboard.v1' as const;

/** Data contract for Municipal Dashboard™ — UI renders in Constitution Hall governance wing. */
export type MunicipalDashboardState = {
  dashboardVersion: typeof MUNICIPAL_DASHBOARD_VERSION;
  generatedAt: string;
  organizationId: string;
  pendingPermits: PermitApplication[];
  approvedPermits: PermitApplication[];
  deniedPermits: PermitApplication[];
  departmentsUnderConstruction: string[];
  inspectionQueue: string[];
  occupancyQueue: string[];
  failedInspections: Array<{ sceneId: string; code: string; message: string }>;
  budgetUsageUsd: number;
  budgetLimitUsd: number;
  aiUtilizationPct: number;
  infrastructureHealth: 'healthy' | 'degraded' | 'critical';
  recentLedgerEntries: MunicipalLedgerEntry[];
  cityHealthScore: number;
  openOccupancyPermits: OccupancyPermit[];
};

export function buildMunicipalDashboardState(input: {
  organizationId: string;
  pendingPermits: PermitApplication[];
  approvedPermits: PermitApplication[];
  deniedPermits: PermitApplication[];
  departmentsUnderConstruction: string[];
  inspectionQueue: string[];
  occupancyQueue: string[];
  failedInspections: MunicipalDashboardState['failedInspections'];
  budgetUsageUsd: number;
  budgetLimitUsd: number;
  aiUtilizationPct: number;
  infrastructureHealth: MunicipalDashboardState['infrastructureHealth'];
  recentLedgerEntries: MunicipalLedgerEntry[];
  openOccupancyPermits: OccupancyPermit[];
}): MunicipalDashboardState {
  const healthInputs = [
    input.infrastructureHealth === 'healthy' ? 100 : input.infrastructureHealth === 'degraded' ? 60 : 20,
    input.failedInspections.length === 0 ? 100 : Math.max(0, 100 - input.failedInspections.length * 15),
    input.budgetLimitUsd > 0 ? Math.min(100, (1 - input.budgetUsageUsd / input.budgetLimitUsd) * 100) : 100,
  ];
  const cityHealthScore = Math.round(healthInputs.reduce((a, b) => a + b, 0) / healthInputs.length);

  return {
    dashboardVersion: MUNICIPAL_DASHBOARD_VERSION,
    generatedAt: new Date().toISOString(),
    cityHealthScore,
    organizationId: input.organizationId,
    pendingPermits: input.pendingPermits,
    approvedPermits: input.approvedPermits,
    deniedPermits: input.deniedPermits,
    departmentsUnderConstruction: input.departmentsUnderConstruction,
    inspectionQueue: input.inspectionQueue,
    occupancyQueue: input.occupancyQueue,
    failedInspections: input.failedInspections,
    budgetUsageUsd: input.budgetUsageUsd,
    budgetLimitUsd: input.budgetLimitUsd,
    aiUtilizationPct: input.aiUtilizationPct,
    infrastructureHealth: input.infrastructureHealth,
    recentLedgerEntries: input.recentLedgerEntries,
    openOccupancyPermits: input.openOccupancyPermits,
  };
}
