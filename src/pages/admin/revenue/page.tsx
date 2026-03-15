import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminRevenue } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';

const REVENUE_TABS = ['OVERVIEW', 'ORDERS', 'PRODUCTS', 'PAYMENTS'] as const;

export default function AdminRevenue() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof REVENUE_TABS[number]>('OVERVIEW');
  const [totalRevenue, setTotalRevenue] = useState(45700);
  const [totalOrders, setTotalOrders] = useState(53);
  const [breakdown, setBreakdown] = useState<{ month: string; value: number }[]>([]);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminRevenue()
        .then((r) => {
          setTotalRevenue(r.totalRevenue);
          setTotalOrders(r.totalOrders);
          setBreakdown(r.breakdown || []);
        })
        .catch(() => {});
    }
  }, []);

  const revenueK = totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : String(totalRevenue);
  const revenueFormatted = totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).replace('$', '$');

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
          title="REVENUE"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {/* Main card – matches clients overview structure */}
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
                  REVENUE
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '8px' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="#EB1C24" />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Total revenue & orders – above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4">
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>${revenueK}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>TOTAL REVENUE</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{totalOrders}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>ORDERS</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex px-5">
                {REVENUE_TABS.map((tab) => (
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
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>REVENUE BREAKDOWN</h3>
                    <div className="space-y-2 mb-4">
                      {breakdown.length > 0
                        ? breakdown.slice(0, 4).map((row) => (
                        <div key={row.month} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.month}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>${row.value.toLocaleString()}</span>
                        </div>
                      ))
                        : [
                        { label: 'THIS MONTH', value: revenueFormatted },
                        { label: 'LAST MONTH', value: '$0' },
                        { label: 'THIS YEAR', value: revenueFormatted },
                        { label: 'GROWTH RATE', value: '—' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>QUARTERLY</h3>
                    <div className="flex justify-between gap-4 py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>Q1</span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>$89K</span>
                    </div>
                    <div className="flex justify-between gap-4 py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>Q2</span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>$95K</span>
                    </div>
                    <div className="flex justify-between gap-4 py-2">
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>Q3</span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>$112K</span>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '16px', marginBottom: '8px' }}>FINANCIAL HEALTH</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'PROFIT MARGIN', value: '35%' },
                        { label: 'CASH FLOW', value: 'Positive' },
                        { label: 'DEBT RATIO', value: 'Low' },
                        { label: 'INVESTMENT RETURN', value: '18%' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'ORDERS' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>53</p>
                        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>THIS MONTH</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>$861</p>
                        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>AVG ORDER</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'THIS MONTH', value: '53' },
                        { label: 'LAST MONTH', value: '47' },
                        { label: 'AVERAGE ORDER', value: '$861' },
                        { label: 'CONVERSION RATE', value: '8.3%' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'PRODUCTS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '12px' }}>TOP PRODUCTS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'PREMIUM NOIR WIG', value: '23 sales' },
                        { label: 'BODY WAVE COLLECTION', value: '18 sales' },
                        { label: 'CURLY GODDESS SERIES', value: '12 sales' },
                        { label: 'SILKY STRAIGHT LINE', value: '8 sales' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '16px', marginBottom: '8px' }}>MONTHLY BREAKDOWN</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'JANUARY', value: '$42,300' },
                        { label: 'FEBRUARY', value: '$38,900' },
                        { label: 'MARCH', value: '$45,600' },
                        { label: 'APRIL', value: '$41,200' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'PAYMENTS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '12px' }}>PAYMENT METHODS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'CREDIT CARD', value: '68%' },
                        { label: 'PAYPAL', value: '22%' },
                        { label: 'BANK TRANSFER', value: '8%' },
                        { label: 'CASH', value: '2%' },
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
              onClick={() => navigate('/admin/dashboard')}
              className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
              style={{ ...pageActionButtonStyle, marginTop: '14px' }}
            >
              VIEW FULL REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

