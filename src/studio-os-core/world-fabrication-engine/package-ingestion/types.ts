import type { AssetPackageManifest } from '../technical-art/asset-package';
import type { PackageCompletenessCell } from '../technical-art/types';
import type { FabricationAssetRecord, LineageTransformRecord } from '../lineage';

export type PackageFileRole =
  | 'SOURCE_BLEND'
  | 'SOURCE_SCRIPT'
  | 'SOURCE_TEXTURE'
  | 'SOURCE_CONFIG'
  | 'RUNTIME_GLB'
  | 'RUNTIME_GLB_HIGH'
  | 'RUNTIME_FBX'
  | 'VALIDATION_REPORT'
  | 'MODULE_MANIFEST'
  | 'MATERIAL_MANIFEST'
  | 'VERSION_MANIFEST'
  | 'DOCUMENTATION'
  | 'RENDER_EVIDENCE'
  | 'REFERENCE_IMAGE'
  | 'COMPARISON'
  | 'VIEWER'
  | 'ARCHIVE_ORIGINAL'
  | 'UNKNOWN';

export type PackageFileInventoryEntry = {
  relativePath: string;
  bytes: number;
  sha256: string;
  mimeGuess: string;
  role: PackageFileRole;
  assetTier: 'SOURCE' | 'DERIVED' | 'EVIDENCE' | 'DOCUMENTATION';
  dependencies: string[];
  productionVersion?: string;
};

export type PackageInventory = {
  inventoryId: string;
  packageRoot: string;
  sourceArchivePath?: string;
  sourceArchiveSha256?: string;
  extractedAt: string;
  fileCount: number;
  totalBytes: number;
  files: PackageFileInventoryEntry[];
  missingFromFullReviewPackage: string[];
  warnings: string[];
};

export type GlbInspectionResult = {
  filePath: string;
  sha256: string;
  fileBytes: number;
  parseOk: boolean;
  parseErrors: string[];
  meshCount: number;
  nodeCount: number;
  materialNames: string[];
  textureCount: number;
  embeddedImageCount: number;
  triangleCount: number;
  extensionsUsed: string[];
  sceneRootNodeNames: string[];
  accessorSummary: { positions: number; indices: number };
};

export type TechnicalRequirementAssessment = {
  requirementId: string;
  category: string;
  cell: PackageCompletenessCell;
  evidence: string[];
  notes?: string;
};

export type FabricationAssetPackageRecord = {
  recordId: string;
  projectId: string;
  assetId: string;
  packageManifest: AssetPackageManifest;
  inventory: PackageInventory;
  glbInspections: GlbInspectionResult[];
  lineageAssets: FabricationAssetRecord[];
  lineageTransforms: LineageTransformRecord[];
  technicalAssessments: TechnicalRequirementAssessment[];
  ingestionRunId: string;
  ingestedAt: string;
  duplicateOfRecordId?: string;
  supersededByRecordId?: string;
};

export type BuildObjectReadinessReport = {
  reportId: string;
  assetId: string;
  packageVersion: string;
  architecturalVisualFidelity: 'PENDING' | 'PARTIAL' | 'PASS' | 'FAIL';
  technicalAssetQuality: 'PASS' | 'PARTIAL' | 'FAIL' | 'UNVERIFIED';
  webRuntimeReadiness: 'PASS' | 'PARTIAL' | 'FAIL' | 'UNVERIFIED';
  unrealReadiness: 'NOT_TESTED' | 'BLOCKED' | 'PARTIAL';
  productionPackageCompleteness: 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE';
  founderApproval: 'PENDING' | 'REVISE' | 'APPROVED';
  founderApprovalNotes: string[];
  recommendedTechnicalCorrections: string[];
  blockers: string[];
};

export type PackageIngestionOutcome =
  | 'INGESTED'
  | 'REJECTED_INVALID_ARCHIVE'
  | 'REJECTED_CORRUPT_GLB'
  | 'REJECTED_DUPLICATE'
  | 'REJECTED_CROSS_PROJECT'
  | 'INGESTED_WITH_WARNINGS';
