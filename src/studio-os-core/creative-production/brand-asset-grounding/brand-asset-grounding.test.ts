import { describe, expect, it } from 'vitest';
import {
  findBrandAssetByRole,
  resolveBrandMaterialPackage,
  isBrandAssetResolutionError,
  validateReferencePolicy,
  CIRCULAR_CONCIERGE_DESK_SPEC,
  CIRCULAR_CONCIERGE_MATERIAL_MAPPINGS,
} from './index';
import { validateMaterialFidelity, materialFidelityBlocksApproval } from '../../scene-stack/verified-asset-production/material-fidelity-validation';

describe('Brand Asset Grounding', () => {
  it('finds canonical marble by role', () => {
    const marble = findBrandAssetByRole('frontal-slayer', 'primary-marble-texture');
    expect(marble).not.toBeNull();
    expect(marble?.canonicalUrl).toBe('/assets/marble-half.png');
    expect(marble?.organizationId).toBe('frontal-slayer');
  });

  it('resolves material package for concierge desk fixture', () => {
    const pkg = resolveBrandMaterialPackage({
      organizationId: 'frontal-slayer',
      organizationName: 'Frontal Slayer',
      materialRequests: CIRCULAR_CONCIERGE_DESK_SPEC.materialRequests,
    });
    expect(isBrandAssetResolutionError(pkg)).toBe(false);
    if (!isBrandAssetResolutionError(pkg)) {
      expect(pkg.referenceUrls).toContain('/assets/marble-half.png');
      expect(pkg.materialMappings.deskBase).toBe('primary-marble-texture');
      expect(pkg.referenceChecksums.length).toBeGreaterThan(0);
    }
  });

  it('blocks dispatch when required marble missing for unknown org', () => {
    const result = resolveBrandMaterialPackage({
      organizationId: 'unknown-org-no-vault',
      materialRequests: [{ slot: 'deskBase', requestedMaterial: 'white polished marble', required: true }],
    });
    expect(isBrandAssetResolutionError(result)).toBe(true);
    if (isBrandAssetResolutionError(result)) {
      expect(result.code).toBe('BRAND_ASSET_REQUIRED_MISSING');
    }
  });

  it('prohibits generic marble fallback when required asset missing', () => {
    const result = resolveBrandMaterialPackage({
      organizationId: 'studio-os',
      materialRequests: [{ slot: 'deskBase', requestedMaterial: 'white polished marble', required: true }],
    });
    expect(isBrandAssetResolutionError(result)).toBe(true);
  });

  it('allows material reference', () => {
    const policy = validateReferencePolicy({
      targetOrganizationId: 'frontal-slayer',
      references: [
        {
          url: '/assets/marble-half.png',
          role: 'material-reference',
          organizationId: 'frontal-slayer',
        },
      ],
    });
    expect(policy.ok).toBe(true);
  });

  it('rejects full-scene reference', () => {
    const policy = validateReferencePolicy({
      targetOrganizationId: 'frontal-slayer',
      references: [
        {
          url: 'https://cdn.example.com/environment-shell.png',
          role: 'forbidden-scene-reference',
          organizationId: 'frontal-slayer',
        },
      ],
    });
    expect(policy.ok).toBe(false);
    if (!policy.ok) expect(policy.code).toBe('FORBIDDEN_SCENE_REFERENCE');
  });

  it('blocks cross-organization brand leakage', () => {
    const policy = validateReferencePolicy({
      targetOrganizationId: 'frontal-slayer',
      references: [
        {
          url: '/assets/marble-half.png',
          role: 'material-reference',
          organizationId: 'other-org',
        },
      ],
    });
    expect(policy.ok).toBe(false);
    if (!policy.ok) expect(policy.code).toBe('CROSS_ORG_BRAND_LEAK');
  });

  it('includes material mappings in package', () => {
    expect(CIRCULAR_CONCIERGE_MATERIAL_MAPPINGS.deskBase).toBe('primary-marble-texture');
    expect(CIRCULAR_CONCIERGE_MATERIAL_MAPPINGS.accentLighting).toContain('#EB1C24');
  });

  it('rejects wrong marble in material fidelity validation', () => {
    const pkg = resolveBrandMaterialPackage({
      organizationId: 'frontal-slayer',
      materialRequests: CIRCULAR_CONCIERGE_DESK_SPEC.materialRequests,
    });
    if (isBrandAssetResolutionError(pkg)) throw new Error('expected package');
    const result = validateMaterialFidelity({
      brandMaterialPackage: pkg,
      organizationId: 'frontal-slayer',
      wrongMarbleSuspect: true,
      brandMarbleExpected: true,
    });
    expect(result.pass).toBe(false);
    expect(materialFidelityBlocksApproval(result.verdict)).toBe(true);
  });

  it('rejects generic lookalike marble', () => {
    const pkg = resolveBrandMaterialPackage({
      organizationId: 'frontal-slayer',
      materialRequests: CIRCULAR_CONCIERGE_DESK_SPEC.materialRequests,
    });
    if (isBrandAssetResolutionError(pkg)) throw new Error('expected package');
    const result = validateMaterialFidelity({
      brandMaterialPackage: pkg,
      organizationId: 'frontal-slayer',
      genericMarbleSuspect: true,
      brandMarbleExpected: true,
    });
    expect(result.verdict).toBe('generic-material-substitution');
    expect(result.pass).toBe(false);
  });

  it('passes correct brand marble', () => {
    const pkg = resolveBrandMaterialPackage({
      organizationId: 'frontal-slayer',
      materialRequests: CIRCULAR_CONCIERGE_DESK_SPEC.materialRequests,
    });
    if (isBrandAssetResolutionError(pkg)) throw new Error('expected package');
    const result = validateMaterialFidelity({
      brandMaterialPackage: pkg,
      organizationId: 'frontal-slayer',
      materialMatchConfidence: 0.9,
      brandMarbleExpected: true,
    });
    expect(result.pass).toBe(true);
    expect(result.verdict).toBe('exact-brand-material-pass');
  });
});
