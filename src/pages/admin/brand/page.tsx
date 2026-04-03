import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import BrandAlertsPanel, { type BrandAlertsPanelHandle } from '../components/BrandAlertsPanel';
import BrandExpiresDatePicker from '../../../components/BrandExpiresDatePicker';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminBrand, getAdminAnalytics } from '../../../utils/api';
import { getSocialAnalyticsSummary } from '../../../utils/socialAnalytics';
import type { SocialPlatform, SocialSource } from '../../../utils/socialAnalytics';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import {
  appendBrandPromoCode,
  computeExpiresSpanCalendarDays,
  computeReactivationExpiryPatch,
  expiresAtFromDateInput,
  formatExpiresAtForDisplay,
  generateCodePrefix,
  loadBrandPromoCodes,
  sumBrandGeneratedDiscountUsd,
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
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof BRAND_TABS[number]>('OVERVIEW');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<typeof ANALYTICS_SUB_TABS[number]>('SUMMARY');
  const [brandMetrics, setBrandMetrics] = useState(defaultBrandMetrics);
  const localSummary = getSocialAnalyticsSummary();
  const [analyticsSummary, setAnalyticsSummary] = useState(localSummary);

  const [promoCodes, setPromoCodes] = useState<BrandPromoCode[]>(() => loadBrandPromoCodes());
  const refreshCodes = useCallback(() => {
    setPromoCodes(loadBrandPromoCodes());
  }, []);

  const [copiedPromoId, setCopiedPromoId] = useState<string | null>(null);
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current) clearTimeout(copyFeedbackTimeoutRef.current);
    };
  }, []);

  const [discountLedgerSeq, setDiscountLedgerSeq] = useState(0);
  useEffect(() => {
    const onLedger = () => setDiscountLedgerSeq((s) => s + 1);
    window.addEventListener('brandDiscountLedgerUpdated', onLedger);
    return () => window.removeEventListener('brandDiscountLedgerUpdated', onLedger);
  }, []);

  const codesSummary = useMemo(() => {
    const active = promoCodes.filter((c) => c.active).length;
    const discountsUsd = sumBrandGeneratedDiscountUsd();
    return { active, discountsUsd };
  }, [promoCodes, discountLedgerSeq]);

  const [alertsStats, setAlertsStats] = useState({ clientsWithNotifs: 0, totalSent: 0 });
  const onAlertsStats = useCallback((stats: { clientsWithNotifs: number; totalSent: number }) => {
    setAlertsStats(stats);
  }, []);
  const brandAlertsPanelRef = useRef<BrandAlertsPanelHandle>(null);
  const [alertsSendFooter, setAlertsSendFooter] = useState({
    disabled: true,
    label: 'SEND NOTIFICATION',
  });

  const [codeKind, setCodeKind] = useState<BrandPromoCode['kind']>('gift');
  const [giftManualCode, setGiftManualCode] = useState('');
  const [discountManualCode, setDiscountManualCode] = useState('');
  const [codeValue, setCodeValue] = useState('');
  const [codeMaxUses, setCodeMaxUses] = useState('');
  const [codeExpires, setCodeExpires] = useState('');
  const [codeNote, setCodeNote] = useState('');
  const [showCreateCodePanel, setShowCreateCodePanel] = useState(false);

  useEffect(() => {
    if (activeTab !== 'CODES') setShowCreateCodePanel(false);
  }, [activeTab]);

  useEffect(() => {
    const st = location.state as { openCreateCode?: boolean } | null | undefined;
    if (st?.openCreateCode) {
      setActiveTab('CODES');
      setShowCreateCodePanel(true);
      navigate('/admin/brand', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleSavePromoCode = useCallback(() => {
    const raw = codeValue.trim();
    if (!raw) return;
    const valueLabel =
      codeKind === 'gift'
        ? (raw.startsWith('$') ? raw : `$${raw}`)
        : (raw.includes('%') ? raw : `${raw}%`);
    const maxU = codeMaxUses.trim() ? parseInt(codeMaxUses, 10) : null;
    const manualForKind = codeKind === 'gift' ? giftManualCode : discountManualCode;
    const codeStr = (manualForKind.trim() || generateCodePrefix(codeKind)).toUpperCase();
    const createdAt = new Date().toISOString();
    const expiresAt = codeExpires.trim() ? expiresAtFromDateInput(codeExpires.trim()) : null;
    const row: BrandPromoCode = {
      id: `code-${Date.now()}`,
      kind: codeKind,
      code: codeStr,
      valueLabel,
      maxUses: maxU != null && !Number.isNaN(maxU) ? maxU : null,
      uses: 0,
      expiresAt,
      expiresSpanCalendarDays: computeExpiresSpanCalendarDays(createdAt, expiresAt) ?? undefined,
      createdAt,
      active: true,
      note: codeNote.trim() || undefined,
    };
    appendBrandPromoCode(row);
    setGiftManualCode('');
    setDiscountManualCode('');
    setCodeValue('');
    setCodeMaxUses('');
    setCodeExpires('');
    setCodeNote('');
    refreshCodes();
    setShowCreateCodePanel(false);
  }, [codeValue, codeKind, giftManualCode, discountManualCode, codeMaxUses, codeExpires, codeNote, refreshCodes]);

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
          if (!r) return;
          const recent = (r.recentEvents ?? []).filter(
            (e): e is typeof e & { platform: SocialPlatform; source: SocialSource } =>
              e != null &&
              typeof e.platform === 'string' &&
              typeof e.source === 'string' &&
              typeof e.timestamp === 'number'
          );
          setAnalyticsSummary({
            total: r.total,
            bySource: r.bySource as Record<SocialSource, number>,
            byPlatform: r.byPlatform as Record<SocialPlatform, number>,
            byPlatformAndSource: r.byPlatformAndSource as Record<SocialPlatform, Record<SocialSource, number>>,
            recentEvents: recent.map((e) => ({
              platform: e.platform as SocialPlatform,
              source: e.source as SocialSource,
              timestamp: e.timestamp,
            })),
          });
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
          title={activeTab === 'CODES' && showCreateCodePanel ? 'CREATE CODE' : 'BRAND'}
          showBack
          onBack={
            activeTab === 'CODES' && showCreateCodePanel
              ? () => setShowCreateCodePanel(false)
              : () => window.history.back()
          }
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {activeTab === 'CODES' ? (
              showCreateCodePanel ? (
                <>
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full overflow-hidden flex flex-col transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    minHeight: 'calc(100vh * 520 / 745 + 7px)',
                  }}
                >
                  <div className="shrink-0 px-5 pt-5">
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px' }}>
                      <h2
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          color: '#EB1C24',
                          fontSize: '12px',
                          fontWeight: '500',
                          margin: '0',
                          textTransform: 'uppercase',
                        }}
                      >
                        CREATE CODE
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowCreateCodePanel(false)}
                        aria-label="Close create code"
                        className="p-0 border-0 bg-transparent cursor-pointer shrink-0"
                        style={{ lineHeight: 0 }}
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt=""
                          style={{
                            width: '20px',
                            height: '20px',
                            flexShrink: 0,
                            objectFit: 'contain',
                            marginTop: '-2px',
                            display: 'block',
                            filter:
                              'invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 flex flex-col min-h-0 px-5" style={{ paddingBottom: '24px' }}>
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                    <div className="space-y-3 min-w-0 max-w-full">
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
                            backgroundColor: '#FFFFFF',
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
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          DISCOUNT
                        </button>
                      </div>
                      <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', display: 'block' }}>
                        <span style={{ display: 'block', marginBottom: '6px' }}>CODE (OPTIONAL — AUTO IF EMPTY)</span>
                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px 0', textTransform: 'none' }}>
                          SAVE USES THE ROW THAT MATCHES {codeKind === 'gift' ? 'GIFT CARD' : 'DISCOUNT'} ABOVE.
                        </p>
                        <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', display: 'block', color: codeKind === 'gift' ? '#EB1C24' : '#808080' }}>
                          GIFT CARD
                          <div className="flex gap-2 mt-1">
                            <input
                              value={giftManualCode}
                              onChange={(e) => setGiftManualCode(e.target.value.toUpperCase())}
                              className="flex-1 border p-2"
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                            />
                            <button
                              type="button"
                              onClick={() => setGiftManualCode(generateCodePrefix('gift'))}
                              className="px-2 border border-black shrink-0"
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '10px' }}
                            >
                              GEN
                            </button>
                          </div>
                        </label>
                        <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', display: 'block', marginTop: '10px', color: codeKind === 'discount' ? '#EB1C24' : '#808080' }}>
                          DISCOUNT
                          <div className="flex gap-2 mt-1">
                            <input
                              value={discountManualCode}
                              onChange={(e) => setDiscountManualCode(e.target.value.toUpperCase())}
                              className="flex-1 border p-2"
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                            />
                            <button
                              type="button"
                              onClick={() => setDiscountManualCode(generateCodePrefix('discount'))}
                              className="px-2 border border-black shrink-0"
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '10px' }}
                            >
                              GEN
                            </button>
                          </div>
                        </label>
                      </div>
                      <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', display: 'block' }}>
                        {codeKind === 'gift' ? 'VALUE (E.G. $50 OR $50.00)' : 'VALUE (E.G. 15 FOR 15%)'}
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
                      <label
                        className="min-w-0 max-w-full block"
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '10px',
                          width: '100%',
                        }}
                      >
                        EXPIRES (OPTIONAL)
                        <div className="mt-1 w-full min-w-0 max-w-full overflow-visible">
                          <BrandExpiresDatePicker inline value={codeExpires} onChange={setCodeExpires} />
                        </div>
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
                    </div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSavePromoCode}
                    className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    SAVE CODE
                  </button>
                </div>
                </>
              ) : (
                <>
                <div
                  className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden flex flex-col"
                  style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 px-5 pt-4 shrink-0" style={{ marginBottom: 0 }}>
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

                  <div className="grid grid-cols-2 gap-4 px-5 py-4 shrink-0">
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBottom: '10px',
                      }}
                    >
                      <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>{codesSummary.active}</p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>ACTIVE CODES</p>
                    </div>
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBottom: '10px',
                      }}
                    >
                      <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>
                        $
                        {codesSummary.discountsUsd.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>DISCOUNTS</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-[14px] px-5 shrink-0">
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

                  <div className="flex-1 flex flex-col min-h-0 px-5 pb-4 overflow-hidden" style={{ paddingTop: '12px' }}>
                  <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '0', marginBottom: '8px', flexShrink: 0 }}>TRACK USAGE</h3>
                  {promoCodes.length === 0 ? (
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>NO CODES YET.</p>
                  ) : (
                    <div className="flex-1 min-h-0 flex flex-col min-h-0" style={{ paddingBottom: '24px' }}>
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
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
                                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '4px 0 0 0', textTransform: 'uppercase' }}>
                                  {c.kind === 'gift' ? 'GIFT CARD' : 'DISCOUNT'} · {c.valueLabel}
                                </p>
                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '4px 0 0 0' }}>
                                  USES: {c.uses}
                                  {c.maxUses != null ? ` / ${c.maxUses}` : ' / ∞'}
                                  {c.expiresAt ? ` · ${formatExpiresAtForDisplay(c.expiresAt)}` : ''}
                                </p>
                                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '6px 0 0 0', textTransform: 'uppercase' }}>
                                  STATUS:{' '}
                                  {!c.active
                                    ? 'INACTIVE'
                                    : c.kind === 'gift'
                                      ? c.maxUses != null
                                        ? c.uses >= c.maxUses
                                          ? 'REDEEMED'
                                          : c.uses > 0
                                            ? `${c.uses}/${c.maxUses} REDEEMED`
                                            : 'ACTIVE'
                                        : 'ACTIVE'
                                      : c.maxUses != null && c.uses >= c.maxUses
                                        ? 'MAX USES REACHED'
                                        : c.maxUses != null && c.uses > 0
                                          ? `${c.uses}/${c.maxUses} USED`
                                          : 'ACTIVE'}
                                </p>
                                {c.note && (
                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '4px 0 0 0' }}>{c.note}</p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const text = c.code;
                                    let copied = false;
                                    try {
                                      await navigator.clipboard.writeText(text);
                                      copied = true;
                                    } catch {
                                      try {
                                        const ta = document.createElement('textarea');
                                        ta.value = text;
                                        ta.style.position = 'fixed';
                                        ta.style.left = '-9999px';
                                        document.body.appendChild(ta);
                                        ta.select();
                                        copied = document.execCommand('copy');
                                        document.body.removeChild(ta);
                                      } catch {
                                        /* ignore */
                                      }
                                    }
                                    if (!copied) return;
                                    if (copyFeedbackTimeoutRef.current) {
                                      clearTimeout(copyFeedbackTimeoutRef.current);
                                    }
                                    setCopiedPromoId(c.id);
                                    copyFeedbackTimeoutRef.current = setTimeout(() => {
                                      setCopiedPromoId(null);
                                      copyFeedbackTimeoutRef.current = null;
                                    }, 2000);
                                  }}
                                  className="border"
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '8px',
                                    padding: '3px 6px',
                                    borderColor: '#000',
                                    color: '#EB1C24',
                                    textTransform: 'uppercase',
                                    borderWidth: '1px',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {copiedPromoId === c.id ? 'COPIED' : 'COPY'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBrandPromoCode(c.id, { uses: 0 });
                                    refreshCodes();
                                  }}
                                  className="border"
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '8px',
                                    padding: '3px 6px',
                                    borderColor: '#000',
                                    color: '#EB1C24',
                                    textTransform: 'uppercase',
                                    borderWidth: '1px',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  RESET
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (c.active) {
                                      updateBrandPromoCode(c.id, { active: false });
                                    } else {
                                      const expiryPatch = computeReactivationExpiryPatch(c);
                                      updateBrandPromoCode(c.id, {
                                        active: true,
                                        ...(expiryPatch ?? {}),
                                      });
                                    }
                                    refreshCodes();
                                  }}
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '8px',
                                    padding: '3px 6px',
                                    backgroundColor: '#FFFFFF',
                                    color: '#EB1C24',
                                    border: '1px solid #000',
                                    textTransform: 'uppercase',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {c.active ? 'DEACTIVATE' : 'ACTIVATE'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    </div>
                  )}
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateCodePanel(true)}
                    className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    CREATE CODE
                  </button>
                </div>
              </>
            )
            ) : (
            <>
            {/* Main card (non-CODES tabs) */}
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex items-center justify-between -mt-1 pb-1 px-5 pt-4" style={{ marginBottom: 0 }}>
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

              {/* Summary above tabs: analytics clicks, alerts usage, or brand score */}
              {activeTab === 'ANALYTICS' ? (
                <div className="text-center py-4 px-5">
                  <p className="font-covered-by-your-grace text-4xl" style={{ color: '#EB1C24' }}>{analyticsSummary.total}</p>
                  <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>TOTAL CLICKS</p>
                </div>
              ) : activeTab === 'ALERTS' ? (
                <div className="grid grid-cols-2 gap-4 px-5 py-4">
                  <div
                    className="text-center py-3"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      borderRadius: '4px',
                      height: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      paddingBottom: '10px',
                    }}
                  >
                    <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>{alertsStats.clientsWithNotifs}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>CLIENTS (NOTIFS)</p>
                  </div>
                  <div
                    className="text-center py-3"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      borderRadius: '4px',
                      height: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      paddingBottom: '10px',
                    }}
                  >
                    <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>{alertsStats.totalSent}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>NOTIFICATIONS SENT</p>
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

              {/* Tab content – padding below scroll viewport (above card bottom) */}
              <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                <div
                  className="overflow-y-auto overflow-x-hidden"
                  style={{
                    maxHeight: '380px',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                {activeTab === 'OVERVIEW' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '16px', marginBottom: '8px' }}>KEY METRICS</h3>
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
                {activeTab === 'ALERTS' && (
                  <BrandAlertsPanel
                    ref={brandAlertsPanelRef}
                    onStatsChange={onAlertsStats}
                    onSendFooterState={setAlertsSendFooter}
                  />
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
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              maxHeight: '140px',
                              overflowY: 'auto',
                              paddingTop: '6px',
                              paddingBottom: '6px',
                              boxSizing: 'border-box',
                            }}
                          >
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
            </div>
            </>
            )}

            {activeTab !== 'CODES' &&
              (activeTab === 'ALERTS' ? (
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => void brandAlertsPanelRef.current?.sendNotification()}
                    disabled={alertsSendFooter.disabled}
                    className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={pageActionButtonStyle}
                  >
                    {alertsSendFooter.label}
                  </button>
                </div>
              ) : (
                <PageActionsBelowCard>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(analyticsSummary, null, 2)], {
                        type: 'application/json',
                      });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `brand-analytics-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                    className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    EXPORT ANALYTICS
                  </button>
                </PageActionsBelowCard>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

