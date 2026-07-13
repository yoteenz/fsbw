/** Layout tokens and breakpoint helpers for the fixed-viewport V2 application shell. */

export type ElabBreakpoint = 'mobile' | 'tablet' | 'desktop';

export type ElabFocusMode = 'none' | 'viewport' | 'review' | 'blueprint' | 'render';

export type ElabWorkbenchTab = 'brief' | 'review' | 'timeline' | 'diagnostics';

export const ELAB_V2_LAYOUT = {
  /** CSS custom property names — set on .elab-app-shell */
  vars: {
    viewportHeight: '--el-v2-viewport-height',
    commandDockHeight: '--el-v2-command-dock-height',
    departmentDockHeight: '--el-v2-department-dock-height',
    workbenchHeight: '--el-v2-workbench-height',
    approvalHeight: '--el-v2-approval-height',
    safeTop: '--el-v2-safe-top',
    safeBottom: '--el-v2-safe-bottom',
  },
  breakpoints: {
    mobileMax: 767,
    tabletMax: 1023,
  },
  /** Viewport room occupies ~65% of center column — desktop canonical */
  viewportRoomRatio: '65%',
  routeBodyClass: 'elab-v2-fixed-shell-active',
  portalDataAttr: 'data-elab-fixed-viewport',
} as const;

export function resolveElabBreakpoint(width: number): ElabBreakpoint {
  if (width <= ELAB_V2_LAYOUT.breakpoints.mobileMax) return 'mobile';
  if (width <= ELAB_V2_LAYOUT.breakpoints.tabletMax) return 'tablet';
  return 'desktop';
}

export function isElabCompactLayout(bp: ElabBreakpoint): boolean {
  return bp === 'mobile' || bp === 'tablet';
}

export function defaultWorkbenchTab(hasRender: boolean): ElabWorkbenchTab {
  return hasRender ? 'review' : 'brief';
}

export function focusModeFromViewportMode(mode: string): ElabFocusMode {
  if (mode === 'BLUEPRINT') return 'blueprint';
  if (mode === 'FOUNDER_RENDER') return 'render';
  return 'viewport';
}
