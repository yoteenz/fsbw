import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import type { GoldenReferenceBoard, GoldenReferencePack } from '../schemas/golden-reference';

export const GOLDEN_REFERENCE_LIBRARY_VERSION = 'golden-reference-library.v1' as const;

function board(departmentId: string, boardType: string, revision = 1): GoldenReferenceBoard {
  const base = `/assets/studio-os/golden-references/${departmentId}`;
  return {
    boardId: `${departmentId}-${boardType}-v${revision}`,
    label: boardType.replace(/-/g, ' '),
    assetPath: `${base}/${boardType}.v${revision}.webp`,
    revision,
  };
}

function buildPack(departmentId: CanonicalMainDepartmentId, note: string): GoldenReferencePack {
  const packId = `golden-ref-${departmentId}-v1`;
  return {
    packVersion: 'golden-reference-pack.v1',
    packRevision: 1,
    packId,
    departmentId,
    heroRender: board(departmentId, 'hero-render'),
    materialBoard: board(departmentId, 'material-board'),
    lightingBoard: board(departmentId, 'lighting-board'),
    cameraBoard: board(departmentId, 'camera-board'),
    compositionBoard: board(departmentId, 'composition-board'),
    geometryBoard: board(departmentId, 'geometry-board'),
    environmentBoard: board(departmentId, 'environment-board'),
    moodBoard: board(departmentId, 'mood-board'),
    desktopReference: board(departmentId, 'desktop-21x9'),
    mobileReference: board(departmentId, 'mobile-9x16'),
    signatureDetails: [board(departmentId, 'signature-detail-a'), board(departmentId, 'signature-detail-b')],
    futureExpansionExamples: [board(departmentId, 'expansion-example')],
    versionHistory: [{ revision: 1, note, date: '2026-07-13T00:00:00.000Z' }],
  };
}

/** Approved design exploration concepts preserved as v1 Golden References. */
const GOLDEN_REFERENCE_NOTES: Partial<Record<CanonicalMainDepartmentId, string>> = {
  'experience-lab':
    'v1 — monumental architecture studio, holographic room model, floating blueprint volumes, bronze/champagne accents, approved design exploration',
  'creative-director-studio':
    'v1 — luxury production facility, isolated production stages, material testing, lighting rigs, dark luxury environment, approved design exploration',
  'command-center': 'v1 — mission wall, city telemetry, operations bridge',
  marketplace: 'v1 — storefronts, licensing displays, creator kiosks',
  'founder-suite': 'v1 — monumental executive atrium, premium architecture',
  observatory: 'v1 — experience intelligence wall, telemetry panoramas',
  'city-council': 'v1 — council chamber dais, municipal governance',
  'asset-registry': 'v1 — asset vault displays, registry catalog wall',
};

import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../../canonical-studio-world/canonical-department-registry';

export const GOLDEN_REFERENCE_LIBRARY: Record<CanonicalMainDepartmentId, GoldenReferencePack> =
  Object.fromEntries(
    CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((record) => [
      record.departmentId,
      buildPack(
        record.departmentId,
        GOLDEN_REFERENCE_NOTES[record.departmentId] ??
          `v1 — canonical golden reference for ${record.name}`
      ),
    ])
  ) as Record<CanonicalMainDepartmentId, GoldenReferencePack>;

export function resolveGoldenReferencePack(departmentId: CanonicalMainDepartmentId): GoldenReferencePack {
  return GOLDEN_REFERENCE_LIBRARY[departmentId];
}

export function listGoldenReferenceAssetPaths(departmentId: CanonicalMainDepartmentId): string[] {
  const pack = resolveGoldenReferencePack(departmentId);
  return [
    pack.heroRender.assetPath,
    pack.materialBoard.assetPath,
    pack.lightingBoard.assetPath,
    pack.cameraBoard.assetPath,
    pack.compositionBoard.assetPath,
    pack.geometryBoard.assetPath,
    pack.environmentBoard.assetPath,
    pack.moodBoard.assetPath,
    pack.desktopReference.assetPath,
    pack.mobileReference.assetPath,
    ...pack.signatureDetails.map((b) => b.assetPath),
  ];
}
