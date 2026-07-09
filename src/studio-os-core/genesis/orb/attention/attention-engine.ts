import { buildHeadquartersMissionProjection } from '../../executive-headquarters/projections/briefing-projection';
import { buildHeadquartersCompanyProjection } from '../../executive-headquarters/projections/company-projection';
import type { OrbAttentionState, OrbRuntimeInput } from '../types';
import { buildOrbContextBundle } from '../context/context-engine';

/** Orb Attention Engine — when to interrupt, recommend, observe, or stay silent */
export function resolveOrbAttentionState(input: OrbRuntimeInput): OrbAttentionState {
  const company = buildHeadquartersCompanyProjection();
  const missions = buildHeadquartersMissionProjection(company);
  const context = buildOrbContextBundle(input);
  const inFocusRoom = context.roomLabel.includes('Founder Office');
  const hasBlocker = missions.blockedCount > 0;
  const hasApproval = missions.awaitingApprovalCount > 0;

  if (inFocusRoom) {
    return {
      mode: 'silent',
      reason: 'Founder Office deep work — suppress non-critical prompts.',
      shouldInterrupt: false,
      shouldRemainSilent: true,
      presenceState: 'focus-guard',
    };
  }

  if (hasBlocker || hasApproval) {
    return {
      mode: hasBlocker ? 'interrupt' : 'recommend',
      reason: hasBlocker
        ? 'Blocked mission requires founder authority or dependency resolution.'
        : 'Mission awaiting founder approval.',
      shouldInterrupt: hasBlocker,
      shouldRemainSilent: false,
      presenceState: hasBlocker ? 'recommending' : 'idle',
    };
  }

  if (input.pathname.includes('/executive-headquarters')) {
    return {
      mode: 'observe',
      reason: 'Headquarters arrival context is already composed in-room.',
      shouldInterrupt: false,
      shouldRemainSilent: false,
      presenceState: 'briefing',
    };
  }

  return {
    mode: 'recommend',
    reason: 'Calm proactive advisory — one next best action available.',
    shouldInterrupt: false,
    shouldRemainSilent: false,
    presenceState: 'idle',
  };
}
