import { describe, expect, it } from 'vitest';
import { BUSINESS_ARCHETYPE_REGISTRY, listArchetypeIds } from './business-archetype-registry';
import { SHARED_DEPARTMENT_REGISTRY, getSharedDepartmentInstance } from './department-template-registry';
import {
  OFFICIAL_INDUSTRY_PACKS,
  getIndustryPack,
  listIndustryPacksForArchetype,
  listOfficialIndustryPacks,
  validateIndustryPack,
} from './industry-pack-registry';
import {
  buildHeadquartersGenerationPlan,
  planHeadquartersDeltaUpdate,
  resolveDepartmentReuse,
} from './department-reuse-engine';
import {
  buildApprovedHeadquartersHandoff,
  validateApprovedHeadquartersHandoff,
  pinDepartmentVersion,
} from './approved-headquarters-handoff';
import { planExperienceLabHeadquartersGeneration, validateModAttachesToDepartmentSlot } from './integration';

describe('Business Archetype Registry™', () => {
  it('registers 20 permanent archetypes including Custom', () => {
    expect(BUSINESS_ARCHETYPE_REGISTRY.length).toBe(20);
    expect(listArchetypeIds()).toContain('beauty');
    expect(listArchetypeIds()).toContain('custom');
  });
});

describe('Shared Department Registry™', () => {
  it('shares Reception v6 across registry', () => {
    const reception = getSharedDepartmentInstance(SHARED_DEPARTMENT_REGISTRY, 'reception', 'v6');
    expect(reception?.instanceId).toBe('shared-reception-v6');
  });
});

describe('Industry Pack Registry™', () => {
  it('ships 10 official industry packs', () => {
    expect(OFFICIAL_INDUSTRY_PACKS.length).toBe(10);
    expect(listOfficialIndustryPacks().every((p) => p.official)).toBe(true);
  });

  it('validates hair salon pack dependencies', () => {
    const pack = getIndustryPack('official-hair-salon')!;
    expect(validateIndustryPack(pack).ok).toBe(true);
    expect(pack.defaultDepartments.some((s) => s.templateId === 'reception')).toBe(true);
  });

  it('lists beauty archetype packs', () => {
    const beauty = listIndustryPacksForArchetype('beauty');
    expect(beauty.some((p) => p.packId === 'official-hair-salon')).toBe(true);
    expect(beauty.some((p) => p.packId === 'official-tattoo-shop')).toBe(true);
  });
});

describe('DepartmentReuseEngine™', () => {
  it('reuses Reception v6 for hair salon and law firm', () => {
    const hair = getIndustryPack('official-hair-salon')!;
    const law = getIndustryPack('official-law-firm')!;
    const hairSlot = hair.defaultDepartments.find((s) => s.templateId === 'reception')!;
    const lawSlot = law.defaultDepartments.find((s) => s.templateId === 'reception')!;

    const hairReuse = resolveDepartmentReuse({
      slot: hairSlot,
      pack: hair,
      sharedRegistry: SHARED_DEPARTMENT_REGISTRY,
    });
    const lawReuse = resolveDepartmentReuse({
      slot: lawSlot,
      pack: law,
      sharedRegistry: SHARED_DEPARTMENT_REGISTRY,
    });

    expect(hairReuse.action).toBe('reuse');
    expect(lawReuse.action).toBe('reuse');
    if (hairReuse.action === 'reuse' && lawReuse.action === 'reuse') {
      expect(hairReuse.instanceId).toBe(lawReuse.instanceId);
    }
  });

  it('generates only changed department on delta update', () => {
    const pack = getIndustryPack('official-hair-salon')!;
    const delta = planHeadquartersDeltaUpdate({
      pack,
      organizationId: 'org-1',
      sharedRegistry: SHARED_DEPARTMENT_REGISTRY,
      changedTemplateId: 'office',
    });

    expect(delta.estimatedNewGenerations).toBe(1);
    expect(delta.estimatedReusedDepartments).toBe(pack.defaultDepartments.length - 1);
    expect(delta.generateSlotIds).toEqual(['office']);
  });

  it('plans complete headquarters generation', () => {
    const pack = getIndustryPack('official-doctor')!;
    const plan = buildHeadquartersGenerationPlan({
      pack,
      organizationId: 'org-1',
      sharedRegistry: SHARED_DEPARTMENT_REGISTRY,
    });

    expect(plan.departments.length).toBe(pack.defaultDepartments.length);
    expect(plan.estimatedReusedDepartments).toBeGreaterThan(0);
    expect(plan.generationPriority[0]).toBe('reuse-department');
  });
});

describe('ApprovedHeadquartersHandoff™', () => {
  it('builds and validates headquarters handoff for CDS', () => {
    const pack = getIndustryPack('official-law-firm')!;
    const plan = buildHeadquartersGenerationPlan({
      pack,
      organizationId: 'org-1',
      sharedRegistry: SHARED_DEPARTMENT_REGISTRY,
    });

    const handoff = buildApprovedHeadquartersHandoff({
      pack,
      organizationId: 'org-1',
      founderPackInstanceId: 'instance-1',
      founderRenderJobId: 'job-1',
      previewArtifactUrl: 'https://cdn.example/hq-render.png',
      approvedAt: new Date().toISOString(),
      approvedBy: 'founder@example.com',
      generationPlan: plan,
    });

    expect(validateApprovedHeadquartersHandoff(handoff).ok).toBe(true);
    expect(handoff.departmentRegistry.length).toBe(pack.defaultDepartments.length);
  });

  it('rejects missing handoff', () => {
    expect(validateApprovedHeadquartersHandoff(null).ok).toBe(false);
  });

  it('pins department version without touching other slots', () => {
    const pack = getIndustryPack('official-hair-salon')!;
    const updated = pinDepartmentVersion(pack, 'office', 'v10');
    const office = updated.defaultDepartments.find((s) => s.templateId === 'office');
    const reception = updated.defaultDepartments.find((s) => s.templateId === 'reception');
    expect(office?.pinnedVersion).toBe('v10');
    expect(reception?.pinnedVersion).toBe('v6');
  });
});

describe('Experience Lab integration', () => {
  it('plans headquarters generation for EL workflow', () => {
    const pack = getIndustryPack('official-coffee-shop')!;
    const result = planExperienceLabHeadquartersGeneration({
      pack,
      organizationId: 'org-1',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.packId).toBe('official-coffee-shop');
      expect(result.plan.generateSlotIds.length).toBeLessThanOrEqual(pack.defaultDepartments.length);
    }
  });
});

describe('Mod system integration', () => {
  it('requires mods attach to pack department slots', () => {
    const pack = getIndustryPack('official-fitness')!;
    expect(validateModAttachesToDepartmentSlot({ pack, baseDepartmentSlotId: 'reception' }).ok).toBe(true);
    expect(validateModAttachesToDepartmentSlot({ pack, baseDepartmentSlotId: 'orphan' }).ok).toBe(false);
  });
});
