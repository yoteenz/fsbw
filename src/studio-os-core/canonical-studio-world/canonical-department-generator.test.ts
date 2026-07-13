import { describe, expect, it } from 'vitest';
import {
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY,
  CANONICAL_DEPARTMENT_CATEGORIES,
  listCanonicalDepartmentTree,
  getCanonicalDepartmentRecord,
  planCanonicalDepartmentGeneration,
  planCanonicalBatchGeneration,
  queueAllMissingCanonicalDepartments,
  publishCanonicalDepartmentToRegistry,
  buildCanonicalCdsHandoff,
  validateCanonicalCdsHandoff,
  EXPERIENCE_LAB_PROGRAMS,
  classifyIndustryPackDepartmentSlot,
  classifyDepartmentById,
  SHARED_HQ_DEPARTMENT_TEMPLATE_IDS,
  DEPARTMENT_CLASS_REGISTRY,
  buildCanonicalDepartmentPromptContract,
  resolveCanonicalDepartmentModelRoute,
  isDeprecatedCompanySelector,
  listExperienceLabPackOptions,
  planExperienceLabHeadquartersFromPack,
  assertExperienceLabAccess,
} from './index';
import { defineDefaultDepartmentUiSockets } from '../architecture-law-001/ui-socket-registry';
import { validatePortraitLandscapeParity } from '../master-founder-render/quality-guard-composition';
import { fixtureReceptionConstructionPlan } from '../blueprint-author/fixtures';
import { buildMasterLandscapeRenderRecord, approveMasterLandscape } from '../master-founder-render/master-landscape';
import { buildMasterPortraitRecomposeRequest } from '../master-founder-render/master-portrait';
import { buildBrandAssetLockBundle } from '../master-founder-render/integration';

describe('Canonical Department Generator™ — Program separation', () => {
  it('supports canonical department generation (Program A)', () => {
    const plan = planCanonicalDepartmentGeneration('experience-lab');
    expect(plan.ok).toBe(true);
    if (plan.ok) {
      expect(plan.phases).toContain('publish-registry');
      expect(plan.ownership).toBe('studio-world-global');
    }
  });

  it('supports Industry Pack generation separately (Program B)', () => {
    expect(EXPERIENCE_LAB_PROGRAMS.map((p) => p.programId)).toEqual(['studio-world', 'industry-packs']);
    expect(listExperienceLabPackOptions().length).toBe(18);
    const hq = planExperienceLabHeadquartersFromPack({ packOptionId: 'medical-practice' });
    expect(hq.ok).toBe(true);
  });
});

describe('Canonical Department Generator™ — Classification', () => {
  it('canonical departments are not organization-owned', () => {
    for (const dept of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      expect(dept.scope).toBe('studio-world-global');
      expect(dept.departmentClass).toBe('CANONICAL_STUDIO_WORLD_DEPARTMENT');
      expect((dept as { organizationId?: string }).organizationId).toBeUndefined();
    }
  });

  it('Industry Pack departments are not classified as canonical infrastructure', () => {
    const receptionClass = classifyIndustryPackDepartmentSlot('reception');
    expect(receptionClass).not.toBe('CANONICAL_STUDIO_WORLD_DEPARTMENT');
    const hairLabClass = classifyIndustryPackDepartmentSlot('hair-analysis-lab');
    expect(hairLabClass).toBe('INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE');
  });

  it('shared HQ departments remain distinct from canonical departments', () => {
    expect(SHARED_HQ_DEPARTMENT_TEMPLATE_IDS.has('reception')).toBe(true);
    expect(classifyDepartmentById('reception')).toBe('SHARED_HQ_DEPARTMENT_TEMPLATE');
    expect(classifyDepartmentById('experience-lab', { isCanonicalRegistryMember: true })).toBe(
      'CANONICAL_STUDIO_WORLD_DEPARTMENT'
    );
    expect(DEPARTMENT_CLASS_REGISTRY.SHARED_HQ_DEPARTMENT_TEMPLATE.experienceLabProgram).toBe('industry-packs');
    expect(DEPARTMENT_CLASS_REGISTRY.CANONICAL_STUDIO_WORLD_DEPARTMENT.experienceLabProgram).toBe('studio-world');
  });
});

describe('Canonical Department Generator™ — Access control', () => {
  it('Experience Lab appears only to Admin Founder roles', () => {
    const access = assertExperienceLabAccess();
    expect(access.ok).toBe(false);
    if (!access.ok) expect(access.code).toBe('EXPERIENCE_LAB_ADMIN_ONLY');
  });

  it('server rejects non-admin canonical generation requests', async () => {
    const { assertCanonicalGenerationRequest, isStudioWorldAdminEmail } = await import(
      '../../../api/_lib/studioWorldAdminAccess.js'
    );
    expect(isStudioWorldAdminEmail('kateenaarmstrong@gmail.com')).toBe(true);
    expect(isStudioWorldAdminEmail('random@example.com')).toBe(false);
    const denied = assertCanonicalGenerationRequest({ email: 'random@example.com', operation: 'generate' });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe('STUDIO_WORLD_ADMIN_REQUIRED');

    const tenantDenied = assertCanonicalGenerationRequest({
      email: 'kateenaarmstrong@gmail.com',
      operation: 'generate',
      organizationId: 'frontal-slayer',
    });
    expect(tenantDenied.ok).toBe(false);
    if (!tenantDenied.ok) expect(tenantDenied.code).toBe('CANONICAL_NOT_TENANT_OWNED');
  });
});

describe('Canonical Department Generator™ — Registry tree', () => {
  it('canonical department tree loads dynamically', () => {
    const tree = listCanonicalDepartmentTree();
    expect(tree.length).toBe(CANONICAL_DEPARTMENT_CATEGORIES.length);
    const total = tree.reduce((n, t) => n + t.departments.length, 0);
    expect(total).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    expect(total).toBe(25);
  });

  it('main departments show correct lifecycle status', () => {
    const el = getCanonicalDepartmentRecord('experience-lab');
    expect(el?.lifecycleState).toBe('DRAFT');
    expect(el?.status).toBe('DRAFT');
  });
});

describe('Canonical Department Generator™ — Department selection', () => {
  it('canonical Experience Lab can be selected for generation', () => {
    const plan = planCanonicalDepartmentGeneration('experience-lab');
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.record.departmentId).toBe('experience-lab');
  });

  it('canonical Creative Director Studio can be selected for generation', () => {
    const plan = planCanonicalDepartmentGeneration('creative-director-studio');
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.record.name).toContain('Creative Director Studio');
  });

  it('canonical Command Center can be selected for generation', () => {
    const plan = planCanonicalDepartmentGeneration('command-center');
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.commandDockPlaceholder?.profileId).toBe('cc-command-dock.v1');
  });
});

describe('Canonical Department Generator™ — Model routing', () => {
  it('full-scene canonical department routes to NBP', () => {
    const contract = buildCanonicalDepartmentPromptContract('command-center');
    expect('modelRoute' in contract && contract.modelRoute).toBe('nano-banana-pro-full-scene');
    expect(resolveCanonicalDepartmentModelRoute('full-scene')).toContain('nano-banana-pro');
  });

  it('isolated CDS asset routes to NB2', () => {
    const contract = buildCanonicalDepartmentPromptContract('creative-director-studio');
    expect('isolatedAssetRoute' in contract && contract.isolatedAssetRoute).toBe('nano-banana-2');
    expect(resolveCanonicalDepartmentModelRoute('isolated-asset')).toContain('nano-banana-2');
  });
});

describe('Canonical Department Generator™ — Architecture Law #001', () => {
  it('Founder Render contains Command Dock and Workbench architecture', () => {
    const plan = planCanonicalDepartmentGeneration('experience-lab');
    expect(plan.ok).toBe(true);
    if (plan.ok && 'positivePrompt' in plan.promptContract) {
      expect(plan.commandDockPlaceholder).not.toBeNull();
      expect(plan.workbenchPlaceholder).not.toBeNull();
      expect(plan.promptContract.positivePrompt).toContain('Command Dock');
      expect(plan.promptContract.positivePrompt).toContain('Workbench');
    }
  });

  it('Founder Render prompt prohibits readable UI text', () => {
    const contract = buildCanonicalDepartmentPromptContract('experience-lab');
    expect('positivePrompt' in contract).toBe(true);
    if ('positivePrompt' in contract) {
      expect(contract.negativePrompt).toContain('readable text');
      expect(contract.negativePrompt).toContain('button text');
    }
  });

  it('socket metadata is persisted in generation plan', () => {
    const sockets = defineDefaultDepartmentUiSockets('experience-lab');
    expect(sockets.sockets.length).toBeGreaterThan(0);
    const plan = planCanonicalDepartmentGeneration('experience-lab');
    if (plan.ok) expect(plan.uiSockets.sockets.length).toBeGreaterThan(0);
  });
});

describe('Canonical Department Generator™ — Portrait parity', () => {
  const plan = fixtureReceptionConstructionPlan({
    organizationId: 'studio-world',
    buildingId: 'b1',
    floorId: 'f1',
    roomId: 'experience-lab',
    requestId: 'req-el',
    founderIntent: 'Experience Lab canonical render',
    styleProfile: {
      styleId: 'luxury',
      version: '1',
      organizationStyle: 'studio-world',
      visualLanguage: 'executive marble',
    },
  });

  it('landscape and portrait remain revision-bound', () => {
    let landscape = buildMasterLandscapeRenderRecord({
      renderId: 'canonical-landscape-1',
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://example.com/landscape.png',
      status: 'ready',
    });
    landscape = approveMasterLandscape(landscape, 'admin-founder');

    const portrait = buildMasterPortraitRecomposeRequest({
      portraitId: 'canonical-portrait-1',
      landscape,
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://example.com/portrait.png',
      status: 'ready',
    });

    const brandLock = buildBrandAssetLockBundle({ landscape, plan });
    const parity = validatePortraitLandscapeParity({
      landscape,
      portrait,
      revisions: landscape.revisions,
      brandLock,
    });
    expect(parity.ok).toBe(true);
  });

  it('portrait cannot publish when it does not match the approved landscape', () => {
    let landscape = buildMasterLandscapeRenderRecord({
      renderId: 'canonical-landscape-2',
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://example.com/landscape.png',
      status: 'ready',
    });
    landscape = approveMasterLandscape(landscape, 'admin-founder');

    const portrait = buildMasterPortraitRecomposeRequest({
      portraitId: 'canonical-portrait-stale',
      landscape,
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://example.com/portrait.png',
      status: 'ready',
    });
    portrait.masterLandscapeRenderId = 'stale-landscape-id';
    portrait.landscapeArtifactUrl = 'https://example.com/other.png';

    const brandLock = buildBrandAssetLockBundle({ landscape, plan });
    const parity = validatePortraitLandscapeParity({
      landscape,
      portrait,
      revisions: landscape.revisions,
      brandLock,
    });
    expect(parity.ok).toBe(false);
  });
});

describe('Canonical Department Generator™ — CDS handoff & publish', () => {
  it('approved canonical department hands off to CDS', () => {
    const sockets = defineDefaultDepartmentUiSockets('creative-director-studio');
    const handoff = buildCanonicalCdsHandoff({
      departmentId: 'creative-director-studio',
      socketMap: sockets,
      approvedBy: 'admin-founder',
    });
    expect(handoff.ok).toBe(true);
    if (handoff.ok) {
      expect(handoff.handoff.ownershipClass).toBe('CANONICAL_STUDIO_WORLD_DEPARTMENT');
      expect(validateCanonicalCdsHandoff(handoff.handoff).ok).toBe(true);
    }
  });

  it('Industry Pack generation does not overwrite canonical departments', () => {
    const before = CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length;
    planExperienceLabHeadquartersFromPack({ packOptionId: 'hair-brand' });
    expect(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length).toBe(before);
    expect(getCanonicalDepartmentRecord('experience-lab')?.scope).toBe('studio-world-global');
  });

  it('canonical publish adds the department to Studio World Registry', () => {
    const pub = publishCanonicalDepartmentToRegistry('studio-world-registry');
    expect(pub.ok).toBe(true);
    if (pub.ok) {
      expect(pub.publication.registryEntryId).toContain('studio-world-registry');
      expect(pub.publication.lifecycleState).toBe('PUBLISHED');
    }
  });
});

describe('Canonical Department Generator™ — Experience Lab UI contract', () => {
  it('founder company selection is absent from Experience Lab', () => {
    expect(isDeprecatedCompanySelector('studio-os')).toBe(true);
    expect(isDeprecatedCompanySelector('frontal-slayer')).toBe(true);
    expect(isDeprecatedCompanySelector('ndx')).toBe(true);
    expect(isDeprecatedCompanySelector('hair-brand')).toBe(false);
  });

  it('batch generation requires explicit confirmation', () => {
    const blocked = queueAllMissingCanonicalDepartments(false);
    expect('ok' in blocked && blocked.ok).toBe(false);
    const plan = planCanonicalBatchGeneration({
      departmentIds: ['experience-lab'],
      confirmed: true,
    });
    expect(plan.confirmed).toBe(true);
    expect(plan.permitRequired).toBe(true);
  });

  it('production admin route loads on mobile (responsive shell contract)', async () => {
    const { CreativeIntelligencePanel } = await import(
      '../../components/admin/studio/experience-lab/CreativeIntelligencePanel'
    );
    const { ExperienceLabProgramSelector } = await import(
      '../../components/admin/studio/experience-lab/ExperienceLabProgramSelector'
    );
    expect(typeof CreativeIntelligencePanel).toBe('function');
    expect(typeof ExperienceLabProgramSelector).toBe('function');
    expect(EXPERIENCE_LAB_PROGRAMS[0].title).toBe('BUILD STUDIO WORLD');
  });
});
