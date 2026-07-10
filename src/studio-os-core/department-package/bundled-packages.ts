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
  departmentDnaRef: 'studio-warehouse',
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

const commandCenterDefinition = {
  ...(creativeDirectionDepartment as DepartmentPackage['definition']),
  id: 'studio-command-center',
  displayName: 'Studio Command Center™',
  packageId: 'pkg-studio-command-center-golden-v1',
  departmentDnaRef: 'studio-command-center',
  identity: {
    ...(creativeDirectionDepartment as DepartmentPackage['definition']).identity,
    purpose: 'Executive operational arrival space — the founder stands at the center of the company',
    metaphor: 'Mission control cathedral atrium — not a dashboard, not a webpage',
    emotionalGoals: ['commanding', 'grounded', 'clear', 'architectural', 'operational'],
  },
};

const commandCenterRoomDna = {
  ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']),
  departmentId: 'studio-command-center',
  packageId: 'pkg-studio-command-center-golden-v1',
  defaultFeeling: ['executive', 'architectural', 'commanding', 'immersive', 'operational'],
  forbiddenFeeling: [
    'webpage',
    'dashboard',
    'card-grid',
    'marble-cards',
    'saas-admin',
    'flat-panels',
    ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']).forbiddenFeeling,
  ],
  promptModifiers: {
    ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']).promptModifiers,
    environment:
      'Executive Command Center cathedral atrium, radial wing corridors, Organization Pulse Core landmark, mission control architecture never webpage UI',
  },
};

const commandCenterProductionGroups = {
  ...(creativeDirectionProductionGroups as DepartmentPackage['productionGroups']),
  departmentId: 'studio-command-center',
  packageId: 'pkg-studio-command-center-golden-v1',
  defaultProject: {
    id: 'command-center-golden-v1',
    name: 'Executive Atrium Golden Build™',
    vision: 'The founder enters the operational heart of Frontal Slayer Executive HQ.',
    northStar: 'All wings branch physically from one living command sculpture.',
    tone: ['executive', 'architectural', 'commanding'],
  },
};

const worldAtlasDefinition = {
  ...(creativeDirectionDepartment as DepartmentPackage['definition']),
  id: 'studio-world-atlas',
  displayName: 'Studio World Atlas™',
  packageId: 'pkg-studio-world-atlas-golden-v1',
  departmentDnaRef: 'studio-world-atlas',
  identity: {
    ...(creativeDirectionDepartment as DepartmentPackage['definition']).identity,
    purpose:
      'Knowledge observatory — the entire Studio World civilization rendered as a living holographic campus the founder navigates',
    metaphor:
      'Executive holographic war table meets Pixar campus model and luxury urban planning observatory — never a sitemap or dashboard',
    emotionalGoals: ['commanding', 'curious', 'architectural', 'expansive', 'oriented'],
  },
  spatial: {
    layoutTemplate: 'observatory',
    envelope: { widthM: 24.0, depthM: 16.0, footprintM2: 180, aspectRatio: '16:9' },
    zones: [
      { id: 'arrival-threshold', type: 'entry', displayName: 'Observatory Arrival' },
      { id: 'holographic-table', type: 'hero', displayName: 'Studio World Atlas™ Holographic Table' },
      { id: 'orb-guide', type: 'orb', displayName: 'Orb Atlas Guide' },
      { id: 'fast-travel-deck', type: 'secondary', displayName: 'Fast Travel Deck' },
      { id: 'departure-threshold', type: 'exit', displayName: 'Exit → Command Center' },
    ],
    heroObjectId: 'atlas-landmark',
    entryZoneId: 'arrival-threshold',
    exitZoneId: 'departure-threshold',
  },
};

const worldAtlasRoomDna = {
  ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']),
  departmentId: 'studio-world-atlas',
  packageId: 'pkg-studio-world-atlas-golden-v1',
  defaultFeeling: [
    'executive',
    'holographic',
    'architectural',
    'expansive',
    'commanding',
    'observatory',
  ],
  forbiddenFeeling: [
    'webpage',
    'dashboard',
    'sitemap',
    'card-grid',
    'file-explorer',
    'saas-admin',
    'flat-panels',
    ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']).forbiddenFeeling,
  ],
  promptModifiers: {
    ...(creativeDirectionRoomDna as DepartmentPackage['roomDna']).promptModifiers,
    environment:
      'Executive knowledge observatory overlooking command center, monumental holographic projection table, entire Studio World civilization rising from table, cyan holographic glow, luxury architectural observatory never webpage UI',
  },
};

const worldAtlasAssetManifest = {
  ...(creativeDirectionManifest as DepartmentPackage['assetManifest']),
  departmentId: 'studio-world-atlas',
  packageId: 'pkg-studio-world-atlas-golden-v1',
};

const worldAtlasProductionGroups = {
  ...(creativeDirectionProductionGroups as DepartmentPackage['productionGroups']),
  departmentId: 'studio-world-atlas',
  packageId: 'pkg-studio-world-atlas-golden-v1',
  defaultProject: {
    id: 'world-atlas-golden-v1',
    name: 'Studio World Atlas™ Golden Build',
    vision: 'The founder sees the entire Studio World as a living holographic campus.',
    northStar: 'Every department, expedition, and landmark is navigable from one executive table.',
    tone: ['executive', 'holographic', 'architectural', 'expansive'],
  },
};

/** Canonical bundled department packages — registered deterministically at boot. */
export const BUNDLED_DEPARTMENT_PACKAGES: readonly DepartmentPackage[] = [
  {
    departmentId: 'creative-direction',
    packageId: 'pkg-creative-direction-golden-v1',
    definition: creativeDirectionDepartment as DepartmentPackage['definition'],
    roomDna: creativeDirectionRoomDna as DepartmentPackage['roomDna'],
    assetManifest: creativeDirectionManifest as DepartmentPackage['assetManifest'],
    productionGroups: creativeDirectionProductionGroups as DepartmentPackage['productionGroups'],
  },
  {
    departmentId: 'studio-warehouse',
    packageId: 'pkg-studio-warehouse-golden-v1',
    definition: warehouseDefinition as DepartmentPackage['definition'],
    roomDna: warehouseRoomDna as DepartmentPackage['roomDna'],
    assetManifest: creativeDirectionManifest as DepartmentPackage['assetManifest'],
    productionGroups: warehouseProductionGroups as DepartmentPackage['productionGroups'],
  },
  {
    departmentId: 'studio-command-center',
    packageId: 'pkg-studio-command-center-golden-v1',
    definition: commandCenterDefinition as DepartmentPackage['definition'],
    roomDna: commandCenterRoomDna as DepartmentPackage['roomDna'],
    assetManifest: creativeDirectionManifest as DepartmentPackage['assetManifest'],
    productionGroups: commandCenterProductionGroups as DepartmentPackage['productionGroups'],
  },
  {
    departmentId: 'studio-world-atlas',
    packageId: 'pkg-studio-world-atlas-golden-v1',
    definition: worldAtlasDefinition as DepartmentPackage['definition'],
    roomDna: worldAtlasRoomDna as DepartmentPackage['roomDna'],
    assetManifest: worldAtlasAssetManifest as DepartmentPackage['assetManifest'],
    productionGroups: worldAtlasProductionGroups as DepartmentPackage['productionGroups'],
  },
];
