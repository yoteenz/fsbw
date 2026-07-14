import type { ExperienceLabV2EnvironmentConfig } from './experience-lab-v2.types';
import { DEFAULT_V2_ENVIRONMENT } from './experience-lab-v2.config';

type Props = {
  config?: Partial<ExperienceLabV2EnvironmentConfig>;
  preset?: 'dark' | 'bright';
  isMobile?: boolean;
  /** Viewport scope keeps the environment inside Studio Viewport only (not full shell). */
  scope?: 'shell' | 'viewport';
};

/** Decorative environment beneath React UI — never contains production interface. */
export function ExperienceLabEnvironmentLayer({
  config,
  preset = 'dark',
  isMobile = false,
  scope = 'shell',
}: Props) {
  const env = { ...DEFAULT_V2_ENVIRONMENT, ...config };
  const url = isMobile ? env.mobileEnvironmentUrl ?? env.desktopEnvironmentUrl : env.desktopEnvironmentUrl;

  return (
    <div
      className={`elab-v2__env${scope === 'viewport' ? ' elab-v2__env--viewport' : ''}`}
      data-experience-lab-environment
      data-elab-env-scope={scope}
      aria-hidden
      style={
        {
          '--elab-env-opacity': env.environmentOpacity,
          '--elab-env-position': env.environmentPosition,
          '--elab-env-scale': env.environmentScale,
        } as React.CSSProperties
      }
    >
      {url ? (
        <img src={url} alt="" role="presentation" />
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
      <div className="elab-v2__env-scrim" style={{ opacity: scope === 'viewport' ? Math.min(env.scrimStrength, 0.38) : env.scrimStrength }} />
    </div>
  );
}
