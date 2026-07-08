import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildStudioAlphaCostSnapshot,
  STUDIO_ALPHA_COST_UPDATED_EVENT,
  type StudioAlphaCostContext,
  type StudioAlphaCostSnapshot,
} from '../studio-os-core/studio-alpha-cost';

export function useStudioAlphaCost(ctx: StudioAlphaCostContext): StudioAlphaCostSnapshot {
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const onUpdate = () => bump();
    window.addEventListener(STUDIO_ALPHA_COST_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(STUDIO_ALPHA_COST_UPDATED_EVENT, onUpdate);
  }, [bump]);

  useEffect(() => {
    if (ctx.pipelinePhase !== 'generating') return;
    const id = window.setInterval(bump, 2000);
    return () => window.clearInterval(id);
  }, [ctx.pipelinePhase, bump]);

  return useMemo(() => {
    void tick;
    return buildStudioAlphaCostSnapshot(ctx);
  }, [ctx, tick]);
}
