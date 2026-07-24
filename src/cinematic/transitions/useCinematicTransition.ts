import type { FscsTransitionId } from '../utilities/types';
import { resolveTransitionPreset } from '../transitions/presets';
import { resolveTransitionId } from '../utilities/resolve';
import { useMemo } from 'react';

export function useCinematicTransition(transition: FscsTransitionId | string = 'luxury-dissolve') {
  const id = resolveTransitionId(String(transition));
  return useMemo(() => resolveTransitionPreset(id), [id]);
}
