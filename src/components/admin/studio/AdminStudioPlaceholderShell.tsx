import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../../pages/admin/components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import type { AdminStudioHubCard as StudioCard } from '../../../utils/adminStudioDemo';

type AdminStudioPlaceholderShellProps = {
  section: StudioCard;
};

/** Empty Studio section — polished shell awaiting future CMS / AI tooling. */
export function AdminStudioPlaceholderShell({ section }: AdminStudioPlaceholderShellProps) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();

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
          title={section.title}
          showBack
          onBack={() => navigate('/admin/studio')}
          breadcrumbParentLabel="THE STUDIO"
          breadcrumbParentPath="/admin/studio"
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black p-5 shadow-lg"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100dvh - 200px)' }}
            >
              <p
                className="text-lg uppercase mb-2"
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                  color: '#EB1C24',
                }}
              >
                {section.title}
              </p>
              <p
                className="text-[10px] font-futura uppercase mb-6"
                style={{ fontWeight: 515, color: '#808080', lineHeight: 1.45 }}
              >
                {section.description}
              </p>

              <div
                className="border border-black/20 p-4"
                style={{ borderWidth: '1.3px', background: 'rgba(0,0,0,0.03)' }}
              >
                <p
                  className="text-[10px] font-futura uppercase mb-2"
                  style={{ fontWeight: 515, color: '#000000' }}
                >
                  COMING SOON
                </p>
                <p
                  className="text-[9px] font-futura uppercase"
                  style={{ fontWeight: 515, color: '#808080', lineHeight: 1.5 }}
                >
                  THIS MODULE IS PART OF THE STUDIO CREATIVE OPERATING SYSTEM. FUNCTIONALITY WILL SHIP IN A
                  FUTURE RELEASE — ROUTING AND LAYOUT ARE LIVE FOR QA.
                </p>
              </div>

              <p
                className="mt-6 text-[8px] font-futura uppercase"
                style={{ fontWeight: 515, color: '#EB1C24' }}
              >
                DEMO METRIC: {section.metric}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
