import type {
  GeometryRole,
  TextureColorSpace,
  TextureMapCategory,
  UvMappingStrategy,
  ValidationSeverity,
  MaterialFamily,
  MaterialLayerKind,
  MaterialConversionProfileId,
} from './types';

export type GeometryArtifactRef = {
  role: GeometryRole;
  assetRef: string;
  triangleCount?: number;
  objectNamingStable: boolean;
  pivotDocumented: boolean;
  validationSeverity?: ValidationSeverity;
  notes?: string;
};

export type TopologyCheckId =
  | 'NONEMPTY_GEOMETRY'
  | 'FINITE_TRANSFORMS'
  | 'CONSISTENT_NORMALS'
  | 'DEGENERATE_TRIANGLES'
  | 'DUPLICATE_GEOMETRY'
  | 'MESH_ORIENTATION'
  | 'OBJECT_HIERARCHY'
  | 'OPEN_SURFACES_ALLOWED';

export type TopologyCheckResult = {
  checkId: TopologyCheckId;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
};

export type UvSetContract = {
  uvSetName: string;
  channelIndex: number;
  mappingStrategy: UvMappingStrategy;
  texelDensityTarget?: number;
  allowIntentionalOverlap: boolean;
  lightmapRequired: boolean;
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

export type TextureMapRecord = {
  mapId: string;
  category: TextureMapCategory;
  sourceFileRef?: string;
  derivedFileRef?: string;
  materialId?: string;
  uvSetName?: string;
  resolution?: [number, number];
  fileFormat?: string;
  colorSpace: TextureColorSpace;
  channelPacking?: string;
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED';
};

export type TextureBakeJobRecord = {
  bakeJobId: string;
  bakeType: 'NORMAL' | 'AO' | 'CURVATURE' | 'HEIGHT' | 'MASK' | 'OTHER';
  sourceGeometryRef: string;
  targetGeometryRef: string;
  uvTarget: string;
  resolution: number;
  padding: number;
  outputMapRefs: string[];
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

export type MaterialParameterSnapshot = {
  baseColor?: string;
  roughness?: number;
  metallic?: number;
  transmission?: number;
  opacity?: number;
  ior?: number;
  normalStrength?: number;
  emissionStrength?: number;
};

export type MaterialRecord = {
  materialId: string;
  layerKind: MaterialLayerKind;
  family: MaterialFamily;
  parameters?: MaterialParameterSnapshot;
  textureSetRefs: string[];
  sourceShaderRef?: string;
};

export type MaterialConversionReport = {
  fromProfile: MaterialConversionProfileId;
  toProfile: MaterialConversionProfileId;
  transferredParameters: string[];
  convertedTextures: string[];
  droppedFeatures: string[];
  unsupportedEffects: string[];
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'FAILED' | 'NOT_APPLICABLE';
  notes?: string;
};

/** Expected color space by map category (schema validation only — not file inspection). */
export function expectedColorSpaceForMapCategory(category: TextureMapCategory): TextureColorSpace {
  if (category === 'BASE_COLOR' || category === 'EMISSIVE') return 'SRGB';
  if (
    category === 'NORMAL' ||
    category === 'ROUGHNESS' ||
    category === 'METALLIC' ||
    category === 'AMBIENT_OCCLUSION' ||
    category === 'HEIGHT' ||
    category === 'MASK'
  ) {
    return 'NON_COLOR_DATA';
  }
  return 'LINEAR';
}

export function validateTextureMapColorSpace(map: TextureMapRecord): string[] {
  const errors: string[] = [];
  const expected = expectedColorSpaceForMapCategory(map.category);
  if (map.colorSpace !== expected && map.category !== 'OTHER_CUSTOM' && map.category !== 'OPACITY') {
    errors.push(
      `Map ${map.mapId}: category ${map.category} expects ${expected}, got ${map.colorSpace}`
    );
  }
  return errors;
}

export function validateUvContract(uv: UvSetContract, deliveryRequiresLightmap: boolean): string[] {
  const errors: string[] = [];
  if (deliveryRequiresLightmap && !uv.lightmapRequired && uv.mappingStrategy !== 'LIGHTMAP_UV') {
    errors.push(`UV set ${uv.uvSetName}: lightmap UV required for target profile`);
  }
  if (uv.validationStatus === 'FAIL') {
    errors.push(`UV set ${uv.uvSetName}: validation failed`);
  }
  return errors;
}

export function validateGeometryArtifacts(
  artifacts: GeometryArtifactRef[],
  requiredRoles: GeometryRole[]
): TopologyCheckResult[] {
  const results: TopologyCheckResult[] = [];
  for (const role of requiredRoles) {
    const found = artifacts.find((a) => a.role === role);
    results.push({
      checkId: 'NONEMPTY_GEOMETRY',
      severity: 'CRITICAL',
      passed: Boolean(found?.assetRef),
      message: found?.assetRef
        ? `${role} present`
        : `Missing required geometry role ${role}`,
    });
  }
  return results;
}
