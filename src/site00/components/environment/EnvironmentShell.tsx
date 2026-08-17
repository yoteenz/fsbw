import type { ReactNode } from 'react';
import { SITE00_ENVIRONMENTS, type EnvironmentId } from '../../config/environments';
import '../../styles/site00.css';

type EnvironmentShellProps = {
  environmentId: EnvironmentId;
  children: ReactNode;
  className?: string;
};

/**
 * Reusable environmental rendering shell.
 * Separates ENVIRONMENT from INTERFACE — background does not reload on UI state changes
 * within the same environment family.
 */
export function EnvironmentShell({ environmentId, children, className = '' }: EnvironmentShellProps) {
  const config = SITE00_ENVIRONMENTS[environmentId];

  return (
    <div className={`site00-shell ${className}`.trim()} data-environment={environmentId}>
      <div
        className={`site00-env-layer ${config.fallbackClass} ${config.lightingClass}`}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--site-z-env)',
          backgroundSize: 'cover',
          backgroundPosition: config.desktopPosition,
          transform: `scale(${config.desktopScale})`,
          transformOrigin: 'center center',
          ...(config.asset
            ? {
                backgroundImage: `url(${config.asset})`,
              }
            : {}),
        }}
      />
      <div className="site00-ui-layer" style={{ position: 'relative', zIndex: 'var(--site-z-ui)', minHeight: '100dvh' }}>
        {children}
      </div>
    </div>
  );
}
