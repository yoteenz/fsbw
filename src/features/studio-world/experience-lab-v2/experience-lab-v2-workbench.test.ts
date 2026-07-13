import { describe, expect, it } from 'vitest';
import {
  EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS,
  EXPERIENCE_LAB_WORKBENCH_TOOLS_EXTENDED,
  EXPERIENCE_LAB_WORKBENCH_TOOLS_PRIMARY,
  EXPERIENCE_LAB_WORKBENCH_WORLD_NAV,
  resolveExperienceLabWorkbenchCenterLogoUrl,
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

  it('defines world navigation with dashboard and studio world before marketplace', () => {
    expect(EXPERIENCE_LAB_WORKBENCH_WORLD_NAV.map((n) => n.id)).toEqual([
      'dashboard',
      'studio-world',
      'marketplace',
      'command-center',
    ]);
  });

  it('maps editing tools to semantic Experience Lab icon names', () => {
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS[0]?.icon).toBe('experienceLab');
    expect(EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS.find((t) => t.id === 'lighting-studio')?.icon).toBe('lighting');
    expect(EXPERIENCE_LAB_WORKBENCH_WORLD_NAV[0]?.icon).toBe('dashboard');
  });

  it('resolves center logo path from Supabase public storage', () => {
    expect(resolveExperienceLabWorkbenchCenterLogoUrl()).toContain('D2161224-8335-4CE3-A4D8-794014DDAD32.png');
  });

  it('splits editing tool labels into two display lines', () => {
    expect(splitWorkbenchToolLabel('ARCHITECTURAL TOOLS')).toEqual(['ARCHITECTURAL', 'TOOLS']);
    expect(splitWorkbenchToolLabel('MATERIAL LIBRARY')).toEqual(['MATERIAL', 'LIBRARY']);
    expect(splitWorkbenchToolLabel('BUDGET FORECAST')).toEqual(['BUDGET', 'FORECAST']);
  });
});
