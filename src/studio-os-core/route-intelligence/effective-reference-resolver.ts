import type {
  DesignFamilyRecord,
  DesignFamilyReferenceAuthority,
  DesignScreenReferenceInheritance,
  EffectiveDesignReference,
  ReferenceNecessityAuditRecord,
  ReferenceNecessityClassification,
  ViewportClass,
} from './types';

export type EffectiveReferenceInput = {
  projectId: string;
  designScreenId: string;
  viewportClass: ViewportClass;
  necessityAudits: ReferenceNecessityAuditRecord[];
  inheritances: DesignScreenReferenceInheritance[];
  familyAuthorities: DesignFamilyReferenceAuthority[];
  families: DesignFamilyRecord[];
  screenOverrides?: Record<string, Partial<Record<ViewportClass, string>>>;
};

export function resolveEffectiveDesignReference(input: EffectiveReferenceInput): EffectiveDesignReference {
  const {
    designScreenId,
    viewportClass,
    necessityAudits,
    inheritances,
    familyAuthorities,
    families,
    screenOverrides,
  } = input;

  const audit = necessityAudits.find(
    (a) => a.designScreenId === designScreenId && a.viewportClass === viewportClass,
  );
  const inheritance = inheritances.find(
    (i) => i.designScreenId === designScreenId && i.viewportClass === viewportClass,
  );
  const necessity = audit?.classification ?? 'UNKNOWN_REVIEW_REQUIRED';
  const path: string[] = [];

  const overrideRef = screenOverrides?.[designScreenId]?.[viewportClass] ?? inheritance?.overrideReferenceId;
  if (overrideRef) {
    path.push('screen_override');
    return {
      referenceId: overrideRef,
      authorityLevel: 'SCREEN_OVERRIDE',
      designFamilyId: inheritance?.designFamilyId,
      designScreenId,
      viewportClass,
      inheritancePath: path,
      necessityClassification: necessity,
    };
  }

  if (inheritance?.inheritanceStatus === 'VIEWPORT_OVERRIDE') {
    path.push('viewport_override');
    return {
      referenceId: inheritance.overrideReferenceId,
      authorityLevel: 'VIEWPORT_OVERRIDE',
      designFamilyId: inheritance.designFamilyId,
      designScreenId,
      viewportClass,
      inheritancePath: path,
      necessityClassification: necessity,
    };
  }

  const family = families.find((f) => f.designFamilyId === inheritance?.designFamilyId);
  const familyAuth = familyAuthorities.find(
    (a) => a.designFamilyId === inheritance?.designFamilyId && a.viewportClass === viewportClass,
  );

  if (
    inheritance?.inheritFromFamily &&
    familyAuth?.canonicalReferenceId &&
    necessity !== 'UNIQUE_REFERENCE_REQUIRED'
  ) {
    path.push('family_reference', family?.designFamilyId ?? '');
    return {
      referenceId: familyAuth.canonicalReferenceId,
      authorityLevel: 'FAMILY_REFERENCE',
      designFamilyId: inheritance.designFamilyId,
      designScreenId,
      viewportClass,
      inheritancePath: path.filter(Boolean),
      necessityClassification: necessity,
    };
  }

  if (audit?.currentReferenceId) {
    path.push('screen_canonical');
    return {
      referenceId: audit.currentReferenceId,
      authorityLevel: 'FAMILY_REFERENCE',
      designFamilyId: inheritance?.designFamilyId,
      designScreenId,
      viewportClass,
      inheritancePath: path,
      necessityClassification: necessity,
    };
  }

  path.push('none');
  return {
    referenceId: undefined,
    authorityLevel: 'NONE',
    designFamilyId: inheritance?.designFamilyId,
    designScreenId,
    viewportClass,
    inheritancePath: path,
    necessityClassification: necessity,
  };
}

/** P0.VR.2 handoff — effective reference authority for reconstruction pipeline */
export function buildEffectiveReferenceAuthorityHandoff(
  input: EffectiveReferenceInput,
): {
  effectiveReferenceAuthority: EffectiveDesignReference;
  assetOnlyVariant: boolean;
  useProductAssetFactory: boolean;
} {
  const effective = resolveEffectiveDesignReference(input);
  const assetOnly = effective.necessityClassification === 'ASSET_ONLY_VARIANT';
  return {
    effectiveReferenceAuthority: effective,
    assetOnlyVariant: assetOnly,
    useProductAssetFactory: assetOnly && input.projectId === 'frontal-slayer',
  };
}

export function isGenerationRequired(classification: ReferenceNecessityClassification): boolean {
  return (
    classification === 'UNIQUE_REFERENCE_REQUIRED' ||
    classification === 'VIEWPORT_SPECIFIC_REFERENCE_REQUIRED' ||
    classification === 'UNKNOWN_REVIEW_REQUIRED'
  );
}
