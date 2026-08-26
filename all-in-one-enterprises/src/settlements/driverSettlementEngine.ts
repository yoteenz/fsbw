import type { Load } from '../dispatch/dispatchTypes';
import type { DriverSettlement, DriverSettlementInput } from './settlementTypes';

function uid(): string {
  return crypto.randomUUID();
}

export function settlementIdempotencyKey(loadId: string, driverId: string): string {
  return `driver-settlement:${loadId}:${driverId}`;
}

export function computeBaseCompensation(input: DriverSettlementInput): number {
  switch (input.compensationModel) {
    case 'PER_MILE':
      return Math.round((input.loadedMiles + input.emptyMiles) * (input.ratePerMileMinor ?? 0));
    case 'PERCENTAGE':
      return 0;
    case 'FLAT_LOAD':
      return input.flatLoadMinor ?? 0;
    case 'HOURLY':
    case 'SALARY_REFERENCE':
    case 'CUSTOM':
      return input.flatLoadMinor ?? 0;
    default:
      return 0;
  }
}

export function calculateDriverSettlement(input: DriverSettlementInput): DriverSettlement {
  const base = computeBaseCompensation(input);
  const adjustments = (input.adjustments ?? []).map((a) => ({
    ...a,
    id: uid(),
    createdAt: new Date().toISOString(),
  }));
  const adjTotal = adjustments.reduce((s, a) => s + a.amountMinor, 0);

  return {
    id: uid(),
    loadId: input.loadId,
    organizationId: input.organizationId,
    driverId: input.driverId,
    compensationModel: input.compensationModel,
    loadedMiles: input.loadedMiles,
    emptyMiles: input.emptyMiles,
    baseCompensationMinor: base,
    adjustments,
    totalMinor: base + adjTotal,
    currency: 'USD',
    status: 'CALCULATED',
    idempotencyKey: settlementIdempotencyKey(input.loadId, input.driverId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function ensureDriverSettlementForLoad(
  existing: DriverSettlement[],
  load: Load,
  driverId: string,
  model: DriverSettlementInput['compensationModel'] = 'PER_MILE',
  ratePerMileMinor = 5500,
): DriverSettlement | undefined {
  if (load.operationalStatus !== 'complete' || !driverId) return undefined;
  const key = settlementIdempotencyKey(load.id, driverId);
  const dup = existing.find((s) => s.idempotencyKey === key && s.status !== 'VOID');
  if (dup) return dup;

  return calculateDriverSettlement({
    loadId: load.id,
    organizationId: load.organizationId,
    driverId,
    compensationModel: model,
    loadedMiles: load.loadedMiles,
    emptyMiles: load.deadheadMiles,
    ratePerMileMinor,
  });
}
