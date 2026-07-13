import { describe, expect, it } from 'vitest';
import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../canonical-studio-world/canonical-department-registry';
import { buildCanonicalDepartmentConstructionPlan } from '../canonical-studio-world/canonical-department-construction-plan';
import { resolveBrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import {
  ARCHITECTURAL_DNA_REGISTRY,
  resolveArchitecturalDna,
  listArchitecturalDnaProfiles,
} from './registry/dna-registry';
import { GOLDEN_REFERENCE_LIBRARY, resolveGoldenReferencePack } from './references/golden-reference-library';
import { resolveDepartmentNegativePrompts } from './references/negative-prompt-library';
import { resolveCompanyDna } from './registry/company-dna-registry';
import { compileFounderRenderPrompt } from './compiler/founder-render-prompt-compiler';
import {
  validateDnaRegistryCompleteness,
  validateDnaCrossContamination,
  assertExperienceLabNotReception,
  assertCdsNotExperienceLab,
} from './validators/dna-validator';
import { FOUNDER_RENDER_PROMPT_COMPILER_VERSION } from './schemas/compiler-contract';

function brandPackage() {
  const pkg = resolveBrandMaterialPackage({
    organizationId: 'frontal-slayer',
    organizationName: 'studio-os',
    materialRequests: [
      { slot: 'floor', requestedMaterial: 'white polished marble', brandRole: 'primary-marble-texture', required: true },
    ],
  });
  if ('code' in pkg) throw new Error(pkg.message);
  return pkg;
}

describe('Architectural DNA Registry™', () => {
  it('every canonical department owns a DNA profile', () => {
    expect(listArchitecturalDnaProfiles().length).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      const dna = ARCHITECTURAL_DNA_REGISTRY[record.departmentId];
      expect(dna).toBeDefined();
      expect(dna.departmentId).toBe(record.departmentId);
      expect(dna.positivePromptTemplate.length).toBeGreaterThan(10);
      expect(dna.forbiddenElements.length).toBeGreaterThan(0);
    }
  });

  it('registry completeness validation passes for all departments', () => {
    const results = validateDnaRegistryCompleteness();
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it('every department owns a Golden Reference Pack', () => {
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      const pack = GOLDEN_REFERENCE_LIBRARY[record.departmentId];
      expect(pack).toBeDefined();
      expect(pack.packId).toBe(`golden-ref-${record.departmentId}-v1`);
      expect(pack.heroRender.assetPath).toContain(record.departmentId);
      expect(pack.desktopReference.assetPath).toContain('desktop-21x9');
      expect(pack.mobileReference.assetPath).toContain('mobile-9x16');
    }
  });
});

describe('Experience Lab & Creative Director Studio DNA', () => {
  it('Experience Lab DNA v1 preserves approved architectural studio characteristics', () => {
    const dna = resolveArchitecturalDna('experience-lab');
    expect(dna.profileRevision).toBe(1);
    expect(dna.heroObject).toContain('holographic');
    expect(dna.materials.metalPalette).toContain('champagne');
    expect(dna.forbiddenElements).toContain('reception desk');
    expect(dna.signatureTechnology).toContain('holographic room model');
  });

  it('Creative Director Studio DNA v1 preserves approved production facility characteristics', () => {
    const dna = resolveArchitecturalDna('creative-director-studio');
    expect(dna.profileRevision).toBe(1);
    expect(dna.materials.floorMaterial).toContain('dark stone');
    expect(dna.materials.wallMaterial).toContain('black architectural glass');
    expect(dna.forbiddenElements).toContain('blueprint holograms');
    expect(dna.signatureFurniture).toContain('lighting rigs');
  });

  it('Experience Lab cannot compile Reception DNA', () => {
    expect(assertExperienceLabNotReception(resolveArchitecturalDna('experience-lab')).ok).toBe(true);
    const elDna = resolveArchitecturalDna('experience-lab');
    expect(elDna.positivePromptTemplate).not.toContain('reception desk');
    expect(elDna.architecturalStyle).not.toContain('reception');
  });

  it('Creative Director Studio cannot compile Experience Lab DNA', () => {
    const result = assertCdsNotExperienceLab(
      resolveArchitecturalDna('creative-director-studio'),
      resolveArchitecturalDna('experience-lab')
    );
    expect(result.ok).toBe(true);
  });
});

describe('FounderRenderPromptCompiler™', () => {
  it('compiles prompt from DNA not hardcoded text', () => {
    const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    expect(built.ok).toBe(true);
    if (!built.ok) return;

    const compiled = compileFounderRenderPrompt({
      departmentId: 'experience-lab',
      plan: built.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'landscape',
    });

    expect(compiled.compilerVersion).toBe(FOUNDER_RENDER_PROMPT_COMPILER_VERSION);
    expect(compiled.prompt).toContain('COMPILED FOUNDER RENDER');
    expect(compiled.prompt).toContain('DEPARTMENT DNA');
    expect(compiled.prompt).toContain('GOLDEN REFERENCE PACK');
    expect(compiled.prompt).toContain('experience-lab');
    expect(compiled.prompt).toContain('holographic');
    expect(compiled.negativePrompt.length).toBeGreaterThan(20);
    expect(compiled.diagnostics.promptCompilerVersion).toBe(FOUNDER_RENDER_PROMPT_COMPILER_VERSION);
  });

  it('loads correct DNA per department', () => {
    const elBuilt = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    const cdsBuilt = buildCanonicalDepartmentConstructionPlan('creative-director-studio', 'landscape');
    if (!elBuilt.ok || !cdsBuilt.ok) return;

    const elCompiled = compileFounderRenderPrompt({
      departmentId: 'experience-lab',
      plan: elBuilt.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'landscape',
    });
    const cdsCompiled = compileFounderRenderPrompt({
      departmentId: 'creative-director-studio',
      plan: cdsBuilt.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'landscape',
    });

    expect(elCompiled.promptHash).not.toBe(cdsCompiled.promptHash);
    expect(validateDnaCrossContamination('experience-lab', elCompiled.departmentId).ok).toBe(true);
    expect(validateDnaCrossContamination('creative-director-studio', cdsCompiled.departmentId).ok).toBe(true);
    expect(elCompiled.prompt).toContain('holographic');
    expect(cdsCompiled.prompt).toContain('production');
  });

  it('company branding injects without altering architecture', () => {
    const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    if (!built.ok) return;

    const studioOs = compileFounderRenderPrompt({
      departmentId: 'experience-lab',
      plan: built.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'landscape',
    });
    const frontalSlayer = compileFounderRenderPrompt({
      departmentId: 'experience-lab',
      plan: built.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('frontal-slayer'),
      renderKind: 'landscape',
    });

    expect(studioOs.dnaProfile.architecturalStyle).toBe(frontalSlayer.dnaProfile.architecturalStyle);
    expect(studioOs.prompt).toContain('Studio World');
    expect(frontalSlayer.prompt).toContain('Frontal Slayer');
    expect(studioOs.promptHash).not.toBe(frontalSlayer.promptHash);
  });

  it('desktop and mobile preserve same architecture with different framing', () => {
    const built = buildCanonicalDepartmentConstructionPlan('creative-director-studio', 'landscape');
    if (!built.ok) return;

    const desktop = compileFounderRenderPrompt({
      departmentId: 'creative-director-studio',
      plan: built.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'landscape',
    });
    const mobile = compileFounderRenderPrompt({
      departmentId: 'creative-director-studio',
      plan: built.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'portrait',
    });

    expect(desktop.diagnostics.aspectRatio).toBe('21:9');
    expect(mobile.diagnostics.aspectRatio).toBe('9:16');
    expect(desktop.prompt).toContain('DESKTOP COMPOSITION');
    expect(mobile.prompt).toContain('MOBILE COMPOSITION');
    expect(mobile.prompt).toContain('Same architecture');
    expect(desktop.dnaProfile.departmentId).toBe(mobile.dnaProfile.departmentId);
    expect(desktop.dnaProfile.heroObject).toBe(mobile.dnaProfile.heroObject);
  });

  it('negative prompt library provides department-specific forbidden elements', () => {
    const elNeg = resolveDepartmentNegativePrompts('experience-lab');
    const cdsNeg = resolveDepartmentNegativePrompts('creative-director-studio');
    const mktNeg = resolveDepartmentNegativePrompts('marketplace');
    expect(elNeg).toContain('Reception desk');
    expect(cdsNeg).toContain('Blueprint holograms');
    expect(mktNeg).toContain('Conference room');
  });

  it('diagnostics report correct versions', () => {
    const built = buildCanonicalDepartmentConstructionPlan('command-center', 'landscape');
    if (!built.ok) return;
    const compiled = compileFounderRenderPrompt({
      departmentId: 'command-center',
      plan: built.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'landscape',
    });
    expect(compiled.diagnostics.departmentDnaVersion).toBe('architectural-dna.v1');
    expect(compiled.diagnostics.goldenReferenceVersion).toBe('golden-reference-pack.v1');
    expect(compiled.diagnostics.promptHash).toHaveLength(16);
    expect(compiled.diagnostics.negativePromptHash).toHaveLength(16);
    expect(compiled.diagnostics.referencePackVersion).toBe('golden-ref-command-center-v1');
  });

  it('golden reference pack resolves per department', () => {
    const elPack = resolveGoldenReferencePack('experience-lab');
    const cdsPack = resolveGoldenReferencePack('creative-director-studio');
    expect(elPack.packId).not.toBe(cdsPack.packId);
    expect(elPack.versionHistory[0].note).toContain('holographic');
    expect(cdsPack.versionHistory[0].note).toContain('production');
  });
});
