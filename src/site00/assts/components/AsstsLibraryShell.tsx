import { useEffect, useState, type ReactNode } from 'react';
import { EnvironmentalStage } from '../../composition';
import { ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1 } from '../../compositions/assts-library-corridor-v1';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { resolveAsstsSlot } from '../services/asstsApi';

type AsstsLibraryShellProps = {
  children: ReactNode;
};

const FALLBACK_CLASS = 'site00-assts-env-fallback--library';

/** Library route — composition-aware environment shell. */
export function AsstsLibraryShell({ children }: AsstsLibraryShellProps) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [source, setSource] = useState<'locked' | 'fallback'>('fallback');

  useEffect(() => {
    let cancelled = false;
    resolveAsstsSlot(ASSTS_ENVIRONMENT_SLOTS.library)
      .then((res) => {
        if (cancelled) return;
        setSource(res.resolved.source);
        setBgUrl(res.resolved.url);
      })
      .catch(() => {
        if (!cancelled) {
          setSource('fallback');
          setBgUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EnvironmentalStage
      composition={ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1}
      backgroundUrl={bgUrl}
      fallbackClass={FALLBACK_CLASS}
      source={source}
      className="site00-assts-shell assts-library-stage"
    >
      {children}
    </EnvironmentalStage>
  );
}
