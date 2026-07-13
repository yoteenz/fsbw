import { describe, expect, it } from 'vitest';
import {
  ARCHITECTURE_LAW_001_CODE,
  ARCHITECTURE_LAW_001_MESSAGE,
  DEPARTMENT_UI_SOCKET_IDS,
  appendArchitectureLawToNegativePrompt,
  buildArchitectureLawNegativeDirective,
  buildArchitectureLawPositiveDirective,
  defineDefaultDepartmentUiSockets,
  assertRequiredUiSocketsPresent,
  detectAiGeneratedProductionUi,
  validateDepartmentBlueprintForLaw001,
  validateFounderRenderBeforeApproval,
  attachUiSocketBlueprintToConstructionPlan,
} from './index';
import { buildFounderFullRoomPreviewPrompt } from '../founder-render/prompt-builder';
import { authorConstructionPlan, fixtureFounderReceptionRequest } from '../blueprint-author';
import { resolveBrandMaterialPackage, CIRCULAR_CONCIERGE_DESK_SPEC, isBrandAssetResolutionError } from '../creative-production/brand-asset-grounding';

describe('Architecture Law #001 contract', () => {
  it('defines 16 department UI socket ids', () => {
    expect(DEPARTMENT_UI_SOCKET_IDS.length).toBe(16);
    expect(DEPARTMENT_UI_SOCKET_IDS).toContain('COMMAND_DOCK');
    expect(DEPARTMENT_UI_SOCKET_IDS).toContain('WORKBENCH');
    expect(DEPARTMENT_UI_SOCKET_IDS).toContain('VIEWPORT');
  });

  it('includes law directives in prompt blocks', () => {
    expect(buildArchitectureLawPositiveDirective()).toContain('ARCHITECTURE LAW #001');
    expect(buildArchitectureLawNegativeDirective()).toContain('typography');
    expect(buildArchitectureLawNegativeDirective()).toContain('logos');
  });
});

describe('UI Socket Registry™', () => {
  it('defines default sockets with Command Dock and Workbench', () => {
    const blueprint = defineDefaultDepartmentUiSockets('experience-lab');
    expect(blueprint.sockets.length).toBeGreaterThanOrEqual(16);
    expect(blueprint.sockets.find((s) => s.socketId === 'COMMAND_DOCK')?.required).toBe(true);
    expect(blueprint.sockets.find((s) => s.socketId === 'WORKBENCH')?.required).toBe(true);
    expect(assertRequiredUiSocketsPresent(blueprint).ok).toBe(true);
  });

  it('validates department blueprint socket completeness', () => {
    expect(validateDepartmentBlueprintForLaw001({ departmentId: 'creative-director-studio' }).ok).toBe(true);
  });
});

describe('Immune System — AI UI detection', () => {
  it('passes clean architectural render without readable text', () => {
    const result = detectAiGeneratedProductionUi({
      detectedText: [''],
      detectedLabels: ['glass', 'furniture', 'interior'],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects render with detected typography', () => {
    const result = validateFounderRenderBeforeApproval({
      detectedText: ['ORDER #331', 'Approve'],
      detectedLabels: ['text', 'dashboard'],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe(ARCHITECTURE_LAW_001_CODE);
      expect(result.message).toBe(ARCHITECTURE_LAW_001_MESSAGE);
      expect(result.violations.length).toBeGreaterThan(0);
    }
  });

  it('rejects logo and menu labels', () => {
    const result = detectAiGeneratedProductionUi({
      detectedLabels: ['company logo', 'navigation menu'],
    });
    expect(result.ok).toBe(false);
  });
});

describe('Founder render prompt integration', () => {
  it('appends law #001 negative directives to founder preview prompt', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const brandPackage = resolveBrandMaterialPackage({
      organizationId: 'frontal-slayer',
      organizationName: 'Frontal Slayer',
      materialRequests: CIRCULAR_CONCIERGE_DESK_SPEC.materialRequests,
    });
    expect(isBrandAssetResolutionError(brandPackage)).toBe(false);
    if (isBrandAssetResolutionError(brandPackage)) throw new Error('Expected brand package');
    const built = buildFounderFullRoomPreviewPrompt({ plan, brandPackage });
    const enrichedNegative = appendArchitectureLawToNegativePrompt(built.negativePrompt);
    expect(enrichedNegative).toContain('typography');
    expect(enrichedNegative).toContain('logos');
    expect(enrichedNegative).toContain('UI mockup');
  });
});

describe('Construction plan UI socket attachment', () => {
  it('attaches ui mount sockets to construction plan', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const enriched = attachUiSocketBlueprintToConstructionPlan({
      plan,
      departmentId: 'experience-lab',
    });
    expect(enriched.uiMountSockets.departmentId).toBe('experience-lab');
    expect(enriched.uiMountSockets.sockets.length).toBeGreaterThanOrEqual(16);
  });
});
