import { INTERACTION_STATES } from './constants';
import type { InteractionStateSpec } from './types';

const STATE_DESCRIPTIONS: Record<(typeof INTERACTION_STATES)[number], { description: string; visualCue: string; required: boolean }> = {
  idle: { description: 'Default resting state — no user input active.', visualCue: 'Standard border and background.', required: true },
  hover: { description: 'Pointer over element — affordance without commitment.', visualCue: 'Accent border tint or subtle background.', required: true },
  focused: { description: 'Keyboard or programmatic focus — must be visible.', visualCue: '2px accent outline, 2px offset.', required: true },
  pressed: { description: 'Active press — between mousedown and mouseup.', visualCue: 'Scale 0.98 or filled accent.', required: true },
  loading: { description: 'Async operation in progress.', visualCue: 'Spinner or skeleton — disabled pointer.', required: true },
  disabled: { description: 'Action unavailable — not merely hidden.', visualCue: 'Reduced opacity 0.5, no pointer events.', required: true },
  selected: { description: 'Item chosen in a set — tabs, filters, rows.', visualCue: 'Accent border/background from Design Token Engine™.', required: true },
  expanded: { description: 'Collapsible content visible.', visualCue: 'Chevron rotated, height animated.', required: false },
  collapsed: { description: 'Collapsible content hidden.', visualCue: 'Chevron default, compact height.', required: false },
  success: { description: 'Operation completed successfully.', visualCue: 'Pass/green indicator — auto-dismiss.', required: false },
  warning: { description: 'Recoverable issue requiring attention.', visualCue: 'Warn/amber indicator.', required: false },
  error: { description: 'Operation failed — retry available.', visualCue: 'Error/red indicator + message.', required: false },
  pending: { description: 'Awaiting approval or external completion.', visualCue: 'Pending badge or muted styling.', required: false },
  archived: { description: 'Soft-deleted — recoverable.', visualCue: 'Archived badge, reduced prominence.', required: false },
  hidden: { description: 'Not visible but in DOM for a11y/animation.', visualCue: 'aria-hidden or visibility hidden.', required: false },
};

/** Canonical interaction state specifications. */
export function buildInteractionStateSpecs(): InteractionStateSpec[] {
  return INTERACTION_STATES.map((stateId) => ({
    stateId,
    label: stateId.replace(/-/g, ' ').toUpperCase(),
    ...STATE_DESCRIPTIONS[stateId],
  }));
}

export function getRequiredStates(): InteractionStateSpec[] {
  return buildInteractionStateSpecs().filter((s) => s.required);
}

export function getStateSpec(stateId: (typeof INTERACTION_STATES)[number]): InteractionStateSpec | undefined {
  return buildInteractionStateSpecs().find((s) => s.stateId === stateId);
}
