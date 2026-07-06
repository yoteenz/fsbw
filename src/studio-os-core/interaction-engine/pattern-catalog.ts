import { INTERACTION_ENGINE_ACCENT, MOTION_DEFAULTS } from './constants';
import type {
  AccessibilityRequirementId,
  InteractionPatternEntry,
  InteractionStateId,
} from './types';

const PLATFORM = ['Executive IA', 'Admin Studio', 'Command Dock'] as const;
const A11Y_BASE: AccessibilityRequirementId[] = ['keyboard', 'mouse', 'focus-indicator'];
const A11Y_FULL: AccessibilityRequirementId[] = [...A11Y_BASE, 'touch', 'screen-reader', 'reduced-motion'];

function pattern(
  partial: Pick<
    InteractionPatternEntry,
    'patternId' | 'name' | 'type' | 'trigger' | 'behavior' | 'feedback'
  > &
    Partial<InteractionPatternEntry>
): InteractionPatternEntry {
  return {
    states: partial.states ?? ['idle', 'hover', 'focused', 'pressed'],
    accessibility: partial.accessibility ?? A11Y_BASE,
    consumedBy: partial.consumedBy ?? [...PLATFORM],
    platformStandard: partial.platformStandard ?? true,
    ...partial,
  };
}

/** Canonical Interaction Engine™ pattern catalog — behavioral source of truth. */
export function buildInteractionPatternCatalog(): InteractionPatternEntry[] {
  const patterns: InteractionPatternEntry[] = [
    // Pointer interactions
    pattern({ patternId: 'pointer.hover', name: 'Hover', type: 'pointer', trigger: 'Mouse enter / touch hover', behavior: 'Subtle accent border or background tint — never layout shift.', feedback: 'Visual affordance within 150ms.', motionRef: 'motion.timing-fast', states: ['idle', 'hover'] }),
    pattern({ patternId: 'pointer.focus', name: 'Focus', type: 'pointer', trigger: 'Tab / programmatic focus', behavior: 'Visible focus ring — 2px accent outline, offset 2px.', feedback: 'Focus indicator persists until blur.', accessibility: A11Y_FULL, states: ['idle', 'focused'] }),
    pattern({ patternId: 'pointer.click', name: 'Click', type: 'pointer', trigger: 'Primary click / tap', behavior: 'Execute primary action — single intent per click.', feedback: 'Pressed state → action → idle or loading.', states: ['idle', 'hover', 'pressed', 'loading'] }),
    pattern({ patternId: 'pointer.press', name: 'Press', type: 'pointer', trigger: 'Mouse down / touch start', behavior: 'Immediate pressed visual — scale 0.98 or accent fill.', feedback: 'Release completes or cancels action.', motionRef: 'motion.timing-fast' }),
    pattern({ patternId: 'pointer.long-press', name: 'Long Press', type: 'gesture', trigger: 'Hold 500ms+ on touch', behavior: 'Reveal context menu or secondary action.', feedback: 'Haptic-style pulse at threshold.', accessibility: ['touch', 'keyboard', 'screen-reader'] }),
    pattern({ patternId: 'pointer.double-click', name: 'Double Click', type: 'pointer', trigger: 'Two clicks within 300ms', behavior: 'Reserved for expand/edit — never primary destructive.', feedback: 'Brief highlight confirmation.' }),

    // Gesture interactions
    pattern({ patternId: 'gesture.drag', name: 'Drag', type: 'gesture', trigger: 'Press + move', behavior: 'Reorder lists, panels, timeline items — ghost preview follows cursor.', feedback: 'Drop zone highlight on valid targets.', accessibility: ['keyboard', 'touch', 'mouse'] }),
    pattern({ patternId: 'gesture.drop', name: 'Drop', type: 'gesture', trigger: 'Release over valid target', behavior: 'Commit reorder or assignment.', feedback: 'Success micro-animation on landing.', motionRef: 'motion.micro' }),
    pattern({ patternId: 'gesture.swipe', name: 'Swipe', type: 'gesture', trigger: 'Horizontal swipe on mobile', behavior: 'Navigate carousel, dismiss panels, archive rows.', feedback: 'Momentum scroll with snap points.', accessibility: ['touch', 'keyboard'] }),
    pattern({ patternId: 'gesture.gesture-support', name: 'Gesture Support', type: 'gesture', trigger: 'Platform gesture APIs', behavior: 'Pinch-zoom on charts; swipe-back on mobile overlays.', feedback: 'Graceful fallback to buttons on desktop.' }),

    // Expand / collapse
    pattern({ patternId: 'layout.expand', name: 'Expand', type: 'navigation', trigger: 'Chevron / EXPAND label', behavior: 'Accordion section opens — height animate 250ms.', feedback: 'Expanded state persists in session.', motionRef: 'motion.panel', states: ['collapsed', 'expanded'] }),
    pattern({ patternId: 'layout.collapse', name: 'Collapse', type: 'navigation', trigger: 'Chevron / COLLAPSE label', behavior: 'Reverse expand — preserve scroll position.', feedback: 'Collapsed state default for secondary content.', states: ['expanded', 'collapsed'] }),

    // Data actions
    pattern({ patternId: 'action.pin', name: 'Pin', type: 'data-action', trigger: 'Pin icon / PIN action', behavior: 'Pin item to top of list or Mission Control.', feedback: 'Pinned badge visible.', states: ['idle', 'selected'] }),
    pattern({ patternId: 'action.favorite', name: 'Favorite', type: 'data-action', trigger: 'Heart / star toggle', behavior: 'Toggle favorite — optimistic UI update.', feedback: 'Filled accent on favorited.', states: ['idle', 'selected', 'success'] }),
    pattern({ patternId: 'action.approve', name: 'Approve', type: 'data-action', trigger: 'APPROVE button', behavior: 'Move item to approved queue — requires confirmation for bulk.', feedback: 'Success state + optional celebration.', states: ['pending', 'success'], accessibility: A11Y_FULL }),
    pattern({ patternId: 'action.reject', name: 'Reject', type: 'data-action', trigger: 'REJECT button', behavior: 'Return to sender with optional reason.', feedback: 'Warning color before commit.', states: ['pending', 'warning', 'error'] }),
    pattern({ patternId: 'action.archive', name: 'Archive', type: 'data-action', trigger: 'ARCHIVE action', behavior: 'Soft-delete — recoverable from archive view.', feedback: 'Archived state badge.', states: ['idle', 'archived'] }),
    pattern({ patternId: 'action.delete', name: 'Delete', type: 'data-action', trigger: 'DELETE with confirmation', behavior: 'Always confirmation modal — never instant delete.', feedback: 'Error/destructive styling in modal.', states: ['idle', 'warning', 'error'], accessibility: A11Y_FULL }),
    pattern({ patternId: 'action.upload', name: 'Upload', type: 'data-action', trigger: 'File picker / drag-drop zone', behavior: 'Progress bar + cancel — chunked for large files.', feedback: 'Loading → success or error.', states: ['idle', 'loading', 'success', 'error'] }),
    pattern({ patternId: 'action.download', name: 'Download', type: 'data-action', trigger: 'DOWNLOAD / export', behavior: 'Browser download or signed URL.', feedback: 'Brief loading spinner on link.', states: ['idle', 'loading', 'success'] }),

    // Input interactions
    pattern({ patternId: 'input.search', name: 'Search', type: 'input', trigger: 'Search field + Enter', behavior: 'Debounced 200ms live search; Enter commits navigation.', feedback: 'Results highlight match terms.', consumedBy: ['Command Dock', 'Registry Workspaces', 'Knowledge Hub'] }),
    pattern({ patternId: 'input.filter', name: 'Filter', type: 'input', trigger: 'Filter chips / dropdown', behavior: 'Multi-select filters — URL-sync where applicable.', feedback: 'Active filter count badge.' }),
    pattern({ patternId: 'input.sort', name: 'Sort', type: 'input', trigger: 'Column header / sort menu', behavior: 'Toggle asc/desc — persist preference per module.', feedback: 'Arrow indicator on active column.' }),

    // Feedback states
    pattern({ patternId: 'feedback.loading', name: 'Loading', type: 'feedback', trigger: 'Async operation start', behavior: 'Skeleton or spinner — never block entire OS shell.', feedback: 'Loading label for screen readers.', states: ['idle', 'loading'], accessibility: A11Y_FULL }),
    pattern({ patternId: 'feedback.saving', name: 'Saving', type: 'feedback', trigger: 'Auto-save / manual save', behavior: 'Inline "SAVING…" → "SAVED" — 2s fade.', feedback: 'Disable duplicate submit while saving.', states: ['idle', 'loading', 'success'] }),
    pattern({ patternId: 'feedback.success', name: 'Success', type: 'feedback', trigger: 'Operation complete', behavior: 'Green/pass indicator — auto-dismiss 3s.', feedback: 'Optional celebration for milestones.', states: ['success'], motionRef: 'motion.celebration' }),
    pattern({ patternId: 'feedback.warning', name: 'Warning', type: 'feedback', trigger: 'Recoverable issue', behavior: 'Amber warn color — actionable next step.', feedback: 'Persists until dismissed or resolved.', states: ['warning'] }),
    pattern({ patternId: 'feedback.error', name: 'Error', type: 'feedback', trigger: 'Operation failed', behavior: 'Red error message + retry action.', feedback: 'Focus moves to error summary.', states: ['error'], accessibility: A11Y_FULL }),
    pattern({ patternId: 'feedback.celebration', name: 'Celebration', type: 'feedback', trigger: 'Milestone / achievement', behavior: 'Confetti or pulse animation — respects reduced motion.', feedback: '600ms max duration.', motionRef: 'motion.celebration', accessibility: ['reduced-motion', 'screen-reader'] }),
    pattern({ patternId: 'feedback.confirmation', name: 'Confirmation', type: 'feedback', trigger: 'Destructive or irreversible action', behavior: 'Modal with explicit CONFIRM / CANCEL.', feedback: 'Focus trap in modal.', accessibility: A11Y_FULL }),

    // Navigation & overlays
    pattern({ patternId: 'nav.navigation', name: 'Navigation', type: 'navigation', trigger: 'Route link / breadcrumb', behavior: 'Client-side navigate — preserve scroll on back.', feedback: 'Active route highlight in nav.', consumedBy: ['AdminStudioNavigation', 'ExecutiveIconNav'] }),
    pattern({ patternId: 'overlay.modal', name: 'Modal Opening', type: 'overlay', trigger: 'Modal trigger button', behavior: 'Center overlay — backdrop blur 8px, focus trap.', feedback: 'Escape closes; return focus to trigger.', motionRef: 'motion.panel', accessibility: A11Y_FULL }),
    pattern({ patternId: 'overlay.drawer', name: 'Drawer Opening', type: 'overlay', trigger: 'Slide-over trigger', behavior: 'Right/left drawer — 320ms slide.', feedback: 'Learn This Page, Command Dock expansion.', motionRef: 'motion.drawer', accessibility: A11Y_FULL }),
    pattern({ patternId: 'overlay.context-menu', name: 'Context Menus', type: 'overlay', trigger: 'Right-click / long-press / ⋮ menu', behavior: 'Position-aware menu — max 8 items visible.', feedback: 'Keyboard arrows navigate items.', accessibility: A11Y_FULL }),

    // System
    pattern({ patternId: 'system.keyboard-shortcut', name: 'Keyboard Shortcuts', type: 'system', trigger: 'Cmd/Ctrl + key', behavior: 'Global shortcuts documented in Operating Manual.', feedback: 'Shortcut hint in tooltips.', accessibility: ['keyboard', 'screen-reader'] }),
  ];

  patterns.push(
    pattern({
      patternId: 'engine.self',
      name: 'Interaction Engine™',
      type: 'system',
      trigger: 'Platform bootstrap',
      behavior: 'Behavioral source of truth — all Studio OS interactions inherit from catalog.',
      feedback: `Engine accent ${INTERACTION_ENGINE_ACCENT}.`,
      consumedBy: ['InteractionEngineWorkspace'],
      platformStandard: true,
    })
  );

  return patterns;
}

export function getInteractionPattern(patternId: string): InteractionPatternEntry | undefined {
  return buildInteractionPatternCatalog().find((p) => p.patternId === patternId);
}

export function listPatternsByType(type: InteractionPatternEntry['type']): InteractionPatternEntry[] {
  return buildInteractionPatternCatalog().filter((p) => p.type === type);
}

export function getPatternBehavior(patternId: string): string | undefined {
  return getInteractionPattern(patternId)?.behavior;
}

/** Map pattern name to default states for governance */
export function defaultStatesForPattern(name: string): InteractionStateId[] {
  const entry = buildInteractionPatternCatalog().find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  return entry?.states ?? ['idle', 'hover', 'focused'];
}

void MOTION_DEFAULTS;
