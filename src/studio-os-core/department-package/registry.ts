import type { DepartmentPackage } from './types';
import creativeDirectionDepartment from './bundles/creative-direction/department.json';
import creativeDirectionRoomDna from './bundles/creative-direction/room-dna.json';
import creativeDirectionManifest from './bundles/creative-direction/asset-manifest.json';
import creativeDirectionProductionGroups from './bundles/creative-direction/production-groups.json';

const warehouseDefinition = {
  ...(creativeDirectionDepartment as DepartmentPackage['definition']),
  id: 'studio-warehouse',
  displayName: 'Studio Archives™',
  packageId: 'pkg-studio-warehouse-golden-v1',
  identity: {
    ...(creativeDirectionDepartment as DepartmentPackage['definition']).identity,
    purpose: 'Physical manifestation of every generated asset — a living luxury warehouse campus',
    metaphor: 'Apple Industrial Design Lab meets Pixar prop warehouse and luxury museum archive',
    emotionalGoals: ['grounded', 'curious', 'luxurious', 'architectural', 'productive'],
  },
};

const warehouseRoomDna = {
  ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']),
  departmentId: 'studio-warehouse',
  packageId: 'pkg-studio-warehouse-golden-v1',
  defaultFeeling: [
    'industrial-luxury',
    'architectural',
    'museum-quality',
    'massive-scale',
    'grounded',
    'physical',
  ],
  forbiddenFeeling: [
    'webpage',
    'dashboard',
    'file-explorer',
    'saas',
    'card-grid',
    'sidebar-navigation',
    ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']).forbiddenFeeling,
  ],
  promptModifiers: {
    ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']).promptModifiers,
    environment:
      'Massive modern luxury warehouse campus, continuous architectural galleries, polished concrete, brushed steel, museum archive lighting, Pixar prop warehouse scale, never webpage UI',
  },
};

const warehouseProductionGroups = {
  ...(creativeDirectionProductionGroups as DepartmentPackage['productionGroups']),
  departmentId: 'studio-warehouse',
  packageId: 'pkg-studio-warehouse-golden-v1',
  defaultProject: {
    id: 'warehouse-golden-v1',
    name: 'Studio Warehouse Golden Build™',
    vision: 'Studio World™ builds itself — the Warehouse is proof of Scene Stack™ technology.',
    northStar: 'Every generated asset lives as a physical object founders can walk to and retrieve.',
    tone: ['industrial', 'luxurious', 'architectural', 'museum'],
  },
};

const PACKAGES: Record<string, DepartmentPackage> = {
  'creative-direction': {
    departmentId: 'creative-direction',
    packageId: 'pkg-creative-direction-golden-v1',
    definition: creativeDirectionDepartment as DepartmentPackage['definition'],
    roomDna: creativeDirectionRoomDna as DepartmentPackage['roomDna'],
    assetManifest: creativeDirectionManifest as DepartmentPackage['assetManifest'],
    productionGroups: creativeDirectionProductionGroups as DepartmentPackage['productionGroups'],
  },
  'studio-warehouse': {
    departmentId: 'studio-warehouse',
    packageId: 'pkg-studio-warehouse-golden-v1',
    definition: warehouseDefinition as DepartmentPackage['definition'],
    roomDna: warehouseRoomDna as DepartmentPackage['roomDna'],
    assetManifest: creativeDirectionManifest as DepartmentPackage['assetManifest'],
    productionGroups: warehouseProductionGroups as DepartmentPackage['productionGroups'],
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
