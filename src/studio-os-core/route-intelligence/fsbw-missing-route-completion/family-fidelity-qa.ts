import type {
  FamilyDerivedMissingTargetRecord,
  MissingDesignTargetType,
  MissingTargetReviewStatus,
} from '../types';

export type FamilyFidelityCheck = {
  passed: boolean;
  unexplainedDrift: boolean;
  issues: string[];
};

const PRESERVED_SHELL_PROPS = [
  'shared shell',
  'header',
  'navigation',
  'tab dimensions',
  'panel alignment',
  'spacing',
  'typography',
  'breakpoints',
  'responsive hierarchy',
  'workspace chrome',
];

export function validateFamilyFidelity(
  target: FamilyDerivedMissingTargetRecord,
  derivedGeometry?: Record<string, unknown>,
  sourceGeometry?: Record<string, unknown>,
): FamilyFidelityCheck {
  const issues: string[] = [];
  let unexplainedDrift = false;

  for (const prop of PRESERVED_SHELL_PROPS) {
    if (!target.preservedProperties.some((p) => p.toLowerCase().includes(prop.split(' ')[0]!))) {
      issues.push(`missing preserved property declaration: ${prop}`);
    }
  }

  if (derivedGeometry && sourceGeometry) {
    for (const key of ['headerHeight', 'tabRailWidth', 'panelPadding']) {
      if (
        key in derivedGeometry &&
        key in sourceGeometry &&
        derivedGeometry[key] !== sourceGeometry[key] &&
        !target.allowedDifferences.some((d) => d.toLowerCase().includes(key.toLowerCase()))
      ) {
        unexplainedDrift = true;
        issues.push(`UNEXPLAINED_FAMILY_DRIFT: ${key}`);
      }
    }
  }

  return {
    passed: issues.length === 0 && !unexplainedDrift,
    unexplainedDrift,
    issues,
  };
}

export function defaultPreservedProperties(targetType: MissingDesignTargetType): string[] {
  const base = ['shared shell', 'header', 'navigation', 'spacing', 'typography', 'workspace chrome'];
  if (targetType === 'TAB_STATE') {
    return [...base, 'tab dimensions', 'tab rail', 'panel alignment', 'breakpoints', 'responsive hierarchy'];
  }
  if (targetType === 'MATERIAL_SCREEN') {
    return [...base, 'panel alignment', 'responsive hierarchy'];
  }
  return base;
}

export function defaultAllowedDifferences(targetType: MissingDesignTargetType, displayName: string): string[] {
  const diffs = ['CONTENT', 'CONTROLS', 'DATA', 'STATE'];
  if (targetType === 'TAB_STATE') {
    return ['ACTIVE TAB', ...diffs, displayName.toUpperCase()];
  }
  return diffs;
}

export function reviewStatusForTarget(
  targetType: MissingDesignTargetType,
  confidence: FamilyDerivedMissingTargetRecord['derivationConfidence'],
  captureRequired: boolean,
): MissingTargetReviewStatus {
  if (targetType === 'UNIQUE_EXPERIENCE') return 'UNCLASSIFIED';
  if (confidence === 'LOW') return 'UNCLASSIFIED';
  if (captureRequired) return 'SOURCE_CAPTURE_REQUIRED';
  return 'READY_FOR_DERIVATION';
}
