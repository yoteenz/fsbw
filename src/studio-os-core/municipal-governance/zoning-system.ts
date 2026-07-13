import type { MunicipalZone } from './contract';
import type { MunicipalValidationResult } from './contract';

export const ZONING_SYSTEM_VERSION = 'zoning-system.v1' as const;

export type ZoningFloor = 'penthouse' | 'ground-floor' | 'basement' | 'infrastructure';

export type ZoningRule = {
  floor: ZoningFloor;
  zone: MunicipalZone;
  allowedDepartmentIds: string[];
  forbiddenDepartmentIds: string[];
};

/** Canonical zoning matrix — departments may not illegally coexist on a floor. */
export const ZONING_RULES: ZoningRule[] = [
  {
    floor: 'penthouse',
    zone: 'executive',
    allowedDepartmentIds: [
      'founder-suite',
      'executive-office',
      'board-room',
      'experience-lab',
    ],
    forbiddenDepartmentIds: ['shipping-warehouse', 'manufacturing', 'retail-floor'],
  },
  {
    floor: 'ground-floor',
    zone: 'customer',
    allowedDepartmentIds: [
      'reception',
      'grand-lobby',
      'shipping',
      'retail',
      'customer-service',
      'build-a-wig-atelier',
    ],
    forbiddenDepartmentIds: ['founder-suite', 'board-room'],
  },
  {
    floor: 'ground-floor',
    zone: 'creative',
    allowedDepartmentIds: [
      'creative-direction-studio',
      'experience-lab',
      'transformation-suite',
      'hair-analysis-lab',
      'extensions-boutique',
    ],
    forbiddenDepartmentIds: ['shipping-warehouse'],
  },
  {
    floor: 'ground-floor',
    zone: 'operations',
    allowedDepartmentIds: [
      'marketing-department',
      'finance-department',
      'operations-department',
      'institute',
    ],
    forbiddenDepartmentIds: [],
  },
  {
    floor: 'infrastructure',
    zone: 'infrastructure',
    allowedDepartmentIds: ['utility-core', 'queue-hub', 'asset-registry'],
    forbiddenDepartmentIds: ['reception', 'founder-suite'],
  },
];

export type ZoningPlacementInput = {
  floor: ZoningFloor;
  departmentId: string;
  coexistingDepartmentIds?: string[];
};

export function validateZoningPlacement(input: ZoningPlacementInput): MunicipalValidationResult {
  const applicable = ZONING_RULES.filter((r) => r.floor === input.floor);
  if (applicable.length === 0) {
    return { ok: false, code: 'UNKNOWN_FLOOR', message: `No zoning rules for floor ${input.floor}.` };
  }

  for (const rule of applicable) {
    if (rule.forbiddenDepartmentIds.includes(input.departmentId)) {
      return {
        ok: false,
        code: 'ZONING_VIOLATION',
        message: `Department ${input.departmentId} is forbidden on ${input.floor} (${rule.zone} zone).`,
      };
    }
  }

  const allowedOnFloor = applicable.some(
    (r) => r.allowedDepartmentIds.includes(input.departmentId) || r.allowedDepartmentIds.length === 0
  );
  const explicitlyAllowed = applicable.some((r) => r.allowedDepartmentIds.includes(input.departmentId));

  if (!explicitlyAllowed && !allowedOnFloor) {
    return {
      ok: false,
      code: 'ZONING_NOT_PERMITTED',
      message: `Department ${input.departmentId} is not zoned for ${input.floor}.`,
    };
  }

  const coexisting = input.coexistingDepartmentIds ?? [];
  for (const neighbor of coexisting) {
    for (const rule of applicable) {
      if (rule.forbiddenDepartmentIds.includes(neighbor)) {
        return {
          ok: false,
          code: 'ZONING_COEXISTENCE_VIOLATION',
          message: `Department ${input.departmentId} cannot coexist with ${neighbor} on ${input.floor}.`,
        };
      }
    }
  }

  return { ok: true };
}

export function resolveZoneForDepartment(departmentId: string): MunicipalZone | null {
  for (const rule of ZONING_RULES) {
    if (rule.allowedDepartmentIds.includes(departmentId)) return rule.zone;
  }
  return null;
}
