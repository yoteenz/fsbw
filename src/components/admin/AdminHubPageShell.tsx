import type { ReactNode } from 'react';
import AdminHeader from '../../pages/admin/components/AdminHeader';

export type AdminHubSummaryPanel = {
  label: string;
  value: string;
};

type AdminHubPageShellProps = {
  title: string;
  panels: AdminHubSummaryPanel[];
  tabs: readonly string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
  onBack?: () => void;
};

/** Pending-page layout: marble bg, header, summary panels, tabs, scrollable body. */
export function AdminHubPageShell({
  title,
  panels,
  tabs,
  activeTab,
  onTabChange,
  children,
  onBack,
}: AdminHubPageShellProps) {
  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
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
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={title}
          showBack
          onBack={onBack ?? (() => window.history.back())}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex-shrink-0 px-5 pb-2" style={{ marginTop: '10px' }} />

              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                {panels.map((panel) => (
                  <div
                    key={panel.label}
                    className="text-center py-3"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      borderRadius: '4px',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      paddingBottom: '10px',
                      paddingLeft: '6px',
                      paddingRight: '6px',
                    }}
                  >
                    <p
                      className="font-covered-by-your-grace text-xl"
                      style={{
                        color: '#EB1C24',
                        fontSize: panel.value.length > 10 ? '18px' : '24px',
                        lineHeight: 1.1,
                        wordBreak: 'break-word',
                      }}
                    >
                      {panel.value}
                    </p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px', lineHeight: 1.2 }}>
                      {panel.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onTabChange(tab)}
                    className="py-3 px-2 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: activeTab === tab ? '#EB1C24' : '#808080',
                      border: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        borderBottom: activeTab === tab ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                <div
                  className="overflow-y-auto admin-hub-tab-scroll"
                  style={{
                    maxHeight: '380px',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
