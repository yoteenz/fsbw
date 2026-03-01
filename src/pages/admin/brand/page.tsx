import { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';

const BRAND_TABS = ['OVERVIEW', 'METRICS', 'ACHIEVEMENTS'] as const;

export default function AdminBrand() {
  const [activeTab, setActiveTab] = useState<typeof BRAND_TABS[number]>('OVERVIEW');
  const [brandMetrics] = useState({
    retention: '94%',
    referralRate: '23%',
    repeatBookings: '78%',
    growthRate: '+15%',
    brandScore: 94,
    marketPenetration: '15%'
  });

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
          title="BRAND"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {/* Main card */}
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4" style={{ marginBottom: 0 }}>
                <h2
                  className="flex-1"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  BRAND
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '8px' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#EB1C24" />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              <div className="flex px-5">
                {BRAND_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-3 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
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

              {/* Tab content */}
              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px' }}>
                {activeTab === 'OVERVIEW' && (
                  <>
                    <div className="text-center py-4">
                      <p className="font-covered-by-your-grace text-4xl" style={{ color: '#EB1C24' }}>{brandMetrics.brandScore}%</p>
                      <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>OVERALL BRAND SCORE</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.retention}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>CLIENT RETENTION</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.referralRate}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>REFERRAL RATE</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.repeatBookings}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>REPEAT BOOKINGS</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.growthRate}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>GROWTH RATE</p>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'METRICS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>KEY METRICS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'CLIENT RETENTION', value: brandMetrics.retention },
                        { label: 'REFERRAL RATE', value: brandMetrics.referralRate },
                        { label: 'REPEAT BOOKINGS', value: brandMetrics.repeatBookings },
                        { label: 'GROWTH RATE', value: brandMetrics.growthRate },
                        { label: 'MARKET PENETRATION', value: brandMetrics.marketPenetration },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'ACHIEVEMENTS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '12px' }}>RECENT ACHIEVEMENTS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'REVENUE TARGET EXCEEDED', value: '✓ ACHIEVED' },
                        { label: '94% RETENTION MILESTONE', value: '✓ ACHIEVED' },
                        { label: '15% QUARTERLY GROWTH', value: '✓ ACHIEVED' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
              style={{ ...pageActionButtonStyle, marginTop: '14px' }}
            >
              VIEW BRAND ANALYTICS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

