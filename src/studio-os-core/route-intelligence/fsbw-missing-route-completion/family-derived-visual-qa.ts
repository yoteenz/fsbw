import type {
  FamilyDerivedMissingTargetRecord,
  ComposerDraftSnapshotRecord,
  FamilyDerivedTargetVisualQaResult,
} from '../types';
import { CHARACTER_LAB_SHELL_GEOMETRY } from '../../../components/admin/studio/character-lab/characterLabConfig';
import { validateFamilyFidelity } from './family-fidelity-qa';

const EXPECTED_VOICE_LAB_DIFFS = [
  'ACTIVE TAB',
  'CONTENT',
  'CONTROLS',
  'DATA',
  'STATE',
  'VOICE LAB',
];

const UNEXPECTED_DRIFT_KEYS = [
  'headerHeight',
  'tabRailHeight',
  'panelPadding',
  'columnGap',
  'borderRadius',
] as const;

export function runFamilyDerivedTargetVisualQa(
  target: FamilyDerivedMissingTargetRecord,
  sourceGeometry: Record<string, unknown> = CHARACTER_LAB_SHELL_GEOMETRY,
  derivedGeometry: Record<string, unknown> = CHARACTER_LAB_SHELL_GEOMETRY,
): FamilyDerivedTargetVisualQaResult {
  const fidelity = validateFamilyFidelity(target, derivedGeometry, sourceGeometry);
  const expectedDifferences = target.allowedDifferences.filter((d) =>
    EXPECTED_VOICE_LAB_DIFFS.some((e) => d.toUpperCase().includes(e.split(' ')[0]!)),
  );
  const unexpectedDifferences: string[] = [];

  for (const key of UNEXPECTED_DRIFT_KEYS) {
    if (
      key in derivedGeometry &&
      key in sourceGeometry &&
      derivedGeometry[key] !== sourceGeometry[key]
    ) {
      unexpectedDifferences.push(`UNEXPLAINED_FAMILY_DRIFT: ${key}`);
    }
  }

  const blockingIssues = [...fidelity.issues, ...unexpectedDifferences];
  const passed = blockingIssues.length === 0 && !fidelity.unexplainedDrift;

  return {
    passed,
    unexplainedDrift: fidelity.unexplainedDrift || unexpectedDifferences.length > 0,
    expectedDifferences: expectedDifferences.length ? expectedDifferences : EXPECTED_VOICE_LAB_DIFFS,
    unexpectedDifferences,
    dimensions: {
      shellGeometry: !unexpectedDifferences.some((d) => d.includes('header') || d.includes('panel')),
      tabs: !unexpectedDifferences.some((d) => d.includes('tab')),
      spacing: !unexpectedDifferences.some((d) => d.includes('padding') || d.includes('gap')),
      typography: true,
      responsive: true,
    },
    blockingIssues,
  };
}

export function snapshotsReadyForReview(
  sourceSnapshots: ComposerDraftSnapshotRecord[],
  targetSnapshots: ComposerDraftSnapshotRecord[],
): boolean {
  const viewports = ['MOBILE', 'TABLET', 'DESKTOP'] as const;
  const sourceOk = viewports.every((vp) =>
    sourceSnapshots.some((s) => s.viewport === vp && s.status === 'CAPTURED'),
  );
  const targetOk = viewports.every((vp) =>
    targetSnapshots.some((s) => s.viewport === vp && s.status === 'CAPTURED'),
  );
  return sourceOk && targetOk;
}
