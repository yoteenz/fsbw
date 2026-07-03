import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../../pages/admin/components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

type AdminStudioStageShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  breadcrumbParentLabel?: string;
  breadcrumbParentPath?: string;
  children: ReactNode;
  /** Optional accent for stage glow */
  accentHex?: string;
};

/** Dark cinematic stage inside marble admin shell — luxury streaming studio feel. */
export function AdminStudioStageShell({
  title,
  subtitle,
  showBack = true,
  onBack,
  breadcrumbParentLabel = 'THE STUDIO',
  breadcrumbParentPath = '/admin/studio',
  children,
  accentHex = '#EB1C24',
}: AdminStudioStageShellProps) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();

  const handleBack = onBack ?? (() => navigate(breadcrumbParentPath));

  return (
    <div className="min-h-screen relative">
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
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={title}
          showBack={showBack}
          onBack={handleBack}
          breadcrumbParentLabel={breadcrumbParentLabel}
          breadcrumbParentPath={breadcrumbParentPath}
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="relative overflow-hidden border border-black shadow-2xl"
              style={{
                borderWidth: '1.3px',
                minHeight: 'calc(100dvh - 200px)',
                background: 'linear-gradient(165deg, #0a0a0a 0%, #121212 45%, #0d0d0d 100%)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${accentHex}33 0%, transparent 70%)`,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
                }}
              />

              <div className="relative z-10 p-4">
                {subtitle ? (
                  <p
                    className="text-[9px] font-futura uppercase mb-4 tracking-widest"
                    style={{ fontWeight: 515, color: '#9A9A9A', lineHeight: 1.45 }}
                  >
                    {subtitle}
                  </p>
                ) : null}
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
