import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSpecialOffer, { type SpecialOfferActionsRef } from '../special-offer/page';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminClients, getAdminNotifications, postAdminNotification } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail, isAyoteenzAdminAccount } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { isClientBlocked } from '../../../utils/blockedClients';
import { getMockClientsForAyoteenz } from '../clients/page';

const MARKETING_TABS = ['AFFILIATE', 'CHALLENGES', 'OFFERS', 'ALERTS'] as const;

/** Alert header (reason category) for quick-jump when sending. */
const ALERT_HEADERS = ['ORDER', 'TIER', 'MEMBERSHIP', 'SALE', 'BOOKING', 'REWARDS', 'CUSTOM'] as const;
type AlertHeader = typeof ALERT_HEADERS[number];

/** Topics per header – shown in topic dropdown. Last option is always Custom. */
const TOPICS_BY_HEADER: Record<AlertHeader, readonly string[]> = {
  ORDER: ['DELAYS', 'UPGRADES', 'TRACKING NUMBER', 'MESSAGE / EMAIL', 'CUSTOM'],
  TIER: ['TIER CHANGE', 'UPGRADE ELIGIBLE', 'BENEFITS', 'CUSTOM'],
  MEMBERSHIP: ['RENEWAL', 'PAYMENT', 'CHANGE', 'CUSTOM'],
  SALE: ['SECRET SALE', 'PERSONAL DISCOUNT CODE', 'FLASH SALE', 'CUSTOM'],
  BOOKING: ['CONFIRMATION', 'RESCHEDULE', 'REMINDER', 'CUSTOM'],
  REWARDS: ['POINTS', 'VOUCHER', 'REDEMPTION', 'CUSTOM'],
  CUSTOM: ['CUSTOM'],
};

type NotifEntry = { userId: string; items: Array<{ id?: string; text?: string; read?: boolean; createdAt?: string }>; updatedAt?: string };

// Per-tab panel labels (values can be wired to API later)
const TAB_PANEL_LABELS: Record<typeof MARKETING_TABS[number], { left: string; right: string }> = {
  AFFILIATE: { left: 'CONTENT', right: 'POINTS' },
  CHALLENGES: { left: 'REWARDS', right: 'ORDERS' },
  OFFERS: { left: 'SALES', right: 'ORDERS' },
  ALERTS: { left: 'CLIENTS', right: 'SENT' },
};

/** Same client list as overview: API + mock merge, dedupe by email, filter blocked. */
function buildClientListFromOverview(
  apiClients: Array<Record<string, unknown>>,
  currentUser: { email?: string } | null
): Array<{ id?: string; email?: string; firstName?: string; lastName?: string }> {
  const norm = (e: string) => (e || '').trim().toLowerCase();
  const dedupe = (list: any[]) => {
    const seen = new Set<string>();
    return list.filter((u: any) => {
      const e = norm(u.email || '');
      if (seen.has(e)) return false;
      seen.add(e);
      return true;
    });
  };
  const list = Array.isArray(apiClients) ? apiClients : [];
  if (list.length > 0) {
    let fromApi = dedupe(list as any[]);
    const mockClients = getMockClientsForAyoteenz();
    const mockByEmail = new Map(mockClients.map((m: any) => [norm(m.email || ''), m]));
    const existingEmails = new Set(fromApi.map((u: any) => norm(u.email || '')));
    const toAdd = mockClients.filter((m: any) => !existingEmails.has(norm(m.email || '')));
    fromApi = fromApi.map((u: any) => {
      const fresh = mockByEmail.get(norm(u.email || ''));
      return fresh ? { ...u, ...fresh } : u;
    });
    if (toAdd.length > 0) fromApi = [...fromApi, ...toAdd];
    return fromApi.filter((u: any) => !isClientBlocked(u));
  }
  let fallback = list as any[];
  try {
    const localReg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    fallback = dedupe(Array.isArray(localReg) ? localReg : []);
    if (currentUser && isAyoteenzAdminAccount(currentUser)) {
      const mockClients = getMockClientsForAyoteenz();
      const mockByEmail = new Map(mockClients.map((m: any) => [norm(m.email || ''), m]));
      const existingFallback = new Set(fallback.map((u: any) => norm(u.email || '')));
      const toAddMock = mockClients.filter((m: any) => !existingFallback.has(norm(m.email || '')));
      fallback = fallback.map((u: any) => {
        const fresh = mockByEmail.get(norm(u.email || ''));
        return fresh ? { ...u, ...fresh } : u;
      });
      if (toAddMock.length > 0) fallback = [...fallback, ...toAddMock];
    }
  } catch (_) {}
  return fallback.filter((u: any) => !isClientBlocked(u));
}

export default function AdminMarketing() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const specialOfferRef = useRef<SpecialOfferActionsRef>(null);
  const [activeTab, setActiveTab] = useState<typeof MARKETING_TABS[number]>('AFFILIATE');

  // Messages (notifications) state
  const [notifList, setNotifList] = useState<NotifEntry[]>([]);
  const [clients, setClients] = useState<Array<{ id?: string; email?: string; firstName?: string; lastName?: string }>>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedHeader, setSelectedHeader] = useState<AlertHeader>('ORDER');
  const [selectedTopic, setSelectedTopic] = useState<string>('DELAYS');
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [customHeaderText, setCustomHeaderText] = useState('');
  const [customTopicText, setCustomTopicText] = useState('');
  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    const isAlertsTab = activeTab === 'ALERTS';
    if (!isAlertsTab || !currentUser?.email || !isAdminEmail(currentUser.email) || !isSupabaseConfigured()) {
      return;
    }
    setLoadingNotifs(true);
    Promise.all([getAdminNotifications(), getAdminClients()])
      .then(([notifs, res]) => {
        setNotifList(Array.isArray(notifs) ? (notifs as NotifEntry[]) : []);
        const apiList = res?.clients ?? [];
        const clientList = buildClientListFromOverview(
          Array.isArray(apiList) ? apiList : [],
          currentUser
        );
        setClients(clientList);
      })
      .catch(() => {
        setNotifList([]);
        const currentUserFallback: { email?: string } | null = (() => {
          try {
            const raw = localStorage.getItem('currentUser');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();
        setClients(buildClientListFromOverview([], currentUserFallback));
      })
      .finally(() => setLoadingNotifs(false));
  }, [activeTab]);

  const handleSendNotif = async () => {
    if (selectedUserIds.length === 0 || !message.trim()) {
      setFeedback({ type: 'error', msg: 'Select at least one client and enter a message.' });
      return;
    }
    const topics = TOPICS_BY_HEADER[selectedHeader];
    const topic = topics.includes(selectedTopic) ? selectedTopic : topics[0];
    const headerPart = selectedHeader === 'CUSTOM' ? (customHeaderText.trim() || 'CUSTOM') : selectedHeader;
    const topicPart = topic === 'CUSTOM' ? (customTopicText.trim() || 'CUSTOM') : topic;
    const topicLabel = topicPart && topicPart !== 'CUSTOM' ? `${headerPart} · ${topicPart}` : headerPart;
    const fullMessage = `[${topicLabel}] ` + message.trim();
    setSending(true);
    setFeedback(null);
    try {
      for (let i = 0; i < selectedUserIds.length; i++) {
        await postAdminNotification(selectedUserIds[i], fullMessage);
      }
      setFeedback({ type: 'success', msg: selectedUserIds.length === 1 ? 'Notification sent.' : `Notification sent to ${selectedUserIds.length} clients.` });
      setMessage('');
      const updated = await getAdminNotifications();
      setNotifList(Array.isArray(updated) ? (updated as NotifEntry[]) : []);
    } catch (e) {
      setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Send failed' });
    } finally {
      setSending(false);
    }
  };

  const panelLabels = TAB_PANEL_LABELS[activeTab];
  const panelValues = (() => {
    if (activeTab === 'ALERTS') {
      const clientsReceived = notifList.length;
      const totalSent = notifList.reduce((sum, n) => sum + (n.items?.length ?? 0), 0);
      return { left: clientsReceived, right: totalSent };
    }
    return { left: 0, right: 0 };
  })();
  const firstSelectedId = selectedUserIds[0] ?? '';
  const selectedClient = clients.find((c) => (c as { id?: string }).id === firstSelectedId);
  const selectedNotifs = notifList.find((n) => n.userId === firstSelectedId)?.items ?? [];
  const topicOptions = TOPICS_BY_HEADER[selectedHeader];
  const isTopicValid = topicOptions.includes(selectedTopic);
  const effectiveTopic = isTopicValid ? selectedTopic : topicOptions[0];
  const previewHeaderPart = selectedHeader === 'CUSTOM' ? (customHeaderText.trim() || 'CUSTOM') : selectedHeader;
  const previewTopicPart = effectiveTopic === 'CUSTOM' ? (customTopicText.trim() || 'CUSTOM') : effectiveTopic;
  const previewTopicLabel = previewTopicPart && previewTopicPart !== 'CUSTOM' ? `${previewHeaderPart} · ${previewTopicPart}` : previewHeaderPart;
  const previewFullMessage = message.trim() ? `[${previewTopicLabel}] ${message.trim()}` : '';

  useEffect(() => {
    if (!topicOptions.includes(selectedTopic)) {
      setSelectedTopic(topicOptions[0]);
    }
  }, [selectedHeader]);

  const getClientLabel = (c: { id?: string; email?: string; firstName?: string; lastName?: string }) => {
    const email = (c.email || '').trim();
    const name = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
    return name ? `${email} (${name})` : email || '—';
  };
  const filteredClients = (() => {
    const q = (clientSearchQuery || '').trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => getClientLabel(c as any).toLowerCase().includes(q));
  })();

  const clientDropdownPortal = showClientDropdown && typeof document !== 'undefined' && document.body && createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex: 1000000000 }}
      onClick={() => { setShowClientDropdown(false); setClientSearchQuery(''); }}
      aria-hidden="true"
    >
      <div
        className="bg-white border border-black shadow-lg flex flex-col"
        style={{
          position: 'fixed',
          top: '50px',
          bottom: '24px',
          left: '12px',
          right: '12px',
          borderWidth: '0.8px',
          zIndex: 1000000001,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <input
            type="text"
            value={clientSearchQuery}
            onChange={(e) => setClientSearchQuery(e.target.value.toUpperCase())}
            placeholder="TYPE TO SEARCH..."
            data-font="futura-pt-book"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1.3px solid #EB1C24',
              borderRadius: 0,
              fontFamily: '"Futura PT Book", Futura, sans-serif',
              fontSize: '11px',
              color: '#EB1C24',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
              outline: 'none',
              textTransform: 'uppercase',
            }}
          />
        </div>
        <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
          {filteredClients.map((c) => {
            const id = (c as { id?: string }).id || '';
            const isSelected = selectedUserIds.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUserIds((prev) => (isSelected ? prev.filter((i) => i !== id) : [...prev, id]));
                }}
                className="w-full text-left px-3 py-2 uppercase hover:bg-gray-100 transition-colors"
                style={{ fontFamily: '"Futura PT Book", Futura, sans-serif', color: '#000', fontWeight: 400, fontSize: '11px', backgroundColor: isSelected ? '#f3f4f6' : undefined }}
              >
                {getClientLabel(c as any)}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
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
          title="MARKETING"
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
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
                  MARKETING
                </h2>
                <svg width="14.5" height="14.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                  <path d="M3.6845 14.4179L19.062 11.6599L21.75 7.08838L17.6275 4.10938L2.25 6.86687L3.6845 14.4179Z" stroke="#EB1C24" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.24707 14.1354L9.24557 19.8919L21.0066 12.0269L21.7501 7.08594" stroke="#EB1C24" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.6699 7.82812C19.877 7.82812 20.0449 7.66023 20.0449 7.45312C20.0449 7.24602 19.877 7.07812 19.6699 7.07812C19.4628 7.07812 19.2949 7.24602 19.2949 7.45312C19.2949 7.66023 19.4628 7.82812 19.6699 7.82812Z" fill="#EB1C24"/>
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Stats banner: tab-specific labels and values */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{panelValues.left.toLocaleString()}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>{panelLabels.left}</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{panelValues.right.toLocaleString()}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>{panelLabels.right}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {MARKETING_TABS.map((tab) => (
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

              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px', marginTop: '16px' }}>
                {activeTab === 'AFFILIATE' && (
                  <div className="py-4">
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>
                      Affiliate program stats and settings. Content tracks photos and videos submitted and approved from the account affiliate page; points show total earned per client. Both appear above.
                    </p>
                  </div>
                )}

                {activeTab === 'CHALLENGES' && (
                  <div className="py-4">
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>
                      Slay Challenge and other campaigns. Rewards claimed (vouchers, points, boosts, discounts, etc.) and orders counted toward tier completion for clients who started a challenge appear above.
                    </p>
                  </div>
                )}

                {activeTab === 'OFFERS' && (
                  <div className="py-2">
                    <AdminSpecialOffer ref={specialOfferRef} embedded />
                  </div>
                )}

                {activeTab === 'ALERTS' && (
                  <div className="py-2">
                    {feedback && (
                      <div
                        className="mb-3 px-3 py-2 text-sm"
                        style={{
                          backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: feedback.type === 'success' ? '#166534' : '#b91c1c',
                        }}
                      >
                        {feedback.msg}
                      </div>
                    )}
                    {loadingNotifs ? (
                      <p className="text-gray-500 text-sm">Loading...</p>
                    ) : (
                      <>
                        <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>HEADER</p>
                        <div className="relative" style={{ marginBottom: '12px' }}>
                          {selectedHeader === 'CUSTOM' ? (
                            <div className="flex items-stretch" style={{ gap: '6px' }}>
                              <input
                                type="text"
                                value={customHeaderText}
                                onChange={(e) => setCustomHeaderText(e.target.value.toUpperCase())}
                                placeholder="ENTER CUSTOM HEADER..."
                                data-font="futura-pt-book"
                                className="flex-1"
                                style={{
                                  height: '36px',
                                  padding: '8px 12px',
                                  border: '0.8px solid #000000',
                                  borderRadius: 0,
                                  fontFamily: '"Futura PT Book", Futura, sans-serif',
                                  fontSize: '11px',
                                  fontWeight: 400,
                                  color: '#EB1C24',
                                  backgroundColor: '#FFFFFF',
                                  boxSizing: 'border-box',
                                  textTransform: 'uppercase',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => { setShowHeaderDropdown((v) => !v); setShowTopicDropdown(false); }}
                                style={{ width: '36px', height: '36px', border: '0.8px solid #000000', borderRadius: 0, background: '#fff', cursor: 'pointer', color: '#EB1C24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                aria-label="Change header"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showHeaderDropdown ? 'rotate(180deg) translateX(16px)' : 'translateX(16px)' }}>
                                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              {showHeaderDropdown && (
                                <>
                                  <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowHeaderDropdown(false)} />
                                  <div className="absolute left-0 z-20 py-1 bg-white border border-black shadow-lg" style={{ borderWidth: '0.8px', marginTop: '7px', maxHeight: '220px', overflowY: 'auto', left: 0, right: 0 }}>
                                    {ALERT_HEADERS.map((h) => (
                                      <button
                                        key={h}
                                        type="button"
                                        onClick={() => { setSelectedHeader(h); setShowHeaderDropdown(false); }}
                                        className="w-full text-left px-3 py-2 uppercase hover:bg-gray-100 transition-colors"
                                        style={{ fontFamily: '"Futura PT Book", Futura, sans-serif', color: '#000', fontWeight: 400, fontSize: '11px' }}
                                      >
                                        {h}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => { setShowHeaderDropdown((v) => !v); setShowTopicDropdown(false); }}
                                data-font="futura-pt-book"
                                style={{
                                  width: '100%',
                                  height: '36px',
                                  padding: '8px 32px 8px 12px',
                                  border: '0.8px solid #000000',
                                  fontFamily: '"Futura PT Book", Futura, sans-serif',
                                  fontSize: '11px',
                                  fontWeight: 400,
                                  color: '#000000',
                                  backgroundColor: '#FFFFFF',
                                  boxSizing: 'border-box',
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  borderRadius: 0,
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span style={{ fontFamily: '"Futura PT Book", Futura, sans-serif' }}>{selectedHeader}</span>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: showHeaderDropdown ? 'rotate(180deg) translateX(16px)' : 'translateX(16px)', color: '#EB1C24', marginLeft: '24px' }}>
                                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              {showHeaderDropdown && (
                                <>
                                  <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowHeaderDropdown(false)} />
                                  <div className="absolute left-0 right-0 z-20 py-1 bg-white border border-black shadow-lg" style={{ borderWidth: '0.8px', marginTop: '7px', maxHeight: '220px', overflowY: 'auto' }}>
                                    {ALERT_HEADERS.map((h) => (
                                      <button
                                        key={h}
                                        type="button"
                                        onClick={() => { setSelectedHeader(h); setShowHeaderDropdown(false); }}
                                        className="w-full text-left px-3 py-2 uppercase hover:bg-gray-100 transition-colors"
                                        style={{ fontFamily: '"Futura PT Book", Futura, sans-serif', color: '#000', fontWeight: 400, fontSize: '11px' }}
                                      >
                                        {h}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>TOPIC</p>
                        <div className="relative" style={{ marginBottom: '12px' }}>
                          {effectiveTopic === 'CUSTOM' ? (
                            <div className="flex items-stretch" style={{ gap: '6px' }}>
                              <input
                                type="text"
                                value={customTopicText}
                                onChange={(e) => setCustomTopicText(e.target.value.toUpperCase())}
                                placeholder="ENTER CUSTOM TOPIC..."
                                data-font="futura-pt-book"
                                className="flex-1"
                                style={{
                                  height: '36px',
                                  padding: '8px 12px',
                                  border: '0.8px solid #000000',
                                  borderRadius: 0,
                                  fontFamily: '"Futura PT Book", Futura, sans-serif',
                                  fontSize: '11px',
                                  fontWeight: 400,
                                  color: '#EB1C24',
                                  backgroundColor: '#FFFFFF',
                                  boxSizing: 'border-box',
                                  textTransform: 'uppercase',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => { setShowTopicDropdown((v) => !v); setShowHeaderDropdown(false); }}
                                style={{ width: '36px', height: '36px', border: '0.8px solid #000000', borderRadius: 0, background: '#fff', cursor: 'pointer', color: '#EB1C24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                aria-label="Change topic"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showTopicDropdown ? 'rotate(180deg) translateX(16px)' : 'translateX(16px)' }}>
                                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              {showTopicDropdown && (
                                <>
                                  <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowTopicDropdown(false)} />
                                  <div className="absolute left-0 z-20 py-1 bg-white border border-black shadow-lg" style={{ borderWidth: '0.8px', marginTop: '7px', maxHeight: '220px', overflowY: 'auto', left: 0, right: 0 }}>
                                    {topicOptions.map((t) => (
                                      <button
                                        key={t}
                                        type="button"
                                        onClick={() => { setSelectedTopic(t); setShowTopicDropdown(false); }}
                                        className="w-full text-left px-3 py-2 uppercase hover:bg-gray-100 transition-colors"
                                        style={{ fontFamily: '"Futura PT Book", Futura, sans-serif', color: '#000', fontWeight: 400, fontSize: '11px' }}
                                      >
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => { setShowTopicDropdown((v) => !v); setShowHeaderDropdown(false); }}
                                data-font="futura-pt-book"
                                style={{
                                  width: '100%',
                                  height: '36px',
                                  padding: '8px 32px 8px 12px',
                                  border: '0.8px solid #000000',
                                  fontFamily: '"Futura PT Book", Futura, sans-serif',
                                  fontSize: '11px',
                                  fontWeight: 400,
                                  color: '#000000',
                                  backgroundColor: '#FFFFFF',
                                  boxSizing: 'border-box',
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  borderRadius: 0,
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span style={{ fontFamily: '"Futura PT Book", Futura, sans-serif' }}>{effectiveTopic}</span>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ transform: showTopicDropdown ? 'rotate(180deg) translateX(16px)' : 'translateX(16px)', color: '#EB1C24', marginLeft: '24px' }}>
                                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              {showTopicDropdown && (
                                <>
                                  <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowTopicDropdown(false)} />
                                  <div className="absolute left-0 right-0 z-20 py-1 bg-white border border-black shadow-lg" style={{ borderWidth: '0.8px', marginTop: '7px', maxHeight: '220px', overflowY: 'auto' }}>
                                    {topicOptions.map((t) => (
                                      <button
                                        key={t}
                                        type="button"
                                        onClick={() => { setSelectedTopic(t); setShowTopicDropdown(false); }}
                                        className="w-full text-left px-3 py-2 uppercase hover:bg-gray-100 transition-colors"
                                        style={{ fontFamily: '"Futura PT Book", Futura, sans-serif', color: '#000', fontWeight: 400, fontSize: '11px' }}
                                      >
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        {selectedUserIds.length > 0 && (
                          <div className="flex flex-wrap gap-2" style={{ marginBottom: '8px' }}>
                            {selectedUserIds.map((id) => {
                              const c = clients.find((x) => (x as { id?: string }).id === id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 px-2 py-1 border border-black"
                                  style={{ borderWidth: '1.3px', fontFamily: '"Futura PT Book", Futura, sans-serif', fontSize: '10px', backgroundColor: '#fff' }}
                                >
                                  {c ? getClientLabel(c as any) : id}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUserIds((prev) => prev.filter((i) => i !== id))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#EB1C24', marginLeft: '4px' }}
                                    aria-label="Remove"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="relative" style={{ marginBottom: '12px' }}>
                          <button
                            type="button"
                            onClick={() => { setShowClientDropdown((v) => !v); setShowHeaderDropdown(false); setShowTopicDropdown(false); }}
                            data-font="futura-pt-book"
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '8px 32px 8px 12px',
                              border: '0.8px solid #000000',
                              fontFamily: '"Futura PT Book", Futura, sans-serif',
                              fontSize: '11px',
                              fontWeight: 400,
                              color: '#000000',
                              backgroundColor: '#FFFFFF',
                              boxSizing: 'border-box',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              borderRadius: 0,
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ fontFamily: '"Futura PT Book", Futura, sans-serif' }}>
                              {selectedUserIds.length === 0 ? 'ADD CLIENTS' : `ADD MORE (${selectedUserIds.length} selected)`}
                            </span>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              className="flex-shrink-0"
                              style={{ transform: showClientDropdown ? 'rotate(180deg) translateX(16px)' : 'translateX(16px)', color: '#EB1C24', marginLeft: '34px' }}
                            >
                              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {showClientDropdown && (
                            <div
                              className="fixed inset-0 z-10"
                              aria-hidden="true"
                              onClick={() => { setShowClientDropdown(false); setClientSearchQuery(''); }}
                            />
                          )}
                        </div>
                        <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>MESSAGE</p>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value.toUpperCase())}
                          placeholder="ENTER NOTIFICATION TEXT..."
                          rows={6}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            resize: 'vertical',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                            textTransform: 'uppercase',
                            borderRadius: '0',
                            marginBottom: '0',
                          }}
                        />
                        <div style={{ marginTop: '14px' }}>
                          {previewFullMessage && (
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Preview (as on account alerts)</p>
                              <div className="flex flex-col gap-0" style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                                <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '14px', fontWeight: 'normal', color: '#000000', margin: 0, lineHeight: 1.2, textTransform: 'uppercase' }}>
                                  {previewTopicLabel}
                                </p>
                                <p style={{ fontFamily: '"Futura PT Demi", Futura, sans-serif', fontSize: '10px', color: '#808080', margin: '4px 0 3px 0', lineHeight: 1.3, textTransform: 'uppercase' }}>
                                  {message.trim() || '—'}
                                </p>
                                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', fontWeight: 500, textTransform: 'uppercase' }}>
                                  VIEW ON ALERTS
                                </span>
                              </div>
                            </div>
                          )}
                          <p style={{ fontFamily: '"Futura PT Medium"', fontWeight: 500, color: '#EB1C24', fontSize: '10px', margin: 0, lineHeight: 1.4 }}>
                            Sending format (unchanged). Marketing Alerts still sends: [HEADER · TOPIC] + your message (e.g. [ORDER · DELAYS] Your order is delayed…). The client now treats that as: title = ORDER · DELAYS, message = Your order is delayed…, and displays them in the same style as “NO SPEND TIER YET” / “EARN 1,000 POINTS TO UNLOCK SILVER TIER.”
                          </p>
                        </div>
                        {selectedClient && selectedUserIds.length === 1 && selectedNotifs.length > 0 && (
                          <>
                            <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#000', fontSize: '11px', marginTop: '16px', marginBottom: '6px' }}>RECENT FOR THIS CLIENT</h3>
                            <div className="space-y-2">
                              {selectedNotifs.slice(-10).reverse().map((item, i) => (
                                <div key={item.id || i} className="border border-gray-200 rounded p-2 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                  {item.text || '—'}
                                  {item.createdAt && <p className="text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {activeTab === 'ALERTS' && (
              <PageActionsBelowCard>
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleSendNotif}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={pageActionButtonStyle}
                >
                  {sending ? 'SENDING...' : 'SEND NOTIFICATION'}
                </button>
              </PageActionsBelowCard>
            )}

            {activeTab === 'OFFERS' && (
              <PageActionsBelowCard>
                <button
                  type="button"
                  onClick={() => specialOfferRef.current?.save()}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  SAVE CONFIG
                </button>
                <PageActionsBelowCard.Spacer />
                <button
                  type="button"
                  onClick={() => specialOfferRef.current?.randomize()}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  RANDOMIZE
                </button>
              </PageActionsBelowCard>
            )}
          </div>
        </div>
      </div>
    </div>
    {clientDropdownPortal}
    </>
  );
}
