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
    workbenchToolId: null,
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
  it('calm viewport has no floating panels — blueprint card is always in HUD', () => {
    const resolved = resolveOrchestratedPanels(baseInput());
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBeNull();
    expect(resolved.safeZonePct).toBeGreaterThanOrEqual(95);
  });

  it('workbench tool tracks single context inspector without stacking panels', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ workbenchToolId: 'material-library', viewportMode: 'MATERIALS', activeInspector: 'materials' })
    );
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBe('materials');
  });

  it('architectural workbench tool maps to construction context (blueprint is HUD-only)', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ workbenchToolId: 'architectural-tools', viewportMode: 'BLUEPRINT' })
    );
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBe('construction');
  });

  it('only one context inspector id at a time when workbench tool active', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ workbenchToolId: 'material-library', viewportMode: 'MATERIALS', activeInspector: 'materials' })
    );
    expect(resolved.contextInspector).toBe('materials');
    expect(resolved.panels).toHaveLength(0);
  });

  it('blueprint viewport mode still maps to blueprint inspector id for sync', () => {
    expect(inspectorForViewportMode('BLUEPRINT')).toBe('blueprint');
    const resolved = resolveOrchestratedPanels(
      baseInput({ workbenchToolId: 'architectural-tools', viewportMode: 'BLUEPRINT' })
    );
    expect(resolved.contextInspector).toBe('construction');
  });

  it('founder render mode uses metadata inspector when camera tool active', () => {
    expect(inspectorForViewportMode('FOUNDER_RENDER')).toBe('metadata');
    expect(shouldHidePanelForMode('blueprint', 'FOUNDER_RENDER')).toBe(true);
    const resolved = resolveOrchestratedPanels(
      baseInput({ workbenchToolId: 'camera-studio', viewportMode: 'FOUNDER_RENDER', activeInspector: 'camera' })
    );
    expect(resolved.contextInspector).toBe('camera');
    expect(resolved.panels).toHaveLength(0);
  });

  it('materials mode activates materials context via workbench tool', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ workbenchToolId: 'material-library', viewportMode: 'MATERIALS', activeInspector: 'materials' })
    );
    expect(resolved.contextInspector).toBe('materials');
  });

  it('expanded panel tracks context without floating stack', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ expandedPanel: 'materials', viewportMode: 'MATERIALS', activeInspector: 'materials' })
    );
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBe('materials');
  });

  it('expanded state is tracked separately from minimized dock', () => {
    const input = baseInput({ expandedPanel: 'lighting', viewportMode: 'LIGHTING', activeInspector: 'lighting' });
    const resolved = resolveOrchestratedPanels(input);
    expect(resolved.contextInspector).toBe('lighting');
    expect(resolved.panels).toHaveLength(0);
  });

  it('center safe zone remains high when calm', () => {
    const resolved = resolveOrchestratedPanels(baseInput());
    expect(resolved.safeZonePct).toBeGreaterThanOrEqual(95);
  });

  it('split view with camera workbench tool shows camera context', () => {
    expect(inspectorForViewportMode('SPLIT_VIEW')).toBeNull();
    const resolved = resolveOrchestratedPanels(
      baseInput({ workbenchToolId: 'camera-studio', viewportMode: 'SPLIT_VIEW', activeInspector: 'camera' })
    );
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBe('camera');
  });

  it('viewport mode and inspector map symmetrically', () => {
    expect(viewportModeForInspector('camera')).toBe('CAMERA');
    expect(viewportModeForInspector('construction')).toBe('CONSTRUCTION_PLAN');
  });

  it('snap dock respects valid zones and avoids occupied slots', () => {
    const occupied = new Set(['top-left' as const]);
    expect(snapDockZone('top-left', 'mobile', occupied)).toBe('top-right');
  });

  it('desktop stays calm until workbench tool engages', () => {
    const resolved = resolveOrchestratedPanels(baseInput({ breakpoint: 'desktop', viewportMode: 'BLUEPRINT' }));
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBeNull();
  });

  it('desktop workbench tool tracks single context inspector', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ breakpoint: 'desktop', workbenchToolId: 'architectural-tools', viewportMode: 'BLUEPRINT' })
    );
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBe('construction');
  });

  it('focus mode tracks context inspector without floating panels', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({ focusMode: 'blueprint', viewportMode: 'BLUEPRINT' })
    );
    expect(resolved.panels).toHaveLength(0);
    expect(resolved.contextInspector).toBe('blueprint');
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

  it('collision detection is zero — floating panel stacking retired', () => {
    const resolved = resolveOrchestratedPanels(
      baseInput({
        dockZones: { blueprint: 'top-left', materials: 'top-left' },
        viewportMode: 'BLUEPRINT',
      })
    );
    expect(resolved.collisionsPrevented).toBe(0);
    expect(resolved.panels).toHaveLength(0);
  });
});
