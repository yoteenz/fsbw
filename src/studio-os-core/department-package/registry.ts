import type { DepartmentPackage } from './types';
import creativeDirectionDepartment from './bundles/creative-direction/department.json';
import creativeDirectionRoomDna from './bundles/creative-direction/room-dna.json';
import creativeDirectionManifest from './bundles/creative-direction/asset-manifest.json';
import creativeDirectionProductionGroups from './bundles/creative-direction/production-groups.json';

const PACKAGES: Record<string, DepartmentPackage> = {
  'creative-direction': {
    departmentId: 'creative-direction',
    packageId: 'pkg-creative-direction-golden-v1',
    definition: creativeDirectionDepartment as DepartmentPackage['definition'],
    roomDna: creativeDirectionRoomDna as DepartmentPackage['roomDna'],
    assetManifest: creativeDirectionManifest as DepartmentPackage['assetManifest'],
    productionGroups: creativeDirectionProductionGroups as DepartmentPackage['productionGroups'],
  },
};

export function listRegisteredDepartmentIds(): string[] {
  return Object.keys(PACKAGES);
}

export function loadDepartmentPackage(departmentId: string): DepartmentPackage | null {
  return PACKAGES[departmentId] ?? null;
}

export function requireDepartmentPackage(departmentId: string): DepartmentPackage {
  const pkg = loadDepartmentPackage(departmentId);
  if (!pkg) throw new Error(`Department package not registered: ${departmentId}`);
  return pkg;
}
