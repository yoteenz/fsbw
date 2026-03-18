import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { getAdminRevenue } from '../../../../utils/api';
import { isSupabaseConfigured } from '../../../../utils/supabase';
import { isAdminEmail } from '../../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { buildRevenueOrdersList, getDepletedInventory, getOrdersStats, getTotalStartingInventoryUnits } from '../../../../utils/adminRevenueStats';
import { pageActionButtonStyle } from '../../../../layouts/PageActionsBelowCard';

const sectionTitleStyle = { fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' as const };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e5e7eb' };
const labelStyle = { fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' as const };
const valueStyle = { fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' as const };
const valueRedStyle = { ...valueStyle, color: '#EB1C24' };

export default function AdminAccountingReport() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [breakdown, setBreakdown] = useState<{ month: string; value: number }[]>([]);

  const orders = buildRevenueOrdersList();
  const depleted = getDepletedInventory(orders);
  const stats = getOrdersStats(orders, totalRevenue);
  const totalStartingUnits = getTotalStartingInventoryUnits();

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
          title="ACCOUNTING"
          showBack
          onBack={() => navigate('/admin/revenue')}
          breadcrumbParentLabel="REVENUE"
          breadcrumbParentPath="/admin/revenue"
        />

        <div className="pb-8 px-4 max-w-md mx-auto">
          {/* Key metrics */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>KEY METRICS</h3>
            <div style={rowStyle}><span style={labelStyle}>Total revenue (YTD)</span><span style={valueRedStyle}>${totalRevenue.toLocaleString()}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Total orders</span><span style={valueStyle}>{totalOrders}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Unfulfilled orders</span><span style={valueStyle}>{stats.unfulfilledCount}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Inventory (available / starting)</span><span style={valueStyle}>{depleted.totalUnits} / {totalStartingUnits}</span></div>
          </div>

          {/* Revenue & earnings */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>REVENUE & EARNINGS</h3>
            {breakdown.length > 0 ? (
              breakdown.slice(0, 6).map((row) => (
                <div key={row.month} style={rowStyle}>
                  <span style={labelStyle}>{row.month}</span>
                  <span style={valueRedStyle}>${row.value.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <>
                <div style={rowStyle}><span style={labelStyle}>This month</span><span style={valueStyle}>—</span></div>
                <div style={rowStyle}><span style={labelStyle}>Last month</span><span style={valueStyle}>—</span></div>
              </>
            )}
          </div>

          {/* Expenses & overhead */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>EXPENSES & OVERHEAD</h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>TRACK MONTHLY AND KEEP RECEIPTS.</p>
            {[
              { label: 'Payroll / contractors', value: '—', note: 'W-2s, 1099s' },
              { label: 'Rent / utilities', value: '—' },
              { label: 'Inventory / COGS', value: '—' },
              { label: 'Marketing & ads', value: '—' },
              { label: 'Insurance & licenses', value: '—' },
              { label: 'Software & subscriptions', value: '—' },
              { label: 'Shipping & packaging', value: '—' },
              { label: 'Professional services', value: '—', note: 'Legal, accounting' },
            ].map((row) => (
              <div key={row.label} style={rowStyle}>
                <span style={labelStyle}>{row.label}{row.note ? ` (${row.note})` : ''}</span>
                <span style={valueStyle}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Budget & targets */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>BUDGET & TARGETS</h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>SET MONTHLY/QUARTERLY GOALS AND COMPARE TO ACTUAL.</p>
            {[
              { label: 'Revenue target (month)', value: '—' },
              { label: 'Revenue target (quarter)', value: '—' },
              { label: 'Expense cap (month)', value: '—' },
              { label: 'Profit margin target', value: '—' },
            ].map((row) => (
              <div key={row.label} style={rowStyle}>
                <span style={labelStyle}>{row.label}</span>
                <span style={valueStyle}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Tax preparation checklist */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>TAX PREPARATION CHECKLIST</h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>STAY AUDIT-READY AND MAXIMIZE DEDUCTIONS.</p>
            {[
              'KEEP ALL SALES & REVENUE RECORDS (INVOICES, BANK DEPOSITS)',
              'KEEP ALL EXPENSE RECEIPTS (OVER $75 OR ANY INVENTORY)',
              'TRACK MILEAGE & HOME OFFICE IF APPLICABLE',
              'QUARTERLY ESTIMATED TAX (APR, JUN, SEP, JAN)',
              'YEAR-END: INVENTORY COUNT, 1099S, W-2S',
              'DOCUMENT CHARITABLE DONATIONS & BUSINESS GIFTS',
              'SEPARATE BUSINESS VS PERSONAL ACCOUNTS',
            ].map((item, i) => (
              <div key={i} style={{ ...rowStyle, alignItems: 'flex-start' }}>
                <span style={{ ...labelStyle, flex: 1, fontWeight: 400 }}>{item}</span>
                <span style={{ ...valueStyle, color: '#808080', marginLeft: '8px' }}>☐</span>
              </div>
            ))}
          </div>

          {/* Receipts & documentation */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>RECEIPTS & DOCUMENTATION</h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>WHAT TO KEEP AND FOR HOW LONG.</p>
            {[
              { what: 'Sales invoices & payment records', keep: '7 years' },
              { what: 'Expense receipts (categorized)', keep: '7 years' },
              { what: 'Bank & credit card statements', keep: '7 years' },
              { what: 'Inventory purchase orders', keep: '7 years' },
              { what: 'Payroll records', keep: '7 years' },
              { what: 'Tax returns & supporting docs', keep: '7 years' },
            ].map((row) => (
              <div key={row.what} style={rowStyle}>
                <span style={labelStyle}>{row.what}</span>
                <span style={{ ...valueStyle, fontSize: '9px' }}>{row.keep}</span>
              </div>
            ))}
          </div>

          {/* Cash flow & runway */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>CASH FLOW & RUNWAY</h3>
            {[
              { label: 'Cash on hand', value: '—' },
              { label: 'Monthly burn (expenses)', value: '—' },
              { label: 'Runway (months)', value: '—' },
              { label: 'Outstanding receivables', value: '—' },
            ].map((row) => (
              <div key={row.label} style={rowStyle}>
                <span style={labelStyle}>{row.label}</span>
                <span style={valueStyle}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Maintenance & recurring */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>MAINTENANCE & RECURRING</h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>Don’t let renewals OR FILINGS SLIP.</p>
            {[
              { item: 'Business license renewal', freq: 'Annual' },
              { item: 'Insurance renewal', freq: 'Annual' },
              { item: 'Domain & hosting', freq: 'Annual' },
              { item: 'Software subscriptions', freq: 'Monthly/Annual' },
              { item: 'Quarterly tax deadlines', freq: 'Quarterly' },
            ].map((row) => (
              <div key={row.item} style={rowStyle}>
                <span style={labelStyle}>{row.item}</span>
                <span style={valueStyle}>{row.freq}</span>
              </div>
            ))}
          </div>

          {/* Scaling metrics */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>SCALING METRICS</h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>TRACK THESE TO GROW PROFITABLY.</p>
            {[
              { label: 'Gross margin %', value: '—' },
              { label: 'Net margin %', value: '—' },
              { label: 'Avg order value', value: totalOrders ? `$${Math.round(totalRevenue / totalOrders).toLocaleString()}` : '—' },
              { label: 'Customer acquisition cost', value: '—' },
              { label: 'Lifetime value (LTV)', value: '—' },
            ].map((row) => (
              <div key={row.label} style={rowStyle}>
                <span style={labelStyle}>{row.label}</span>
                <span style={valueStyle}>{row.value}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/revenue')}
            className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 bg-white"
            style={pageActionButtonStyle}
          >
            BACK TO REVENUE
          </button>
        </div>
      </div>
    </div>
  );
}
