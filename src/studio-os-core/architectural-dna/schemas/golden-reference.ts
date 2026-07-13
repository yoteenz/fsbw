import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';

export const GOLDEN_REFERENCE_PACK_VERSION = 'golden-reference-pack.v1' as const;

export type GoldenReferenceBoard = {
  boardId: string;
  label: string;
  assetPath: string;
  revision: number;
};

export type GoldenReferencePack = {
  packVersion: typeof GOLDEN_REFERENCE_PACK_VERSION;
  packRevision: number;
  packId: string;
  departmentId: CanonicalMainDepartmentId;
  heroRender: GoldenReferenceBoard;
  materialBoard: GoldenReferenceBoard;
  lightingBoard: GoldenReferenceBoard;
  cameraBoard: GoldenReferenceBoard;
  compositionBoard: GoldenReferenceBoard;
  geometryBoard: GoldenReferenceBoard;
  environmentBoard: GoldenReferenceBoard;
  moodBoard: GoldenReferenceBoard;
  desktopReference: GoldenReferenceBoard;
  mobileReference: GoldenReferenceBoard;
  signatureDetails: GoldenReferenceBoard[];
  futureExpansionExamples: GoldenReferenceBoard[];
  versionHistory: Array<{ revision: number; note: string; date: string }>;
};
