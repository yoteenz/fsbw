import type { StudioWorldIconProceduralState, IconInteractionContext } from './types';

export function resolveInteractionState(
  baseState: StudioWorldIconProceduralState,
  interaction?: IconInteractionContext
): StudioWorldIconProceduralState {
  if (!interaction) return baseState;
  if (interaction.pressed) return 'pressed';
  if (interaction.selected && baseState === 'default') return 'selected';
  if (interaction.focused || interaction.keyboardFocus) return baseState === 'default' ? 'focused' : baseState;
  if (interaction.hovered && baseState === 'default') return 'hover';
  return baseState;
}

export function mapPointerStateToProcedural(
  pointer: 'default' | 'hover' | 'active' | 'focus'
): StudioWorldIconProceduralState {
  switch (pointer) {
    case 'hover':
      return 'hover';
    case 'active':
      return 'active';
    case 'focus':
      return 'focused';
    default:
      return 'default';
  }
}
