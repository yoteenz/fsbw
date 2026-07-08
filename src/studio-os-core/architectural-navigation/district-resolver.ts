/**
 * Resolve district environmental theme from Studio Archives™ camera zone.
 */

import type { WarehouseCameraZoneId } from '../studio-warehouse/camera-zones';
import { warehouseWingKind } from '../studio-warehouse/campus-nav';
import { industrialWingForZone } from '../studio-warehouse/industrial-campus';
import type { DistrictThemeId } from './district-themes';

export function resolveWarehouseDistrictTheme(activeZoneId: WarehouseCameraZoneId): DistrictThemeId {
  const industrial = industrialWingForZone(activeZoneId);
  const wing = warehouseWingKind(activeZoneId);

  if (industrial?.id === 'innovation-gallery' && activeZoneId === 'hall-of-innovation') {
    return 'innovation-district';
  }
  if (industrial?.id === 'innovation-gallery' && activeZoneId === 'museum-wing') {
    return 'museum';
  }
  if (industrial?.id === 'blueprint-hall') {
    return 'knowledge-library';
  }
  if (wing === 'marketplace') {
    return 'marketplace';
  }
  if (wing === 'innovation') {
    return 'innovation-district';
  }
  if (wing === 'legacy') {
    return 'museum';
  }
  if (wing === 'genome' || wing === 'blueprint') {
    return 'knowledge-library';
  }

  // Industrial Design Campus — Asset Gallery, Material Library, Prototype Vault
  return 'warehouse';
}

export function resolveDistrictThemeFromPath(pathname: string): DistrictThemeId {
  if (pathname.includes('world-atlas')) return 'atlas';
  if (pathname.includes('department/creative-direction')) return 'creative-direction';
  if (pathname.includes('/overview') || pathname.includes('command-center')) return 'command-center';
  if (pathname.includes('innovation-district') || pathname.includes('innovation-constellations')) {
    return 'innovation-district';
  }
  if (pathname.includes('marketplace')) return 'marketplace';
  if (pathname.includes('world-knowledge-engine') || pathname.includes('knowledge')) return 'knowledge-library';
  if (pathname.includes('museum')) return 'museum';
  if (pathname.includes('studio-archives') || pathname.includes('studio-warehouse')) return 'warehouse';
  return 'warehouse';
}
