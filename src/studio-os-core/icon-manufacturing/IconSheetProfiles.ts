import type { StudioWorldIconCategoryId } from '../studio-world-icon-system/StudioWorldIconCategories';

export const ICON_MANUFACTURING_VERSION = 'studio-world-icon-manufacturing.v1' as const;

export type IconSheetProfileId = 'experience-lab' | 'navigation-master';

export type IconManufacturingCertificationStage =
  | 'draft'
  | 'calibrated'
  | 'qa'
  | 'founder-approved'
  | 'certified'
  | 'production'
  | 'deprecated'
  | 'archived';

export type IconSheetRuntimeStatus = 'production' | 'draft' | 'calibration-only';

export type IconSheetProfile = {
  id: IconSheetProfileId;
  label: string;
  category: StudioWorldIconCategoryId;
  grid: { rows: number; columns: number; iconCount: number; blankCells?: number };
  sourcePath: string;
  sourceWidth: number;
  sourceHeight: number;
  calibrationPath: string;
  calibrationDraftKey: string;
  registryModule: 'experience-lab' | 'navigation-master';
  outputDir: string;
  buildScript: string;
  generateArtworkScript?: string;
  runtimeStatus: IconSheetRuntimeStatus;
  certification: IconManufacturingCertificationStage;
  version: string;
  designFamily: string;
};

export const ICON_SHEET_PROFILES: Record<IconSheetProfileId, IconSheetProfile> = {
  'experience-lab': {
    id: 'experience-lab',
    label: 'Experience Lab Workbench',
    category: 'workspace',
    grid: { rows: 8, columns: 8, iconCount: 64 },
    sourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
    sourceWidth: 1402,
    sourceHeight: 1122,
    calibrationPath:
      'src/features/studio-world/icons/grid-calibration/studio-world-icon-grid-calibration-canonical.json',
    calibrationDraftKey: 'studio-world:icon-grid-calibration-draft',
    registryModule: 'experience-lab',
    outputDir: 'src/assets/studio-world/experience-lab/icons/generated-v6',
    buildScript: 'npm run experience-lab:build-icons',
    runtimeStatus: 'production',
    certification: 'production',
    version: 'v6',
    designFamily: 'studio-world-grid-v6',
  },
  'navigation-master': {
    id: 'navigation-master',
    label: 'Navigation Master',
    category: 'navigation',
    grid: { rows: 10, columns: 10, iconCount: 93, blankCells: 7 },
    sourcePath:
      'src/assets/studio-world/navigation/icons/source/studio-world-navigation-master-sheet.png',
    sourceWidth: 10240,
    sourceHeight: 10240,
    calibrationPath:
      'src/features/studio-world/icons/navigation-master/grid-calibration/navigation-master-grid-calibration-canonical.json',
    calibrationDraftKey: 'studio-world:navigation-grid-calibration-draft',
    registryModule: 'navigation-master',
    outputDir: 'src/assets/studio-world/navigation/icons/generated-v1',
    buildScript: 'npm run navigation-master:build-icons',
    generateArtworkScript: 'npm run navigation-master:generate-sheet',
    runtimeStatus: 'draft',
    certification: 'draft',
    version: 'v1',
    designFamily: 'studio-world-navigation-chrome-v1',
  },
};

export function getIconSheetProfile(id: IconSheetProfileId): IconSheetProfile {
  return ICON_SHEET_PROFILES[id];
}

export function listIconSheetProfiles(): IconSheetProfile[] {
  return Object.values(ICON_SHEET_PROFILES);
}
