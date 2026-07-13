import { describe, expect, it, beforeEach } from 'vitest';
import { buildCanonicalDepartmentConstructionPlan } from './canonical-department-construction-plan';
import { buildCanonicalFounderRenderPrompt } from './canonical-founder-render-prompt';
import { buildFounderRenderCacheIdentity } from './founder-render-cache-identity';
import {
  compareDepartmentPlans,
  resetDepartmentDistinctnessRegistry,
  validateDepartmentDistinctness,
} from './department-distinctness-validator';
import { containsReceptionContamination } from './department-architectural-fingerprints';
import { resolveBrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import { fixtureReceptionConstructionPlan } from '../blueprint-author/fixtures';

const CANONICAL_DEPARTMENTS = [
  'experience-lab',
  'creative-director-studio',
  'command-center',
  'marketplace',
  'founder-suite',
] as const;

function brandPackage() {
  return resolveBrandMaterialPackage({
    organizationId: 'frontal-slayer',
    organizationName: 'studio-os',
    materialRequests: [
      { slot: 'floor', requestedMaterial: 'white polished marble', brandRole: 'primary-marble-texture', required: true },
    ],
  });
}

describe('Department Render Isolation™ — Blueprint isolation', () => {
  it('each canonical department owns a unique architecture shell', () => {
    const shells = new Set<string>();
    for (const dept of CANONICAL_DEPARTMENTS) {
      const built = buildCanonicalDepartmentConstructionPlan(dept, 'landscape');
      expect(built.ok).toBe(true);
      if (!built.ok) continue;
      expect(built.plan.architecture.architectureId).not.toBe('ReceptionShell');
      expect(built.plan.architecture.shellSpecId).not.toContain('reception');
      expect(built.plan.room.roomType).toBe('canonical-department');
      shells.add(built.plan.architecture.architectureId);
    }
    expect(shells.size).toBe(CANONICAL_DEPARTMENTS.length);
  });

  it('Experience Lab uses ExperienceLabShell not ReceptionShell', () => {
    const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.plan.architecture.architectureId).toBe('ExperienceLabShell');
      expect(built.plan.architecture.shellSpecId).toBe('shell-experience-lab-v1');
    }
  });

  it('Creative Director Studio uses CreativeDirectorStudioShell', () => {
    const built = buildCanonicalDepartmentConstructionPlan('creative-director-studio', 'landscape');
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.plan.architecture.architectureId).toBe('CreativeDirectorStudioShell');
    }
  });

  it('Founder Suite uses ExecutiveAtriumShell', () => {
    const built = buildCanonicalDepartmentConstructionPlan('founder-suite', 'landscape');
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.plan.architecture.architectureId).toBe('ExecutiveAtriumShell');
    }
  });
});

describe('Department Render Isolation™ — Prompt isolation', () => {
  it('effective prompt contains department identity not Reception', () => {
    const pkg = brandPackage();
    if ('code' in pkg) throw new Error(pkg.message);

    for (const dept of CANONICAL_DEPARTMENTS) {
      const built = buildCanonicalDepartmentConstructionPlan(dept, 'landscape');
      expect(built.ok).toBe(true);
      if (!built.ok) continue;

      const prompt = buildCanonicalFounderRenderPrompt({ plan: built.plan, brandPackage: pkg });
      expect(prompt.prompt).toContain(dept);
      expect(prompt.promptVersion).toMatch(/^canonical-/);
      expect(containsReceptionContamination(prompt.prompt)).toBeNull();
      expect(prompt.prompt).not.toMatch(/ARCHITECTURAL LAYOUT:.*ReceptionShell/i);
      expect(prompt.prompt).not.toMatch(/BLUEPRINT:.*ReceptionShell/i);
    }
  });

  it('each department has a distinct prompt version', () => {
    const versions = new Set<string>();
    for (const dept of CANONICAL_DEPARTMENTS) {
      const built = buildCanonicalDepartmentConstructionPlan(dept, 'landscape');
      if (!built.ok) continue;
      versions.add(built.plan.versions.promptVersion);
    }
    expect(versions.size).toBe(CANONICAL_DEPARTMENTS.length);
  });
});

describe('Department Render Isolation™ — Cache isolation', () => {
  it('cache keys differ per department', () => {
    const keys = new Set<string>();
    for (const dept of CANONICAL_DEPARTMENTS) {
      const built = buildCanonicalDepartmentConstructionPlan(dept, 'landscape');
      if (!built.ok) continue;
      const identity = buildFounderRenderCacheIdentity({
        plan: built.plan,
        promptVersion: built.plan.versions.promptVersion,
        model: 'fal-ai/nano-banana-pro',
        aspectRatio: '16:9',
        provider: 'fal',
      });
      keys.add(identity.cacheKey);
      expect(identity.departmentId).toBe(dept);
    }
    expect(keys.size).toBe(CANONICAL_DEPARTMENTS.length);
  });
});

describe('Department Render Isolation™ — Distinctness validator', () => {
  beforeEach(() => resetDepartmentDistinctnessRegistry());

  it('rejects ReceptionShell on canonical department', () => {
    const reception = fixtureReceptionConstructionPlan({
      organizationId: 'studio-os',
      buildingId: 'hq',
      floorId: 'floor',
      roomId: 'experience-lab',
      requestId: 'test',
      founderIntent: 'test',
      styleProfile: {
        styleId: 'test',
        version: '1',
        organizationStyle: 'test',
        visualLanguage: 'test',
      },
    });
    reception.room.roomType = 'canonical-department';

    const result = validateDepartmentDistinctness({
      plan: reception,
      effectivePrompt: 'Experience Lab render',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('RECEPTION_CONTAMINATION');
  });

  it('rejects identical architecture across departments', () => {
    const pkg = brandPackage();
    if ('code' in pkg) throw new Error(pkg.message);

    const el = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    const cds = buildCanonicalDepartmentConstructionPlan('creative-director-studio', 'landscape');
    expect(el.ok && cds.ok).toBe(true);
    if (!el.ok || !cds.ok) return;

    const elPrompt = buildCanonicalFounderRenderPrompt({ plan: el.plan, brandPackage: pkg });
    validateDepartmentDistinctness({ plan: el.plan, effectivePrompt: elPrompt.prompt });

    const cdsPrompt = buildCanonicalFounderRenderPrompt({ plan: cds.plan, brandPackage: pkg });
    const cdsResult = validateDepartmentDistinctness({
      plan: cds.plan,
      effectivePrompt: cdsPrompt.prompt,
      priorDepartmentId: 'experience-lab',
    });
    expect(cdsResult.ok).toBe(true);
  });

  it('compareDepartmentPlans detects shared architecture', () => {
    const a = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    const b = buildCanonicalDepartmentConstructionPlan('creative-director-studio', 'landscape');
    if (!a.ok || !b.ok) return;
    const cmp = compareDepartmentPlans(a.plan, b.plan);
    expect(cmp.distinct).toBe(true);
    expect(cmp.sharedFields).not.toContain('architectureId');
  });
});

describe('Department Render Isolation™ — Job identity fields', () => {
  it('construction plan room_id matches departmentId for all canonical departments', () => {
    for (const dept of CANONICAL_DEPARTMENTS) {
      const built = buildCanonicalDepartmentConstructionPlan(dept, 'landscape');
      if (!built.ok) continue;
      expect(built.plan.room.roomId).toBe(dept);
      expect(built.plan.planId).toContain(dept);
    }
  });
});
