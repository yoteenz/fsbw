import { useMemo } from 'react';
import { buildGlassStyle } from '../utilities/glassStyle';
import type { FdsGlassVariant } from '../tokens/types';

export function useGlassStyle(variant: FdsGlassVariant) {
  return useMemo(() => buildGlassStyle(variant), [variant]);
}
