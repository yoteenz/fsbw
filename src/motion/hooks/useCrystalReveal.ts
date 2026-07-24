import { useEffect, useMemo, useState } from 'react';
import { buildLightingFromPreset } from '../engine/lighting';
import { useFsmsPreset } from './useFsmsPreset';
import { useReducedMotion } from './useReducedMotion';
import type { FsmsPresetId } from '../tokens/types';

export type CrystalRevealPhase = 'idle' | 'sparkle' | 'sweep' | 'hold' | 'dissolve' | 'complete';

export type UseCrystalRevealOptions = {
  preset?: FsmsPresetId | string;
  duration?: number;
  delay?: number;
  autoPlay?: boolean;
  loop?: boolean;
};

export function useCrystalReveal(options: UseCrystalRevealOptions = {}) {
  const { preset, duration, delay, autoPlay = true, loop = false } = options;
  const reducedMotion = useReducedMotion();
  const { preset: resolvedPreset, timing } = useFsmsPreset({ preset, duration, delay });
  const lighting = useMemo(() => buildLightingFromPreset(resolvedPreset), [resolvedPreset]);

  const [phase, setPhase] = useState<CrystalRevealPhase>(reducedMotion ? 'hold' : 'idle');
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setPhase('hold');
      setProgress(1);
      return;
    }
    if (!autoPlay) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      setPhase('idle');
      setProgress(0);

      const schedule = (ms: number, fn: () => void) => {
        timers.push(
          setTimeout(() => {
            if (!cancelled) fn();
          }, ms),
        );
      };

      const { delay: d, sparkleIn, sweep, hold, dissolve } = timing;
      let t = d;

      schedule(t, () => {
        setPhase('sparkle');
        setProgress(0.08);
      });
      t += sparkleIn;

      schedule(t, () => {
        setPhase('sweep');
        setProgress(0.35);
      });
      t += sweep;

      schedule(t, () => {
        setPhase('hold');
        setProgress(0.85);
      });
      t += hold;

      if (dissolve > 0) {
        schedule(t, () => {
          setPhase('dissolve');
          setProgress(0.95);
        });
        t += dissolve;
      }

      schedule(t, () => {
        setPhase('complete');
        setProgress(1);
        if (loop || resolvedPreset.loop) {
          schedule(400, () => setCycle((c) => c + 1));
        }
      });
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [
    autoPlay,
    loop,
    reducedMotion,
    resolvedPreset.loop,
    timing,
    cycle,
  ]);

  return {
    phase,
    progress,
    timing,
    preset: resolvedPreset,
    lighting,
    reducedMotion,
  };
}
