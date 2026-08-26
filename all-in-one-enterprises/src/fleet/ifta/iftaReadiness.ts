/** IFTA-readiness — distinguishes estimates from verified jurisdiction mileage. */

export type MileageSourceType =
  | 'planned_route'
  | 'loaded_miles'
  | 'deadhead_miles'
  | 'driver_reported'
  | 'gps_unverified'
  | 'eld_verified'
  | 'manual_verified'
  | 'fuel_receipt_derived';

export type IftaReadinessStatus =
  | 'INSUFFICIENT_DATA'
  | 'ESTIMATED'
  | 'MANUAL_VERIFICATION_REQUIRED'
  | 'VERIFIED_SOURCE_AVAILABLE'
  | 'READY_FOR_REPORTING';

export interface JurisdictionMileageEntry {
  state: string;
  miles: number;
  source: MileageSourceType;
  verified: boolean;
  periodStart?: string;
  periodEnd?: string;
}

export interface FuelPurchaseRecord {
  id: string;
  organizationId: string;
  purchaseDate: string;
  gallons: number;
  state: string;
  source: 'fuel_receipt' | 'fuel_card_future' | 'manual';
  verified: boolean;
}

export interface IftaReadinessAssessment {
  status: IftaReadinessStatus;
  jurisdictionEntries: JurisdictionMileageEntry[];
  fuelPurchases: FuelPurchaseRecord[];
  warnings: string[];
  canGenerateAuthoritativeReturn: boolean;
}

const VERIFIED_SOURCES: MileageSourceType[] = ['eld_verified', 'manual_verified'];

export function assessIftaReadiness(
  jurisdictionEntries: JurisdictionMileageEntry[],
  fuelPurchases: FuelPurchaseRecord[] = [],
): IftaReadinessAssessment {
  const warnings: string[] = [];

  if (jurisdictionEntries.length === 0) {
    return {
      status: 'INSUFFICIENT_DATA',
      jurisdictionEntries: [],
      fuelPurchases,
      warnings: ['No jurisdictional mileage captured'],
      canGenerateAuthoritativeReturn: false,
    };
  }

  const hasVerified = jurisdictionEntries.some((e) => e.verified && VERIFIED_SOURCES.includes(e.source));
  const allEstimated = jurisdictionEntries.every(
    (e) => e.source === 'planned_route' || e.source === 'loaded_miles' || e.source === 'gps_unverified',
  );

  if (hasVerified && fuelPurchases.some((f) => f.verified)) {
    return {
      status: 'READY_FOR_REPORTING',
      jurisdictionEntries,
      fuelPurchases,
      warnings,
      canGenerateAuthoritativeReturn: true,
    };
  }

  if (hasVerified) {
    warnings.push('Verified mileage present but fuel purchases need verification');
    return {
      status: 'VERIFIED_SOURCE_AVAILABLE',
      jurisdictionEntries,
      fuelPurchases,
      warnings,
      canGenerateAuthoritativeReturn: false,
    };
  }

  if (allEstimated) {
    warnings.push('Mileage is estimated — not suitable for authoritative IFTA filing');
    return {
      status: 'ESTIMATED',
      jurisdictionEntries,
      fuelPurchases,
      warnings,
      canGenerateAuthoritativeReturn: false,
    };
  }

  return {
    status: 'MANUAL_VERIFICATION_REQUIRED',
    jurisdictionEntries,
    fuelPurchases,
    warnings: [...warnings, 'Manual verification required before reporting'],
    canGenerateAuthoritativeReturn: false,
  };
}

export function milesFromLoadFields(loadedMiles: number, deadheadMiles: number, primaryState?: string): JurisdictionMileageEntry[] {
  if (loadedMiles <= 0 && deadheadMiles <= 0) return [];
  const entries: JurisdictionMileageEntry[] = [];
  if (loadedMiles > 0) {
    entries.push({
      state: primaryState ?? 'UNKNOWN',
      miles: loadedMiles,
      source: 'loaded_miles',
      verified: false,
    });
  }
  if (deadheadMiles > 0) {
    entries.push({
      state: primaryState ?? 'UNKNOWN',
      miles: deadheadMiles,
      source: 'deadhead_miles',
      verified: false,
    });
  }
  return entries;
}
