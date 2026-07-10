import { useEffect, useRef, type ReactNode } from 'react';
import { incrementBisectEffectCount, incrementBisectRenderCount, recordFreezeCheckpoint } from './freeze-trace-ledger';

type Props = {
  name: string;
  stage: number;
  children: ReactNode;
};

/** Render/effect counter for bisect — records first mount only to avoid trace spam. */
export function BisectInstrument({ name, stage, children }: Props) {
  const renders = useRef(0);
  const mounted = useRef(false);
  renders.current += 1;
  incrementBisectRenderCount();

  if (renders.current <= 3 || renders.current % 25 === 0) {
    recordFreezeCheckpoint({
      route: '/__experience-engine-bisect',
      stage,
      component: name,
      function: 'render',
      phase: 'enter',
      detail: `render#${renders.current}`,
    });
  }

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    incrementBisectEffectCount();
    recordFreezeCheckpoint({
      route: '/__experience-engine-bisect',
      stage,
      component: name,
      function: 'useEffect',
      phase: 'enter',
      detail: 'mount',
    });
    return () => {
      recordFreezeCheckpoint({
        route: '/__experience-engine-bisect',
        stage,
        component: name,
        function: 'useEffect',
        phase: 'exit',
        detail: 'unmount',
      });
    };
  }, [name, stage]);

  return children;
}
