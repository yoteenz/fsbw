import { describe, expect, it } from 'vitest';
import {
  CANONICAL_DEPARTMENT_REGISTRY,
  assertNotCompanyOwnedInfrastructure,
  getExperienceLabPackOption,
  listExperienceLabPackOptions,
  planExperienceLabHeadquartersFromPack,
  resolveExperienceLabEntry,
  isDeprecatedCompanySelector,
  resolveInternalPreviewBinding,
  clonePublishedIndustryPackToFounderWorkspace,
} from './index';
import { getIndustryPack } from '../industry-packs';

describe('Canonical Department Registry™', () => {
  it('registers 17 global infrastructure departments', () => {
    expect(CANONICAL_DEPARTMENT_REGISTRY.length).toBe(17);
    expect(CANONICAL_DEPARTMENT_REGISTRY.every((d) => d.scope === 'studio-world-global')).toBe(true);
  });

  it('rejects company ownership of experience-lab', () => {
    const result = assertNotCompanyOwnedInfrastructure('experience-lab');
    expect(result.ok).toBe(false);
  });

  it('allows company HQ department ids', () => {
    expect(assertNotCompanyOwnedInfrastructure('custom-reception-wing').ok).toBe(true);
  });
});

describe('Experience Lab Industry Pack entry', () => {
  it('lists 18 industry pack options', () => {
    expect(listExperienceLabPackOptions().length).toBe(18);
  });

  it('resolves hair brand pack option', () => {
    const option = getExperienceLabPackOption('hair-brand');
    expect(option?.industryPackId).toBe('official-hair-brand');
    const pack = getIndustryPack('official-hair-brand');
    expect(pack?.defaultDepartments.length).toBeGreaterThanOrEqual(10);
  });

  it('plans headquarters from selected pack', () => {
    const result = planExperienceLabHeadquartersFromPack({ packOptionId: 'law-firm' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pack.packId).toBe('official-law-firm');
      expect(result.entry.companyHqOrganizationId).toBe('founder-company-hq');
    }
  });

  it('resolves entry context with canonical departments', () => {
    const entry = resolveExperienceLabEntry({ packOptionId: 'restaurant' });
    expect(entry.ok).toBe(true);
    if (entry.ok) {
      expect(entry.context.canonicalDepartmentsInUse).toContain('experience-lab');
      expect(entry.context.canonicalDepartmentsInUse).toContain('creative-director-studio');
    }
  });
});

describe('Deprecated company selector', () => {
  it('flags studio-os frontal-slayer ndx as deprecated', () => {
    expect(isDeprecatedCompanySelector('studio-os')).toBe(true);
    expect(isDeprecatedCompanySelector('frontal-slayer')).toBe(true);
    expect(isDeprecatedCompanySelector('ndx')).toBe(true);
    expect(isDeprecatedCompanySelector('hair-brand')).toBe(false);
  });
});

describe('Studio World permission model', () => {
  it('defines admin infrastructure and founder workspace ids', async () => {
    const {
      STUDIO_WORLD_ADMIN_INFRASTRUCTURE_IDS,
      STUDIO_WORLD_FOUNDER_WORKSPACE_IDS,
      FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH,
    } = await import('./permission-model');
    expect(STUDIO_WORLD_ADMIN_INFRASTRUCTURE_IDS).toContain('experience-lab');
    expect(STUDIO_WORLD_FOUNDER_WORKSPACE_IDS).toContain('creative-director-studio');
    expect(FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH).toContain('creative-direction');
  });

  it('blocks non-admin Experience Lab access', async () => {
    const { assertExperienceLabAccess } = await import('./permission-model');
    const result = assertExperienceLabAccess();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EXPERIENCE_LAB_ADMIN_ONLY');
    }
  });

  it('flags experience-lab paths as admin-only', async () => {
    const { isStudioWorldAdminOnlyPath } = await import('./permission-model');
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab')).toBe(true);
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab/health')).toBe(true);
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab-icon-qa')).toBe(true);
    expect(isStudioWorldAdminOnlyPath('/admin/studio/department/creative-direction')).toBe(false);
  });
});

describe('Founder workspace entry', () => {
  it('clones published pack into founder workspace with CDS entry', () => {
    const result = clonePublishedIndustryPackToFounderWorkspace({
      packOptionId: 'hair-brand',
      organizationId: 'org-hair-brand-001',
      founderPackInstanceId: 'fpi-001',
      founderRenderJobId: 'mfr-job-001',
      previewArtifactUrl: 'https://cdn.example.com/hq-founder-render.webp',
      approvedAt: '2026-07-13T00:00:00.000Z',
      approvedBy: 'studio-world-admin',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.handoff.packId).toBe('official-hair-brand');
      expect(result.handoff.organizationId).toBe('org-hair-brand-001');
      expect(result.creativeDirectorStudioEntryPath).toContain('creative-direction');
    }
  });
});

describe('Preview bridge', () => {
  it('maps beauty packs to internal preview binding', () => {
    expect(resolveInternalPreviewBinding('hair-brand')).toBe('frontal-slayer');
    expect(resolveInternalPreviewBinding('law-firm')).toBe('studio-os');
  });
});
