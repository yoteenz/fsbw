import { useMemo } from 'react';
import type { IconSheetProfileId } from '../../../../studio-os-core/icon-manufacturing';
import {
  getIconSheetProfile,
  listIconSheetProfiles,
  runIconManufacturingQa,
  validateGridCalibrationForProfile,
  loadManufacturingExtensions,
  createManufacturingExtensions,
} from '../../../../studio-os-core/icon-manufacturing';
import { EXPERIENCE_LAB_ICON_REGISTRY } from '../experience-lab-icon-registry';
import { NAVIGATION_MASTER_ICON_REGISTRY } from '../navigation-master/navigation-master-icon-registry';
import { STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL } from '../grid-calibration';
import navigationCalibrationCanonical from '../navigation-master/grid-calibration/navigation-master-grid-calibration-canonical.json';
import type { StudioWorldIconGridCalibration } from '../grid-calibration/StudioWorldIconGridCalibration';

export function getRegistryForProfile(profileId: IconSheetProfileId): Record<string, { row: number; column: number; accessibleLabel?: string }> {
  if (profileId === 'navigation-master') return NAVIGATION_MASTER_ICON_REGISTRY;
  return EXPERIENCE_LAB_ICON_REGISTRY;
}

export function getCanonicalCalibrationForProfile(profileId: IconSheetProfileId): StudioWorldIconGridCalibration {
  if (profileId === 'navigation-master') {
    return navigationCalibrationCanonical as StudioWorldIconGridCalibration;
  }
  return STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL;
}

export function loadCalibrationDraftForProfile(profileId: IconSheetProfileId): StudioWorldIconGridCalibration | null {
  if (typeof window === 'undefined') return null;
  const profile = getIconSheetProfile(profileId);
  try {
    const raw = window.localStorage.getItem(profile.calibrationDraftKey);
    return raw ? (JSON.parse(raw) as StudioWorldIconGridCalibration) : null;
  } catch {
    return null;
  }
}

export function saveCalibrationDraftForProfile(
  profileId: IconSheetProfileId,
  cal: StudioWorldIconGridCalibration,
): void {
  if (typeof window === 'undefined') return;
  const profile = getIconSheetProfile(profileId);
  window.localStorage.setItem(profile.calibrationDraftKey, JSON.stringify(cal, null, 2));
}

export function useIconManufacturingSheet(profileId: IconSheetProfileId) {
  const profile = useMemo(() => getIconSheetProfile(profileId), [profileId]);
  const registry = useMemo(() => getRegistryForProfile(profileId), [profileId]);
  const canonical = useMemo(() => getCanonicalCalibrationForProfile(profileId), [profileId]);
  const extensions = useMemo(
    () => loadManufacturingExtensions(profile) ?? createManufacturingExtensions(profile),
    [profile],
  );

  return {
    profile,
    registry,
    canonical,
    extensions,
    allProfiles: listIconSheetProfiles(),
  };
}

export function runQaForProfile(
  profileId: IconSheetProfileId,
  calibration: StudioWorldIconGridCalibration,
) {
  const profile = getIconSheetProfile(profileId);
  const registry = getRegistryForProfile(profileId);
  const extensions = loadManufacturingExtensions(profile);
  return runIconManufacturingQa(profile, calibration, registry, extensions);
}

export function validateCalibrationForProfile(
  profileId: IconSheetProfileId,
  calibration: StudioWorldIconGridCalibration,
) {
  const profile = getIconSheetProfile(profileId);
  const registry = getRegistryForProfile(profileId);
  return validateGridCalibrationForProfile(calibration, profile, registry);
}
