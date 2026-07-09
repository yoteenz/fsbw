import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { shouldShowCommandDock } from '../../studio/command-dock/CommandDock';
import { GlobalAtlasProvider } from '../../studio/global-atlas';
import { StudioWorldExperienceProvider } from '../../studio/global-experience';
import { resolveExperienceProfileForPath } from '../../../../studio-os-core/studio-world-experience';
import { StudioOrbMount } from '../../studio/studio-orb/StudioOrbMount';
import { StudioOrbProvider } from '../../studio/studio-orb/StudioOrbProvider';

type Props = {
  children: ReactNode;
};

/**
 * Full-viewport immersive shell — escapes admin document flow.
 * Includes Studio Orb™ + Global Atlas Layer™ for universal navigation.
 */
export function DepartmentGoldenBuildShell({ children }: Props) {
  useRequireAdminPageAccess();
  const { pathname } = useLocation();
  const experienceProfile = resolveExperienceProfileForPath(pathname);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.classList.add('gb-immersive-active');
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.classList.remove('gb-immersive-active');
    };
  }, []);

  return (
    <StudioOrbProvider>
      <GlobalAtlasProvider>
        <StudioWorldExperienceProvider profile={experienceProfile}>
          <div
            className="gb-immersive-portal"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              width: '100vw',
              height: '100dvh',
              overflow: 'hidden',
              background: '#12100e',
            }}
            role="application"
            aria-label="Studio OS department room"
            data-studio-world-experience={experienceProfile.departmentId}
          >
            {children}
          </div>
          {shouldShowCommandDock(pathname) && typeof document !== 'undefined'
            ? createPortal(<StudioOrbMount />, document.body)
            : null}
        </StudioWorldExperienceProvider>
      </GlobalAtlasProvider>
    </StudioOrbProvider>
  );
}

export function useDepartmentRoomExit() {
  const navigate = useNavigate();
  return () => navigate('/admin/studio/overview');
}
