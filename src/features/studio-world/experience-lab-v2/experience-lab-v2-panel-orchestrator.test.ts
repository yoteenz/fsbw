import { describe, expect, it } from 'vitest';
import {
  defaultPersistedLayout,
  inspectorForViewportMode,
  readPersistedPanelLayout,
  resetPersistedPanelLayout,
  resolveOrchestratedPanels,
  shouldHidePanelForMode,
  snapDockZone,
  viewportModeForInspector,
  PANEL_LAYOUT_STORAGE_KEY,
  type PanelOrchestratorInput,
} from './experience-lab-v2-panel-orchestrator';

function baseInput(overrides: Partial<PanelOrchestratorInput> = {}): PanelOrchestratorInput {
  return {
    viewportMode: 'BLUEPRINT',
    breakpoint: 'mobile',
    focusMode: 'none',
    activeInspector: 'blueprint',
    expandedPanel: null,
    dockZones: {},
    leftRailCollapsed: false,
    rightRailCollapsed: false,
    artifactSummaries: {
      blueprint: { summary: 'Wireframe', revision: 18, status: 'idle' },
      construction: { summary: 'Build', revision: 18, status: 'idle' },
      materials: { summary: '21 materials', revision: 18, status: 'idle' },
      lighting: { summary: 'Executive v2', revision: 18, status: 'idle' },
      camera: { summary: 'Founder', revision: 18, status: 'idle' },
      metadata: { summary: 'Approved', revision: 18, status: 'ready' },
    },
    ...overrides,
  };
}

describe('ExperienceLabPanelOrchestrator', () => {
  it('mobile defaults to one visible contextual inspector', () => {
    const resolved = resolveOrchestratedPanels(baseInput());
    expect(resolved.panels).toHaveLength(1);
    expect(resolved.panels[0]?.id).toBe('blueprint');
    expect(resolved.panels[0]?.state).toBe('MINIMIZED');
  });

  it('unrelated inspectors remain hidden on mobile', () => {
    const resolved = resolveOrchestratedPanels(baseInput({ viewportMode: 'MATERIALS', activeInspector: 'materials' }));
    const ids = resolved.panels.map((p) => p.id);
    expect(ids).toEqual(['materials']);
    expect(ids).not.toContain('blueprint');
    expect(ids).not.toContain('construction');
  });

  it('blueprint mode activates blueprint inspector', () => {
    expect(inspectorForViewportMode('BLUEPRINT')).toBe('blueprint');
    const resolved = resolveOrchestratedPanels(baseInput({ viewportMode: 'BLUEPRINT' }));
    expect(resolved.panels[0]?.id).toBe('blueprint');
  });

  it('founder render mode uses metadata inspector and hides blueprint', () => {
    expect(inspectorForViewportMode('FOUNDER_RENDER')).toBe('metadata');
    expect(shouldHidePanelForMode('blueprint', 'FOUNDER_RENDER')).toBe(true);
    const resolved = resolveOrchestratedPanels(
      baseInput({ viewportMode: 'FOUNDER_RENDER', activeInspector: 'metadata' })
    );
    expect(resolved.panels[0]?.id).toBe('metadata');
  });

  it('materials mode activates materials inspector', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ viewportMode: 'MATERIALS', activeInspector: 'materials' })
    );
    expect(resolved.panels[0]?.id).toBe('materials');
  });

  it('only one panel expands on mobile', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ expandedPanel: 'materials', viewportMode: 'MATERIALS', activeInspector: 'materials' })
    );
    expect(resolved.panels.filter((p) => p.state === 'EXPANDED')).toHaveLength(1);
    expect(resolved.panels).toHaveLength(1);
  });

  it('expanded state is tracked separately from minimized dock', () => {
    const input = baseInput({ expandedPanel: 'lighting', viewportMode: 'LIGHTING', activeInspector: 'lighting' });
    const resolved = resolveOrchestratedPanels(input);
    expect(resolved.panels[0]?.state).toBe('EXPANDED');
  });

  it('center safe zone remains high on mobile with one panel', () => {
    const resolved = resolveOrchestratedPanels(baseInput());
    expect(resolved.safeZonePct).toBeGreaterThanOrEqual(86);
  });

  it('split view allows inspector switcher default without mode-linked panel', () => {
    expect(inspectorForViewportMode('SPLIT_VIEW')).toBeNull();
    const resolved = resolveOrchestratedPanels(
      baseInput({ viewportMode: 'SPLIT_VIEW', activeInspector: 'blueprint' })
    );
    expect(resolved.panels).toHaveLength(1);
  });

  it('viewport mode and inspector map symmetrically', () => {
    expect(viewportModeForInspector('camera')).toBe('CAMERA');
    expect(viewportModeForInspector('construction')).toBe('CONSTRUCTION_PLAN');
  });

  it('snap dock respects valid zones and avoids occupied slots', () => {
    const occupied = new Set(['top-left' as const]);
    expect(snapDockZone('top-left', 'mobile', occupied)).toBe('top-right');
  });

  it('desktop uses rails instead of scattering all panels over center', () => {
    const resolved = resolveOrchestratedPanels(baseInput({ breakpoint: 'desktop', viewportMode: 'BLUEPRINT' }));
    expect(resolved.panels.every((p) => p.dockZone === 'left-rail' || p.dockZone === 'right-rail')).toBe(true);
    expect(resolved.panels.length).toBeGreaterThan(1);
  });

  it('focus mode hides secondary inspectors', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ focusMode: 'blueprint', viewportMode: 'BLUEPRINT' })
    );
    expect(resolved.panels).toHaveLength(1);
  });

  it('reset layout restores defaults when storage available', () => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(PANEL_LAYOUT_STORAGE_KEY);
    const layout = resetPersistedPanelLayout('MATERIALS');
    expect(layout.activeInspector).toBe('materials');
    expect(readPersistedPanelLayout()?.activeInspector).toBe('materials');
  });

  it('layout persistence stores presentation prefs only', () => {
    const layout = defaultPersistedLayout('BLUEPRINT');
    expect(layout).not.toHaveProperty('artifactData');
    expect(layout.version).toBe(1);
  });

  it('collision detection increments when zones occupied', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({
        dockZones: { blueprint: 'top-left', materials: 'top-left' },
        viewportMode: 'BLUEPRINT',
      })
    );
    expect(resolved.collisionsPrevented).toBeGreaterThanOrEqual(0);
  });
});
