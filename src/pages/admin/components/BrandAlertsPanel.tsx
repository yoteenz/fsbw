import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { getAdminClients, getAdminNotifications, postAdminNotification } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { buildClientListFromOverview } from '../../../utils/adminClientListFromOverview';

const ALERT_HEADERS = ['ORDER', 'TIER', 'MEMBERSHIP', 'SALE', 'BOOKING', 'REWARDS', 'CUSTOM'] as const;
type AlertHeader = (typeof ALERT_HEADERS)[number];

const TOPICS_BY_HEADER: Record<AlertHeader, readonly string[]> = {
  ORDER: ['DELAYS', 'UPGRADES', 'TRACKING NUMBER', 'MESSAGE / EMAIL', 'CUSTOM'],
  TIER: ['TIER CHANGE', 'UPGRADE ELIGIBLE', 'BENEFITS', 'CUSTOM'],
  MEMBERSHIP: ['RENEWAL', 'PAYMENT', 'CHANGE', 'CUSTOM'],
  SALE: ['SECRET SALE', 'PERSONAL DISCOUNT CODE', 'FLASH SALE', 'CUSTOM'],
  BOOKING: ['CONFIRMATION', 'RESCHEDULE', 'REMINDER', 'CUSTOM'],
  REWARDS: ['POINTS', 'VOUCHER', 'REDEMPTION', 'CUSTOM'],
  CUSTOM: ['CUSTOM'],
};

/** Horizontal nudge for full-width HEADER/TOPIC and ADD CLIENTS chevrons (not the custom 36×36 squares). Aligns with chevron in 36×36 custom row (~20px from button edge). */
const FULL_WIDTH_CHEVRON_NUDGE_PX = 20;

/** Enough height for all header/topic rows (e.g. CUSTOM) without clipping. */
const ALERT_DROPDOWN_MAX_HEIGHT_PX = 300;

type NotifEntry = {
  userId: string;
  items: Array<{ id?: string; text?: string; read?: boolean; createdAt?: string }>;
  updatedAt?: string;
};

export type BrandAlertsPanelHandle = {
  sendNotification: () => void;
};

type Props = {
  onStatsChange?: (stats: { clientsWithNotifs: number; totalSent: number }) => void;
  onSendFooterState?: (state: { disabled: boolean; label: string }) => void;
};

const BrandAlertsPanel = forwardRef<BrandAlertsPanelHandle, Props>(function BrandAlertsPanel(
  { onStatsChange, onSendFooterState },
  ref
) {
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
    if (!currentUser?.email || !isAdminEmail(currentUser.email) || !isSupabaseConfigured()) {
      setLoadingNotifs(false);
      setClients(buildClientListFromOverview([], currentUser));
      return;
    }
    setLoadingNotifs(true);
    Promise.all([getAdminNotifications(), getAdminClients()])
      .then(([notifs, res]) => {
        const list = Array.isArray(notifs) ? (notifs as NotifEntry[]) : [];
        setNotifList(list);
        const apiList = res?.clients ?? [];
        setClients(
          buildClientListFromOverview(Array.isArray(apiList) ? apiList : [], currentUser)
        );
      })
      .catch(() => {
        setNotifList([]);
        const cu: { email?: string } | null = (() => {
          try {
            const raw = localStorage.getItem('currentUser');
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();
        setClients(buildClientListFromOverview([], cu));
      })
      .finally(() => setLoadingNotifs(false));
  }, []);

  useEffect(() => {
    const clientsReceived = notifList.length;
    const totalSent = notifList.reduce((sum, n) => sum + (n.items?.length ?? 0), 0);
    onStatsChange?.({ clientsWithNotifs: clientsReceived, totalSent });
  }, [notifList, onStatsChange]);

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
      setFeedback({
        type: 'success',
        msg: selectedUserIds.length === 1 ? 'Notification sent.' : `Notification sent to ${selectedUserIds.length} clients.`,
      });
      setMessage('');
      const updated = await getAdminNotifications();
      setNotifList(Array.isArray(updated) ? (updated as NotifEntry[]) : []);
    } catch (e) {
      setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Send failed' });
    } finally {
      setSending(false);
    }
  };

  const handleSendRef = useRef(handleSendNotif);
  handleSendRef.current = handleSendNotif;

  useImperativeHandle(ref, () => ({
    sendNotification: () => {
      void handleSendRef.current();
    },
  }), []);

  useEffect(() => {
    onSendFooterState?.({
      disabled: sending || loadingNotifs,
      label: sending ? 'SENDING...' : 'SEND NOTIFICATION',
    });
  }, [sending, loadingNotifs, onSendFooterState]);

  const topicOptions = TOPICS_BY_HEADER[selectedHeader];
  const isTopicValid = topicOptions.includes(selectedTopic);
  const effectiveTopic = isTopicValid ? selectedTopic : topicOptions[0];
  const previewHeaderPart = selectedHeader === 'CUSTOM' ? (customHeaderText.trim() || 'CUSTOM') : selectedHeader;
  const previewTopicPart = effectiveTopic === 'CUSTOM' ? (customTopicText.trim() || 'CUSTOM') : effectiveTopic;
  const previewTopicLabel =
    previewTopicPart && previewTopicPart !== 'CUSTOM' ? `${previewHeaderPart} · ${previewTopicPart}` : previewHeaderPart;
  const previewFullMessage = message.trim() ? `[${previewTopicLabel}] ${message.trim()}` : '';

  useEffect(() => {
    if (!topicOptions.includes(selectedTopic)) {
      setSelectedTopic(topicOptions[0]);
    }
  }, [selectedHeader, selectedTopic, topicOptions]);

  const getClientLabel = (c: { id?: string; email?: string; firstName?: string; lastName?: string }) => {
    const email = (c.email || '').trim();
    const name = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
    return name ? `${email} (${name})` : email || '—';
  };

  const filteredClients = (() => {
    const q = (clientSearchQuery || '').trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => getClientLabel(c).toLowerCase().includes(q));
  })();

  const firstSelectedId = selectedUserIds[0] ?? '';
  const selectedClient = clients.find((c) => (c as { id?: string }).id === firstSelectedId);
  const selectedNotifs = notifList.find((n) => n.userId === firstSelectedId)?.items ?? [];

  const clientDropdownPortal =
    showClientDropdown &&
    typeof document !== 'undefined' &&
    document.body &&
    createPortal(
      <div
        className="fixed inset-0"
        style={{ zIndex: 1000000000 }}
        onClick={() => {
          setShowClientDropdown(false);
          setClientSearchQuery('');
        }}
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
            borderWidth: '1.3px',
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
          <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box', flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                flex: '1 1 0',
                minHeight: 0,
                overflowY: 'auto',
                paddingTop: '8px',
                boxSizing: 'border-box',
              }}
            >
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
                  style={{
                    fontFamily: '"Futura PT Book", Futura, sans-serif',
                    color: '#000',
                    fontWeight: 400,
                    fontSize: '11px',
                    backgroundColor: isSelected ? '#f3f4f6' : undefined,
                  }}
                >
                  {getClientLabel(c)}
                </button>
              );
            })}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
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
            <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
              HEADER
            </p>
            <div className="relative" style={{ marginBottom: '12px' }}>
              {selectedHeader === 'CUSTOM' ? (
                <div className="flex items-stretch" style={{ gap: '6px' }}>
                  <input
                    type="text"
                    value={customHeaderText}
                    onChange={(e) => setCustomHeaderText(e.target.value.toUpperCase())}
                    className="flex-1"
                    style={{
                      height: '36px',
                      padding: '8px 12px',
                      border: '1.3px solid #000000',
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
                    onClick={() => {
                      setShowHeaderDropdown((v) => !v);
                      setShowTopicDropdown(false);
                    }}
                    style={{
                      position: 'relative',
                      width: '36px',
                      height: '36px',
                      padding: 0,
                      lineHeight: 0,
                      border: '1.3px solid #000000',
                      borderRadius: 0,
                      background: '#fff',
                      cursor: 'pointer',
                      color: '#EB1C24',
                    }}
                    aria-label="Change header"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        display: 'block',
                        transform: showHeaderDropdown
                          ? 'translate(-50%, -50%) rotate(180deg)'
                          : 'translate(-50%, -50%)',
                      }}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showHeaderDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowHeaderDropdown(false)} />
                      <div
                        className="absolute left-0 z-20 py-1 bg-white border border-black shadow-lg"
                        style={{ borderWidth: '1.3px', marginTop: '7px', maxHeight: `${ALERT_DROPDOWN_MAX_HEIGHT_PX}px`, overflowY: 'auto', left: 0, right: 0 }}
                      >
                        {ALERT_HEADERS.map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => {
                              setSelectedHeader(h);
                              setShowHeaderDropdown(false);
                            }}
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
                    onClick={() => {
                      setShowHeaderDropdown((v) => !v);
                      setShowTopicDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      height: '36px',
                      padding: '8px 32px 8px 12px',
                      border: '1.3px solid #000000',
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
                    <span>{selectedHeader}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="flex-shrink-0"
                      style={{
                        transform: showHeaderDropdown
                          ? `translateX(${FULL_WIDTH_CHEVRON_NUDGE_PX}px) rotate(180deg)`
                          : `translateX(${FULL_WIDTH_CHEVRON_NUDGE_PX}px)`,
                        color: '#EB1C24',
                        display: 'block',
                      }}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showHeaderDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowHeaderDropdown(false)} />
                      <div
                        className="absolute left-0 right-0 z-20 py-1 bg-white border border-black shadow-lg"
                        style={{ borderWidth: '1.3px', marginTop: '7px', maxHeight: `${ALERT_DROPDOWN_MAX_HEIGHT_PX}px`, overflowY: 'auto' }}
                      >
                        {ALERT_HEADERS.map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => {
                              setSelectedHeader(h);
                              setShowHeaderDropdown(false);
                            }}
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

            <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
              TOPIC
            </p>
            <div className="relative" style={{ marginBottom: '12px' }}>
              {effectiveTopic === 'CUSTOM' ? (
                <div className="flex items-stretch" style={{ gap: '6px' }}>
                  <input
                    type="text"
                    value={customTopicText}
                    onChange={(e) => setCustomTopicText(e.target.value.toUpperCase())}
                    className="flex-1"
                    style={{
                      height: '36px',
                      padding: '8px 12px',
                      border: '1.3px solid #000000',
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
                    onClick={() => {
                      setShowTopicDropdown((v) => !v);
                      setShowHeaderDropdown(false);
                    }}
                    style={{
                      position: 'relative',
                      width: '36px',
                      height: '36px',
                      padding: 0,
                      lineHeight: 0,
                      border: '1.3px solid #000000',
                      borderRadius: 0,
                      background: '#fff',
                      cursor: 'pointer',
                      color: '#EB1C24',
                    }}
                    aria-label="Change topic"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        display: 'block',
                        transform: showTopicDropdown
                          ? 'translate(-50%, -50%) rotate(180deg)'
                          : 'translate(-50%, -50%)',
                      }}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showTopicDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowTopicDropdown(false)} />
                      <div
                        className="absolute left-0 z-20 py-1 bg-white border border-black shadow-lg"
                        style={{ borderWidth: '1.3px', marginTop: '7px', maxHeight: `${ALERT_DROPDOWN_MAX_HEIGHT_PX}px`, overflowY: 'auto', left: 0, right: 0 }}
                      >
                        {topicOptions.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSelectedTopic(t);
                              setShowTopicDropdown(false);
                            }}
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
                    onClick={() => {
                      setShowTopicDropdown((v) => !v);
                      setShowHeaderDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      height: '36px',
                      padding: '8px 32px 8px 12px',
                      border: '1.3px solid #000000',
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
                    <span>{effectiveTopic}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="flex-shrink-0"
                      style={{
                        transform: showTopicDropdown
                          ? `translateX(${FULL_WIDTH_CHEVRON_NUDGE_PX}px) rotate(180deg)`
                          : `translateX(${FULL_WIDTH_CHEVRON_NUDGE_PX}px)`,
                        color: '#EB1C24',
                        display: 'block',
                      }}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showTopicDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowTopicDropdown(false)} />
                      <div
                        className="absolute left-0 right-0 z-20 py-1 bg-white border border-black shadow-lg"
                        style={{ borderWidth: '1.3px', marginTop: '7px', maxHeight: `${ALERT_DROPDOWN_MAX_HEIGHT_PX}px`, overflowY: 'auto' }}
                      >
                        {topicOptions.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSelectedTopic(t);
                              setShowTopicDropdown(false);
                            }}
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
                      {c ? getClientLabel(c) : id}
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
                onClick={() => {
                  setShowClientDropdown((v) => !v);
                  setShowHeaderDropdown(false);
                  setShowTopicDropdown(false);
                }}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '8px 32px 8px 12px',
                  border: '1.3px solid #000000',
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
                <span>
                  {selectedUserIds.length === 0 ? 'ADD CLIENTS' : `ADD MORE (${selectedUserIds.length} selected)`}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="flex-shrink-0"
                  style={{
                    transform: showClientDropdown
                      ? `translateX(${FULL_WIDTH_CHEVRON_NUDGE_PX}px) rotate(180deg)`
                      : `translateX(${FULL_WIDTH_CHEVRON_NUDGE_PX}px)`,
                    color: '#EB1C24',
                    display: 'block',
                  }}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showClientDropdown && (
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden="true"
                  onClick={() => {
                    setShowClientDropdown(false);
                    setClientSearchQuery('');
                  }}
                />
              )}
            </div>

            <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              MESSAGE
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.toUpperCase())}
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
                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                    Preview (as on account alerts)
                  </p>
                  <div className="flex flex-col gap-0" style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <p
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        fontSize: '14px',
                        fontWeight: 'normal',
                        color: '#000000',
                        margin: 0,
                        lineHeight: 1.2,
                        textTransform: 'uppercase',
                      }}
                    >
                      {previewTopicLabel}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Demi", Futura, sans-serif',
                        fontSize: '10px',
                        color: '#808080',
                        margin: '4px 0 3px 0',
                        lineHeight: 1.3,
                        textTransform: 'uppercase',
                      }}
                    >
                      {message.trim() || '—'}
                    </p>
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', fontWeight: 500, textTransform: 'uppercase' }}>
                      VIEW ON ALERTS
                    </span>
                  </div>
                </div>
              )}
            </div>
            {selectedClient && selectedUserIds.length === 1 && selectedNotifs.length > 0 && (
              <>
                <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#000', fontSize: '11px', marginTop: '16px', marginBottom: '6px' }}>
                  RECENT FOR THIS CLIENT
                </h3>
                <div className="space-y-2">
                  {selectedNotifs
                    .slice(-10)
                    .reverse()
                    .map((item, i) => (
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
      {clientDropdownPortal}
    </>
  );
});

export default BrandAlertsPanel;
