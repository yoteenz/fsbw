import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminHeader from '../components/AdminHeader';
import BrandAlertsPanel from '../components/BrandAlertsPanel';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminBrand, getAdminAnalytics } from '../../../utils/api';
import { getSocialAnalyticsSummary } from '../../../utils/socialAnalytics';
import type { SocialPlatform, SocialSource } from '../../../utils/socialAnalytics';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import {
  appendBrandPromoCode,
  generateCodePrefix,
  loadBrandPromoCodes,
  updateBrandPromoCode,
  type BrandPromoCode,
} from '../../../utils/adminBrandCodes';

const BRAND_TABS = ['OVERVIEW', 'ALERTS', 'CODES', 'ANALYTICS'] as const;
const ANALYTICS_SUB_TABS = ['SUMMARY', 'BY PLATFORM', 'BY SOURCE'] as const;

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

const SOURCE_LABEL: Record<SocialSource, string> = {
  menu: 'Menu toggle',
  more_ways_to_earn: 'More ways to earn',
};

const defaultBrandMetrics = {
  retention: '94%',
  referralRate: '23%',
  repeatBookings: '78%',
  growthRate: '+15%',
  brandScore: 94,
  marketPenetration: '15%',
};

export default function AdminBrand() {
  useRequireAdminPageAccess();
  const [activeTab, setActiveTab] = useState<typeof BRAND_TABS[number]>('OVERVIEW');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<typeof ANALYTICS_SUB_TABS[number]>('SUMMARY');
  const [brandMetrics, setBrandMetrics] = useState(defaultBrandMetrics);
  const localSummary = getSocialAnalyticsSummary();
  const [analyticsSummary, setAnalyticsSummary] = useState(localSummary);

  const [promoCodes, setPromoCodes] = useState<BrandPromoCode[]>(() => loadBrandPromoCodes());
  const refreshCodes = useCallback(() => {
    setPromoCodes(loadBrandPromoCodes());
  }, []);

  const codesSummary = useMemo(() => {
    const active = promoCodes.filter((c) => c.active).length;
    const redemptions = promoCodes.reduce((sum, c) => sum + (c.uses ?? 0), 0);
    return { active, redemptions };
  }, [promoCodes]);

  const [alertsStats, setAlertsStats] = useState({ clientsWithNotifs: 0, totalSent: 0 });
  const onAlertsStats = useCallback((stats: { clientsWithNotifs: number; totalSent: number }) => {
    setAlertsStats(stats);
  }, []);

  const [codeKind, setCodeKind] = useState<BrandPromoCode['kind']>('gift');
  const [manualCode, setManualCode] = useState('');
  const [codeValue, setCodeValue] = useState('');
  const [codeMaxUses, setCodeMaxUses] = useState('');
  const [codeExpires, setCodeExpires] = useState('');
  const [codeNote, setCodeNote] = useState('');

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminBrand()
        .then((r) => {
          setBrandMetrics({
            retention: String(r.retention ?? defaultBrandMetrics.retention),
            referralRate: String(r.referralRate ?? defaultBrandMetrics.referralRate),
            repeatBookings: String(r.repeatBookings ?? defaultBrandMetrics.repeatBookings),
            growthRate: String(r.growthRate ?? defaultBrandMetrics.growthRate),
            brandScore: Number(r.brandScore) ?? defaultBrandMetrics.brandScore,
            marketPenetration: String(r.marketPenetration ?? defaultBrandMetrics.marketPenetration),
          });
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminAnalytics()
        .then((r) => {
          if (r && Number(r.total) > 0) {
            setAnalyticsSummary((prev) => ({
              total: r.total,
              bySource: r.bySource as Record<SocialSource, number>,
              byPlatform: r.byPlatform as Record<SocialPlatform, number>,
              byPlatformAndSource: r.byPlatformAndSource as Record<SocialPlatform, Record<SocialSource, number>>,
              recentEvents: prev.recentEvents,
            }));
          }
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
                    marginLeft: '6px',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  BRAND
                </h2>
                <svg width="15.5" height="15.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                  <path d="M3 4H4V18L9.58 8.33L15.59 11.8L19.21 5.54L20.07 6.04L15.96 13.17L9.95 9.7L4 20H20V21H3V4Z" fill="#EB1C24"/>
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Summary above tabs: analytics clicks, alerts usage, codes activity, or brand score */}
              {activeTab === 'ANALYTICS' ? (
                <div className="text-center py-4 px-5">
                  <p className="font-covered-by-your-grace text-4xl" style={{ color: '#EB1C24' }}>{analyticsSummary.total}</p>
                  <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>TOTAL CLICKS</p>
                </div>
              ) : activeTab === 'ALERTS' ? (
                <div className="grid grid-cols-2 gap-4 px-5 py-4">
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>{alertsStats.clientsWithNotifs}</p>
                    <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>CLIENTS (NOTIFS)</p>
                  </div>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>{alertsStats.totalSent}</p>
                    <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>NOTIFICATIONS SENT</p>
                  </div>
                </div>
              ) : activeTab === 'CODES' ? (
                <div className="grid grid-cols-2 gap-4 px-5 py-4">
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>{codesSummary.active}</p>
                    <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>ACTIVE CODES</p>
                  </div>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>{codesSummary.redemptions}</p>
                    <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>TOTAL REDEMPTIONS</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 px-5">
                  <p className="font-covered-by-your-grace text-4xl" style={{ color: '#EB1C24' }}>{brandMetrics.brandScore}%</p>
                  <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>OVERALL BRAND SCORE</p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {BRAND_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
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

              {/* Tab content */}
              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px', padding: '8px', paddingTop: '2px', boxSizing: 'border-box' }}>
                {activeTab === 'OVERVIEW' && (
                  <>
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
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '20px', marginBottom: '8px' }}>KEY METRICS</h3>
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
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '20px', marginBottom: '12px' }}>RECENT ACHIEVEMENTS</h3>
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
                {activeTab === 'ALERTS' && <BrandAlertsPanel onStatsChange={onAlertsStats} />}
                {activeTab === 'CODES' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '8px', marginBottom: '10px' }}>
                      CREATE CODE
                    </h3>
                    <div className="space-y-3 mb-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCodeKind('gift')}
                          className="flex-1 py-2 border"
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '10px',
                            borderColor: '#000',
                            borderWidth: codeKind === 'gift' ? '1.3px' : '1px',
                            color: codeKind === 'gift' ? '#EB1C24' : '#808080',
                            background: codeKind === 'gift' ? 'rgba(235,28,36,0.08)' : '#fff',
                          }}
                        >
                          GIFT CARD
                        </button>
                        <button
                          type="button"
                          onClick={() => setCodeKind('discount')}
                          className="flex-1 py-2 border"
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '10px',
                            borderColor: '#000',
                            borderWidth: codeKind === 'discount' ? '1.3px' : '1px',
                            color: codeKind === 'discount' ? '#EB1C24' : '#808080',
                            background: codeKind === 'discount' ? 'rgba(235,28,36,0.08)' : '#fff',
                          }}
                        >
                          DISCOUNT
                        </button>
                      </div>
                      <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', display: 'block' }}>
                        CODE (OPTIONAL — AUTO IF EMPTY)
                        <div className="flex gap-2 mt-1">
                          <input
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                            className="flex-1 border p-2"
                            style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                            placeholder="AUTO-GENERATE"
                          />
                          <button
                            type="button"
                            onClick={() => setManualCode(generateCodePrefix(codeKind))}
                            className="px-2 border border-black shrink-0"
                            style={{ fontFamily: '"Futura PT Book"', fontSize: '10px' }}
                          >
                            GEN
                          </button>
                        </div>
                      </label>
                      <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', display: 'block' }}>
                        {codeKind === 'gift' ? 'VALUE (E.G. 50 OR 50.00)' : 'VALUE (E.G. 15 FOR 15%)'}
                        <input
                          value={codeValue}
                          onChange={(e) => setCodeValue(e.target.value)}
                          className="mt-1 w-full border p-2"
                          style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                        />
                      </label>
                      <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', display: 'block' }}>
                        MAX USES (BLANK = UNLIMITED)
                        <input
                          value={codeMaxUses}
                          onChange={(e) => setCodeMaxUses(e.target.value.replace(/\D/g, ''))}
                          className="mt-1 w-full border p-2"
                          style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                        />
                      </label>
                      <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', display: 'block' }}>
                        EXPIRES (OPTIONAL)
                        <input
                          type="date"
                          value={codeExpires}
                          onChange={(e) => setCodeExpires(e.target.value)}
                          className="mt-1 w-full border p-2"
                          style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                        />
                      </label>
                      <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', display: 'block' }}>
                        NOTE (INTERNAL)
                        <input
                          value={codeNote}
                          onChange={(e) => setCodeNote(e.target.value.toUpperCase())}
                          className="mt-1 w-full border p-2"
                          style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const raw = codeValue.trim();
                          if (!raw) return;
                          const valueLabel =
                            codeKind === 'gift'
                              ? (raw.startsWith('$') ? raw : `$${raw}`)
                              : (raw.includes('%') ? raw : `${raw}%`);
                          const maxU = codeMaxUses.trim() ? parseInt(codeMaxUses, 10) : null;
                          const codeStr = (manualCode.trim() || generateCodePrefix(codeKind)).toUpperCase();
                          const row: BrandPromoCode = {
                            id: `code-${Date.now()}`,
                            kind: codeKind,
                            code: codeStr,
                            valueLabel,
                            maxUses: maxU != null && !Number.isNaN(maxU) ? maxU : null,
                            uses: 0,
                            expiresAt: codeExpires.trim() || null,
                            createdAt: new Date().toISOString(),
                            active: true,
                            note: codeNote.trim() || undefined,
                          };
                          appendBrandPromoCode(row);
                          setManualCode('');
                          setCodeValue('');
                          setCodeMaxUses('');
                          setCodeExpires('');
                          setCodeNote('');
                          refreshCodes();
                        }}
                        className="w-full py-2 border border-black"
                        style={{ ...pageActionButtonStyle, marginTop: '4px' }}
                      >
                        SAVE CODE
                      </button>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>TRACK USAGE</h3>
                    {promoCodes.length === 0 ? (
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>NO CODES YET.</p>
                    ) : (
                      <div className="space-y-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                        {promoCodes
                          .slice()
                          .reverse()
                          .map((c) => (
                            <div
                              key={c.id}
                              className="border border-gray-200 p-3"
                              style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', margin: 0 }}>
                                    {c.code}
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '4px 0 0 0' }}>
                                    {c.kind === 'gift' ? 'GIFT CARD' : 'DISCOUNT'} · {c.valueLabel}
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '4px 0 0 0' }}>
                                    USES: {c.uses}
                                    {c.maxUses != null ? ` / ${c.maxUses}` : ' / ∞'}
                                    {c.expiresAt ? ` · EXP ${c.expiresAt}` : ''}
                                  </p>
                                  {c.note && (
                                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '4px 0 0 0' }}>{c.note}</p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (c.maxUses != null && c.uses >= c.maxUses) return;
                                      updateBrandPromoCode(c.id, { uses: c.uses + 1 });
                                      refreshCodes();
                                    }}
                                    className="px-2 py-1 text-[10px] border"
                                    style={{ fontFamily: '"Futura PT Book"', borderColor: '#000' }}
                                  >
                                    +1 USE
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateBrandPromoCode(c.id, { active: !c.active });
                                      refreshCodes();
                                    }}
                                    className="px-2 py-1 text-[10px]"
                                    style={{
                                      fontFamily: '"Futura PT Book"',
                                      backgroundColor: c.active ? '#f3f4f6' : '#EB1C24',
                                      color: c.active ? '#000' : '#fff',
                                      border: '1px solid #000',
                                    }}
                                  >
                                    {c.active ? 'DEACTIVATE' : 'ACTIVATE'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'ANALYTICS' && (
                  <>
                    <div className="flex gap-2 mt-2 mb-3">
                      {ANALYTICS_SUB_TABS.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setAnalyticsSubTab(sub)}
                          className="flex-1 py-2 text-xs font-medium"
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            color: analyticsSubTab === sub ? '#EB1C24' : '#808080',
                            border: 'none',
                            borderBottom: analyticsSubTab === sub ? '1px solid #EB1C24' : '1px solid transparent',
                            background: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                    {analyticsSubTab === 'SUMMARY' && (
                      <>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>BY SOURCE</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>MENU TOGGLE</span>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.bySource.menu}</span>
                          </div>
                          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>MORE WAYS TO EARN</span>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.bySource.more_ways_to_earn}</span>
                          </div>
                        </div>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>RECENT CLICKS</h3>
                        {analyticsSummary.recentEvents.length === 0 ? (
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', margin: 0, textTransform: 'uppercase' }}>NO CLICKS RECORDED YET.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', padding: '8px', boxSizing: 'border-box' }}>
                            {analyticsSummary.recentEvents.slice(0, 10).map((evt, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontFamily: '"Futura PT Book"', color: '#000', padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                                <span style={{ fontWeight: '500' }}>{PLATFORM_LABEL[evt.platform]}</span>
                                <span style={{ color: '#808080' }}>{SOURCE_LABEL[evt.source]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {analyticsSubTab === 'BY PLATFORM' && (
                      <>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>CLICKS BY PLATFORM</h3>
                        <div className="space-y-2">
                          {(['instagram', 'twitter', 'facebook', 'tiktok'] as const).map((p) => (
                            <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.byPlatform[p]}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {analyticsSubTab === 'BY SOURCE' && (
                      <>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>MENU TOGGLE</h3>
                        <div className="space-y-2 mb-4">
                          {(['instagram', 'twitter', 'facebook'] as const).map((p) => (
                            <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.byPlatformAndSource[p].menu}</span>
                            </div>
                          ))}
                        </div>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>MORE WAYS TO EARN</h3>
                        <div className="space-y-2">
                          {(['instagram', 'twitter', 'facebook', 'tiktok'] as const).map((p) => (
                            <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.byPlatformAndSource[p].more_ways_to_earn}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                onClick={() => {}}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={pageActionButtonStyle}
              >
                EXPORT ANALYTICS
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}

