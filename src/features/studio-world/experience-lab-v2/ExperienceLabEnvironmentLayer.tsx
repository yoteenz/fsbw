import { useEffect, useRef, useState } from 'react';
import type { ExperienceLabV2EnvironmentConfig } from './experience-lab-v2.types';
import { DEFAULT_V2_ENVIRONMENT } from './experience-lab-v2.config';

type Props = {
  config?: Partial<ExperienceLabV2EnvironmentConfig>;
  preset?: 'dark' | 'bright';
  isMobile?: boolean;
  /** Viewport scope keeps the environment inside Studio Viewport only (not full shell). */
  scope?: 'shell' | 'viewport';
  /** Direct environment URL override (design variant preview/production). */
  environmentUrl?: string | null;
  /** Crossfade duration when environmentUrl changes (viewport only). */
  crossfadeMs?: number;
};

/** Decorative environment beneath React UI — never contains production interface. */
export function ExperienceLabEnvironmentLayer({
  config,
  preset = 'dark',
  isMobile = false,
  scope = 'shell',
  environmentUrl,
  crossfadeMs = 300,
}: Props) {
  const env = { ...DEFAULT_V2_ENVIRONMENT, ...config };
  const fallbackUrl = isMobile ? env.mobileEnvironmentUrl ?? env.desktopEnvironmentUrl : env.desktopEnvironmentUrl;
  const url = environmentUrl ?? fallbackUrl;

  const [layers, setLayers] = useState<{ current: string | null; previous: string | null }>({
    current: url,
    previous: null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!url) return;
    setLayers((prev) => {
      if (prev.current === url) return prev;
      return { current: url, previous: prev.current };
    });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLayers((prev) => ({ ...prev, previous: null }));
    }, crossfadeMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url, crossfadeMs]);

  const scrimOpacity = scope === 'viewport' ? Math.min(env.scrimStrength, 0.38) : env.scrimStrength;

  return (
    <div
      className={`elab-v2__env${scope === 'viewport' ? ' elab-v2__env--viewport' : ''}${scope === 'viewport' && layers.previous ? ' elab-v2__env--crossfade' : ''}`}
      data-experience-lab-environment
      data-elab-env-scope={scope}
      aria-hidden
      style={
        {
          '--elab-env-opacity': env.environmentOpacity,
          '--elab-env-position': env.environmentPosition,
          '--elab-env-scale': env.environmentScale,
          '--elab-env-crossfade-ms': `${crossfadeMs}ms`,
        } as React.CSSProperties
      }
    >
      {layers.previous ? (
        <img src={layers.previous} alt="" role="presentation" className="elab-v2__env-img elab-v2__env-img--outgoing" />
      ) : null}
      {layers.current ? (
        <img src={layers.current} alt="" role="presentation" className="elab-v2__env-img elab-v2__env-img--current" />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background:
              preset === 'bright'
                ? 'linear-gradient(160deg, #e8e4dc 0%, #f8f6f2 40%, #d4cfc4 100%)'
                : 'linear-gradient(160deg, #0c0e12 0%, #1a1d26 45%, #0a0b0f 100%)',
          }}
        />
      )}
      <div className="elab-v2__env-scrim" style={{ opacity: scrimOpacity }} />
    </div>
  );
}
