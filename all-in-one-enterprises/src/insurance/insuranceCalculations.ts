import type { InsurancePolicyStatus } from './insuranceTypes';
import { EXPIRING_SOON_DAYS } from './insuranceConfig';

export function daysUntilDate(isoDate: string, fromDate = new Date()): number | null {
  if (!isoDate) return null;
  const target = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const from = new Date(fromDate);
  from.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function derivePolicyStatusFromDates(
  expirationDate: string | undefined,
  explicitStatus: InsurancePolicyStatus,
  fromDate = new Date(),
): InsurancePolicyStatus {
  if (explicitStatus === 'cancelled' || explicitStatus === 'replaced') return explicitStatus;
  if (!expirationDate) return explicitStatus === 'pending' ? 'pending' : 'unknown';
  const days = daysUntilDate(expirationDate, fromDate);
  if (days === null) return explicitStatus;
  if (days < 0) return 'expired';
  if (days <= EXPIRING_SOON_DAYS) return 'expiring_soon';
  if (explicitStatus === 'pending') return 'pending';
  return 'active';
}

export function maskPolicyNumber(policyNumber: string | undefined): string {
  if (!policyNumber) return '—';
  const trimmed = policyNumber.trim();
  if (trimmed.length <= 4) return `•••• ${trimmed}`;
  return `•••• ${trimmed.slice(-4)}`;
}

export function countVehicleMismatch(activeUnitCount: number, associatedCount: number): boolean {
  return activeUnitCount > 0 && associatedCount > 0 && activeUnitCount !== associatedCount;
}
