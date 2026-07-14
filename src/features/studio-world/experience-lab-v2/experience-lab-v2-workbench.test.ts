import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS,
  EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED,
  EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY,
  EXPERIENCE_LAB_WORKBENCH_WORLD_NAV,
  splitWorkbenchToolLabel,
} from './experience-lab-v2-workbench-config';

describe('Experience Lab Workbench config', () => {
  it('lists primary then extended editing tools in scroll order', () => {
    expect(EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY).toHaveLength(6);
    expect(EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED).toHaveLength(6);
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS[0]?.id).toBe('architectural-tools');
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS[5]?.id).toBe('permit-center');
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS[6]?.id).toBe('lighting-studio');
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS[11]?.id).toBe('material-lab');
  });

  it('defines world navigation with headquarters and studio world before marketplace', () => {
    expect(EXPERIENCE_LAB_WORKBENCH_WORLD_NAV.map((n) => n.id)).toEqual([
      'dashboard',
      'studio-world',
      'marketplace',
      'command-center',
    ]);
    expect(EXPERIENCE_LAB_WORKBENCH_WORLD_NAV[0]?.label).toBe('HEADQUARTERS');
  });

  it('maps editing tools to semantic Experience Lab icon names', () => {
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS[0]?.icon).toBe('construction');
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS.find((t) => t.id === 'lighting-studio')?.icon).toBe('lighting');
    expect(EXPERIENCE_LAB_WORKBENCH_WORLD_NAV[0]?.icon).toBe('projects');
    expect(EXPERIENCE_LAB_WORKBENCH_WORLD_NAV[1]?.icon).toBe('orbit');
  });

  it('keeps Studio World logo out of workbench orb (brand vs living sphere)', () => {
    const orb = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), 'living-studio-world-orb/LivingStudioWorldOrb.tsx'),
      'utf8',
    );
    expect(orb).not.toContain('resolveExperienceLabWorkbenchCenterLogoUrl');
    expect(orb).not.toContain('<img');
  });

  it('splits editing tool labels into two display lines', () => {
    expect(splitWorkbenchToolLabel('ARCHITECTURAL TOOLS')).toEqual(['ARCHITECTURAL', 'TOOLS']);
    expect(splitWorkbenchToolLabel('MATERIAL LIBRARY')).toEqual(['MATERIAL', 'LIBRARY']);
    expect(splitWorkbenchToolLabel('BUDGET FORECAST')).toEqual(['BUDGET', 'FORECAST']);
  });
});
