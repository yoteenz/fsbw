import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../../../pages/admin/components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { STUDIO_ADMINISTRATION_ROUTES } from '../../../studio-os-core/application/routes';
import { STUDIO_PLATFORM_NAV, resolvePlatformNavFromPath } from '../../../studio-os-core/platform/navigation';
import { STUDIO_OS_UPPERCASE_CLASS, ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import { shouldShowCommandDock } from '../studio/command-dock/CommandDock';
import { StudioOrbMount, StudioOrbProvider, useStudioOrbEnvironmentActive } from '../studio/studio-orb/StudioOrbShell';
import { STUDIO_OS_PLATFORM } from '../../../studio-os-core/config/platform';

function StudioOrbEnvironment({ children }: { children: ReactNode }) {
  const active = useStudioOrbEnvironmentActive();
  return (
    <div className={`studio-conversation-environment${active ? ' studio-conversation-environment-active' : ''}`}>
      {children}
    </div>
  );
}

type StudioPlatformLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  hideNav?: boolean;
};

/**
 * Studio Administration shell — platform layer above every organization.
 * Never renders organization nav tabs, workspace switcher, or Mission Control.
 */
export function StudioPlatformLayout({
  title,
  subtitle,
  children,
  showBack = true,
  onBack,
  hideNav = false,
}: StudioPlatformLayoutProps) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeNav = resolvePlatformNavFromPath(pathname);

  const navGroups = useMemo(() => {
    const primary = STUDIO_PLATFORM_NAV.filter((item) =>
      ['command-center', 'registry', 'licensing', 'marketplace', 'system-health', 'global-ai', 'studio-intelligence'].includes(
        item.id
      )
    );
    return primary;
  }, []);

  const handleBack = onBack ?? (() => navigate(STUDIO_ADMINISTRATION_ROUTES.commandCenter));

  return (
    <StudioOrbProvider>
    <div className={`min-h-screen ${STUDIO_OS_UPPERCASE_CLASS}`} style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <StudioOrbEnvironment>
      <div className="relative z-10">
        <AdminHeader
          title={title}
          showBack={showBack}
          onBack={handleBack}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4" style={{ paddingBottom: shouldShowCommandDock(pathname) ? '88px' : undefined }}>
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden min-h-0"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100dvh - 160px)' }}
            >
              <div className="flex-shrink-0 px-5 pb-2" style={{ marginTop: '10px' }}>
                <div className="p-2 mb-2" style={{ border: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(99,102,241,0.06)' }}>
                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: '#6366F1', margin: 0 }}>
                    STUDIO ADMINISTRATION · {STUDIO_OS_PLATFORM.name}
                  </p>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#666', margin: '4px 0 0', lineHeight: 1.45 }}>
                    Platform layer above every organization · no default company · no organization Mission Control
                  </p>
                </div>

                <h2
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {title}
                </h2>

                {subtitle ? (
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
                      color: '#808080',
                      marginTop: '6px',
                      marginBottom: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {subtitle}
                  </p>
                ) : null}

                {!hideNav ? (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {navGroups.map((item) => {
                      const active = activeNav?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(item.route)}
                          className="px-2 py-1 border"
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '5px',
                            fontWeight: 515,
                            color: active ? '#FFF' : '#6366F1',
                            background: active ? '#6366F1' : 'rgba(255,255,255,0.85)',
                            borderColor: ADMIN_STUDIO_THEME.panelBorder,
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div style={{ borderBottom: '1px solid #e5e7eb', marginTop: '10px' }} />
              </div>

              <div style={{ padding: '8px 20px 24px', boxSizing: 'border-box' }}>{children}</div>
            </div>
          </div>
        </div>
      </div>
      </StudioOrbEnvironment>
      {shouldShowCommandDock(pathname) ? <StudioOrbMount /> : null}
    </div>
    </StudioOrbProvider>
  );
}
