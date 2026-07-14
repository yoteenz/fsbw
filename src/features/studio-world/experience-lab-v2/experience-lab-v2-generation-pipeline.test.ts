import { describe, expect, it } from 'vitest';
import {
  applyPipelineReset,
  buildGenerationPipelineBreadcrumb,
  pipelineCanonicalDepartmentId,
  pipelineProgramActionsProfile,
  type GenerationPipelineState,
} from './experience-lab-v2-generation-pipeline';
import { listExperienceLabV2Programs } from './experience-lab-v2-program-registry';
import { listStudioWorldDepartments } from './experience-lab-v2-department-registry';
import { listIndustryPackSelectorEntries } from './experience-lab-v2-industry-pack-registry';

describe('Experience Lab generation pipeline', () => {
  const studioState: GenerationPipelineState = {
    programId: 'studio-world',
    studioDepartmentId: 'experience-lab',
    industryPackId: null,
    environmentId: 'reception',
  };

  const industryState: GenerationPipelineState = {
    programId: 'industry-packs',
    studioDepartmentId: null,
    industryPackId: listIndustryPackSelectorEntries()[0]?.id ?? 'official-hair-brand',
    environmentId: 'reception',
  };

  it('lists exactly two canonical programs', () => {
    const programs = listExperienceLabV2Programs();
    expect(programs).toHaveLength(2);
    expect(programs.map((p) => p.title)).toEqual(['BUILD STUDIO WORLD', 'BUILD INDUSTRY PACKS']);
  });

  it('builds Studio World breadcrumb with variant label', () => {
    const crumb = buildGenerationPipelineBreadcrumb({
      state: studioState,
      variantLabel: 'Light 02',
    });
    expect(crumb.segments).toEqual(['STUDIO WORLD', 'EXPERIENCE LAB', 'RECEPTION', 'LIGHT 02']);
    expect(crumb.display).toBe('STUDIO WORLD / EXPERIENCE LAB / RECEPTION / LIGHT 02');
  });

  it('builds Industry Pack breadcrumb', () => {
    const pack = listIndustryPackSelectorEntries()[0];
    const crumb = buildGenerationPipelineBreadcrumb({
      state: industryState,
      variantLabel: 'Dark 03',
    });
    expect(crumb.segments[0]).toBe('INDUSTRY PACKS');
    expect(crumb.segments[1]).toBe(pack?.label);
    expect(crumb.display).toContain('INDUSTRY PACKS');
    expect(crumb.display).toContain('DARK 03');
  });

  it('resets downstream state per scope', () => {
    expect(applyPipelineReset(studioState, 'program')).toEqual({
      studioDepartmentId: null,
      industryPackId: null,
      environmentId: null,
    });
    expect(applyPipelineReset(studioState, 'department')).toEqual({ environmentId: null });
    expect(applyPipelineReset(industryState, 'pack')).toEqual({ environmentId: null });
    expect(applyPipelineReset(studioState, 'environment')).toEqual({});
  });

  it('maps studio department to canonical department id', () => {
    expect(pipelineCanonicalDepartmentId(studioState)).toBe('experience-lab');
    const cds = listStudioWorldDepartments().find((d) => d.id === 'creative-director-studio');
    expect(cds).toBeTruthy();
    expect(
      pipelineCanonicalDepartmentId({
        ...studioState,
        studioDepartmentId: 'creative-director-studio',
      })
    ).toBe('creative-director-studio');
  });

  it('exposes page-aware program actions profile', () => {
    expect(pipelineProgramActionsProfile(studioState)).toBe('studio-world-generation');
    expect(
      pipelineProgramActionsProfile({
        ...studioState,
        studioDepartmentId: 'marketplace',
      })
    ).toBe('package-publishing');
    expect(pipelineProgramActionsProfile(industryState)).toBe('industry-pack-generation');
  });
});
