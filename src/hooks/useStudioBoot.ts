import { useCallback, useEffect, useState } from 'react';
import {
  runStudioBootstrap,
  STUDIO_BOOT_EVENT,
  type StudioBootReport,
} from '../studio-os-core/bootstrap';
import {
  runtimeReadinessEngine,
  type RuntimeReadinessSnapshot,
} from '../studio-os-core/runtime-readiness';

export function useStudioBoot(through: 'experience-runtime' | 'ui-render' = 'experience-runtime') {
  const [bootReport, setBootReport] = useState<StudioBootReport | null>(null);
  const [readiness, setReadiness] = useState<RuntimeReadinessSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const run = useCallback(async (force = false) => {
    setLoading(true);
    setFatalError(null);
    try {
      const report = await runStudioBootstrap({ through, force });
      setBootReport(report);
      const snap = await runtimeReadinessEngine.ensureReady(force);
      setReadiness(snap);
      if (!snap.bootReady) {
        setFatalError(snap.errors[0] ?? 'Boot incomplete');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFatalError(msg);
    } finally {
      setLoading(false);
    }
  }, [through]);

  useEffect(() => {
    void run(false);
  }, [run]);

  useEffect(() => {
    const onBoot = () => {
      void run(false);
    };
    window.addEventListener(STUDIO_BOOT_EVENT, onBoot);
    return () => window.removeEventListener(STUDIO_BOOT_EVENT, onBoot);
  }, [run]);

  return {
    loading,
    bootReport,
    readiness,
    fatalError,
    retry: () => run(true),
  };
}
