import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { AdminStudioHubCard } from '../../../components/admin/studio/AdminStudioHubCard';
import {
  ADMIN_STUDIO_DASHBOARD_FOOTER,
  ADMIN_STUDIO_DASHBOARD_ITEMS,
  ADMIN_STUDIO_DASHBOARD_METRIC,
  ADMIN_STUDIO_HUB_CARDS,
  ADMIN_STUDIO_HUB_SUBTITLE,
} from '../../../utils/adminStudioDemo';

export default function AdminStudioPage() {
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
          title="THE STUDIO"
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto space-y-4" style={{ minHeight: 'calc(100dvh - 160px)' }}>
            <div
              className="bg-white/60 backdrop-blur-sm border border-black p-4 shadow-lg"
              style={{ borderWidth: '1.3px' }}
            >
              <div className="flex items-center justify-between -mt-1">
                <span
                  className="text-red-500 font-bold text-xl tracking-wider uppercase"
                  style={{
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    color: '#EB1C24',
                  }}
                >
                  THE STUDIO
                </span>
                <span
                  className="text-black font-bold text-xl flex-shrink-0 ml-2"
                  style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
                >
                  {ADMIN_STUDIO_DASHBOARD_METRIC}
                </span>
              </div>
              <p
                className="mt-2 text-[10px] font-futura uppercase"
                style={{ fontWeight: 515, color: '#808080', lineHeight: 1.4 }}
              >
                {ADMIN_STUDIO_HUB_SUBTITLE}
              </p>
              <div className="mt-3 space-y-2">
                {ADMIN_STUDIO_DASHBOARD_ITEMS.map((item) => (
                  <div key={item.label} className="text-[9px] text-left">
                    <span className="text-black font-medium font-futura uppercase" style={{ fontWeight: 500 }}>
                      {item.label}:{' '}
                      <span
                        className="font-futura uppercase"
                        style={{
                          fontWeight: 515,
                          color: item.color === 'text-red-500' ? '#EB1C24' : '#808080',
                        }}
                      >
                        {item.value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <p
                  className="text-[8px] font-futura uppercase"
                  style={{ fontWeight: 515, color: '#EB1C24' }}
                >
                  {ADMIN_STUDIO_DASHBOARD_FOOTER}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-start">
              {ADMIN_STUDIO_HUB_CARDS.map((card) => (
                <AdminStudioHubCard
                  key={card.id}
                  card={card}
                  onClick={() => navigate(card.route)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
