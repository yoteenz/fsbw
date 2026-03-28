import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { getAdminRevenue } from '../../../../utils/api';
import { isSupabaseConfigured } from '../../../../utils/supabase';
import { isAdminEmail } from '../../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { buildRevenueOrdersList, getDepletedInventory, getOrdersStats, getTotalStartingInventoryUnits } from '../../../../utils/adminRevenueStats';
import { pageActionButtonStyle } from '../../../../layouts/PageActionsBelowCard';

const RECEIPTS_STORAGE_KEY = 'admin_accounting_receipts';

const sectionTitleStyle = { fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' as const };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #e5e7eb' };
const labelStyle = { fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' as const };
const valueStyle = { fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' as const };
const valueRedStyle = { ...valueStyle, color: '#EB1C24' };

function getQuarterKeys(): string[] {
  const y = new Date().getFullYear();
  return [`${y}-Q1`, `${y}-Q2`, `${y}-Q3`, `${y}-Q4`];
}

type ReceiptEntry = { id: string; dataUrl: string; fileName?: string; uploadedAt: string };

function loadReceiptsFromStorage(): Record<string, ReceiptEntry[]> {
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ReceiptEntry[]>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveReceiptsToStorage(receipts: Record<string, ReceiptEntry[]>): void {
  try {
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
  } catch {
    /* ignore */
  }
}

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

  const quarterKeys = getQuarterKeys();
  const [receiptsByQuarter, setReceiptsByQuarter] = useState<Record<string, ReceiptEntry[]>>(() => loadReceiptsFromStorage());
  const [selectedQuarter, setSelectedQuarter] = useState<string>(() => {
    const keys = getQuarterKeys();
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return keys[q - 1] ?? keys[0];
  });
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const addReceipt = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const entry: ReceiptEntry = { id: `receipt-${Date.now()}-${Math.random().toString(36).slice(2)}`, dataUrl, fileName: file.name, uploadedAt: new Date().toISOString() };
      setReceiptsByQuarter((prev) => {
        const list = [...(prev[selectedQuarter] ?? []), entry];
        const next = { ...prev, [selectedQuarter]: list };
        saveReceiptsToStorage(next);
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = (quarter: string, id: string) => {
    setReceiptsByQuarter((prev) => {
      const list = (prev[quarter] ?? []).filter((r) => r.id !== id);
      const next = list.length ? { ...prev, [quarter]: list } : { ...prev, [quarter]: [] };
      saveReceiptsToStorage(next);
      return next;
    });
  };

  const currentReceipts = receiptsByQuarter[selectedQuarter] ?? [];

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
          onBack={() => navigate('/admin/revenue?tab=OVERVIEW')}
          breadcrumbParentLabel="REVENUE"
          breadcrumbParentPath="/admin/revenue"
        />

        <div className="pb-8 px-4 max-w-md mx-auto">
          {/* Key metrics – IRS: gross receipts, COGS, gross profit */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>KEY METRICS</h3>
            <div style={rowStyle}><span style={labelStyle}>Total revenue / gross receipts (YTD)</span><span style={valueRedStyle}>${totalRevenue.toLocaleString()}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Cost of goods sold (COGS) YTD</span><span style={valueStyle}>—</span></div>
            <div style={rowStyle}><span style={labelStyle}>Gross profit (revenue − COGS)</span><span style={valueStyle}>—</span></div>
            <div style={rowStyle}><span style={labelStyle}>Total orders</span><span style={valueStyle}>{totalOrders}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Unfulfilled orders</span><span style={valueStyle}>{stats.unfulfilledCount}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Inventory (available / starting)</span><span style={valueStyle}>{depleted.totalUnits} / {totalStartingUnits}</span></div>
          </div>

          {/* Revenue & earnings – IRS: reconcile to 1099-K / payment processor */}
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4 mb-4" style={{ borderWidth: '1.3px' }}>
            <h3 style={sectionTitleStyle}>REVENUE & EARNINGS</h3>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>RECONCILE TO 1099-K / PAYMENT PROCESSOR STATEMENTS.</p>
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
            <div style={{ ...rowStyle, marginTop: '8px', borderTop: '1px solid #e5e7eb' }}><span style={labelStyle}>1099-K / processor total (YTD)</span><span style={valueStyle}>—</span></div>
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
              { label: 'Travel & mileage', value: '—', note: 'Log date, miles, purpose' },
              { label: 'Meals (50% deduct.)', value: '—', note: 'Business purpose required' },
              { label: 'Professional services', value: '—', note: 'Legal, accounting' },
              { label: 'Equipment & depreciation', value: '—', note: 'Asset log' },
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
              'KEEP DIGITAL RECEIPTS (USE RECEIPTS CARD BELOW)',
              'RETENTION: 3–7 YEARS (IRS); LONGER FOR ASSETS',
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

          {/* Receipts – upload quarterly; scan/photo like order-form; storage like affiliate tabs */}
          <div className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden mb-4" style={{ borderWidth: '1.3px' }}>
            <div className="flex items-center justify-between -mt-1 pb-1 px-5 pt-4" style={{ marginBottom: 0 }}>
              <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>RECEIPTS</h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#EB1C24" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="#EB1C24" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H15M9 16H15" stroke="#EB1C24" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />
            <div className="px-5 pb-4">
              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '12px', textTransform: 'uppercase' }}>UPLOAD QUARTERLY FOR TRACKING, ANALYSIS & DATA FACTORING.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {quarterKeys.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSelectedQuarter(q)}
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: selectedQuarter === q ? '#EB1C24' : '#808080',
                      border: 'none',
                      borderBottom: selectedQuarter === q ? '1px solid #EB1C24' : '1px solid transparent',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <input
                ref={receiptInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.type.startsWith('image/')) addReceipt(file);
                  e.target.value = '';
                }}
                style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                aria-hidden
              />
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => receiptInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); receiptInputRef.current?.click(); } }}
                  style={{
                    width: '100%',
                    minHeight: '36px',
                    padding: '8px',
                    border: '1.3px solid #000000',
                    fontFamily: '"Futura PT Book"',
                    fontSize: '11px',
                    backgroundColor: '#FFFFFF',
                    color: '#EB1C24',
                    boxSizing: 'border-box',
                    borderRadius: 0,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ padding: '4px 8px', border: '1px solid #808080', borderRadius: 0, backgroundColor: '#F5F5F5', color: '#000000', fontFamily: '"Futura PT Book"' }}>CHOOSE FILE</span>
                  <span style={{ marginLeft: '8px', color: '#808080', fontSize: '10px' }}>TAKE PHOTO, SCAN, OR CHOOSE FILE</span>
                </div>
              </div>
              {currentReceipts.length === 0 ? (
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', margin: 0, textTransform: 'uppercase' }}>NO RECEIPTS FOR {selectedQuarter}. UPLOAD ABOVE.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3" style={{ maxHeight: '240px', overflowY: 'auto', paddingTop: '2px' }}>
                  {currentReceipts.map((r) => (
                    <div key={r.id} style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff' }}>
                      <img src={r.dataUrl} alt={r.fileName ?? 'Receipt'} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '4px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
                          {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeReceipt(selectedQuarter, r.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontSize: '9px', textTransform: 'uppercase' }}
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/revenue?tab=OVERVIEW')}
            className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 bg-white"
            style={pageActionButtonStyle}
          >
            BACK TO OVERVIEW
          </button>
        </div>
      </div>
    </div>
  );
}
