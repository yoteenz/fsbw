import { describe, expect, it } from 'vitest';
import {
  COMPONENT_IMPLEMENTATION_PHASES,
  DEFAULT_REVIEW_COMPONENT,
  canAdvanceToPhase,
  componentsHiddenInReview,
  currentImplementationPhase,
  isComponentVisibleInReview,
  parseReviewComponentFromQuery,
} from './experience-lab-v2-component-review';

describe('Experience Lab Component Review Mode', () => {
  it('defaults to Phase 1 Command Dock', () => {
    expect(DEFAULT_REVIEW_COMPONENT).toBe('command-dock');
    expect(COMPONENT_IMPLEMENTATION_PHASES[0]).toBe('command-dock');
  });

  it('hides all components except active in review mode', () => {
    expect(isComponentVisibleInReview(true, 'command-dock', 'command-dock')).toBe(true);
    expect(isComponentVisibleInReview(true, 'command-dock', 'workbench')).toBe(false);
    expect(isComponentVisibleInReview(true, 'command-dock', 'approval-bridge')).toBe(false);
    expect(componentsHiddenInReview('command-dock')).toHaveLength(8);
  });

  it('shows all components when review mode disabled', () => {
    expect(isComponentVisibleInReview(false, 'command-dock', 'workbench')).toBe(true);
  });

  it('enforces mandatory implementation phase order', () => {
    expect(currentImplementationPhase({})).toBe('command-dock');
    expect(canAdvanceToPhase('command-dock', {})).toBe(true);
    expect(canAdvanceToPhase('workbench', {})).toBe(false);
    expect(canAdvanceToPhase('workbench', { 'command-dock': 'StudioWorldCommandDock v1' })).toBe(true);
  });

  it('parses review component from query string', () => {
    expect(parseReviewComponentFromQuery('?elabReview=workbench')).toBe('workbench');
    expect(parseReviewComponentFromQuery('?elabReview=off')).toBeNull();
  });
});
