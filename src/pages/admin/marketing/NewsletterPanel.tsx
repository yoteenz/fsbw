import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { getAdminClients, sendAdminNewsletter } from '../../../utils/api';
import { isNewsletterOptIn } from '../../../utils/newsletterOptIn';

const CHUNK = 100;

const TEMPLATES: { id: string; label: string; subject: string; html: string }[] = [
  {
    id: 'sale',
    label: 'SALE / PROMO',
    subject: 'Something special is live at Frontal Slayer',
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:560px">
  <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#EB1C24;text-transform:uppercase">Limited-time offer</p>
  <p style="margin:0 0 12px;font-size:15px">Hi there — we wanted you to be the first to know about a new promotion. Tap through to shop your next unit.</p>
  <p style="margin:0 0 12px;font-size:15px"><strong>Details:</strong> [Edit this line with dates, discount, or product links.]</p>
  <p style="margin:16px 0 0;font-size:14px;color:#555">Thank you for subscribing — you can update email preferences anytime in Account → Settings.</p>
</div>`,
  },
  {
    id: 'milestone',
    label: 'MILESTONE',
    subject: 'You hit a milestone with Frontal Slayer',
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:560px">
  <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#EB1C24;text-transform:uppercase">Milestone unlocked</p>
  <p style="margin:0 0 12px;font-size:15px">We noticed you reached an important milestone with us. [Describe the reward, tier step, or challenge progress here.]</p>
  <p style="margin:16px 0 0;font-size:14px;color:#555">Questions? Reply to this email or visit your concierge in the app.</p>
</div>`,
  },
  {
    id: 'alert',
    label: 'ALERT / UPDATE',
    subject: 'Important update from Frontal Slayer',
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:560px">
  <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#EB1C24;text-transform:uppercase">Heads up</p>
  <p style="margin:0 0 12px;font-size:15px">[Shipping timelines, inventory, policy, or service changes go here. Keep it short and clear.]</p>
  <p style="margin:16px 0 0;font-size:14px;color:#555">You are receiving this because newsletter emails are enabled on your account.</p>
</div>`,
  },
  {
    id: 'blank',
    label: 'BLANK',
    subject: '',
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:560px">
  <p style="margin:0;font-size:15px">[Write your message here. HTML is supported.]</p>
</div>`,
  },
];

function clientEmail(c: Record<string, unknown>): string {
  return String(c.email || '')
    .trim()
    .toLowerCase();
}

function clientLabel(c: Record<string, unknown>): string {
  const fn = String(c.firstName || '').trim();
  const ln = String(c.lastName || '').trim();
  const name = [fn, ln].filter(Boolean).join(' ');
  const em = clientEmail(c);
  return name ? `${name} · ${em}` : em || '—';
}

export type NewsletterPanelHandle = {
  openSendConfirm: () => void;
};

type NewsletterPanelProps = {
  onCountsChange?: (subscribers: number, selected: number) => void;
  onCanSendChange?: (ok: boolean) => void;
};

const NewsletterPanel = forwardRef<NewsletterPanelHandle, NewsletterPanelProps>(function NewsletterPanel(
  { onCountsChange, onCanSendChange },
  ref
) {
  const [clients, setClients] = useState<Record<string, unknown>[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setLoadingList(true);
    setLoadError(null);
    try {
      const { clients: list, error } = await getAdminClients();
      if (error === 'forbidden') {
        setLoadError('Admin session required.');
        setClients([]);
        return;
      }
      if (error === 'service_unavailable') {
        setLoadError('Client list needs SUPABASE_SERVICE_ROLE_KEY on the server.');
        setClients([]);
        return;
      }
      setClients(Array.isArray(list) ? list : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load clients');
      setClients([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const subscribers = useMemo(() => {
    const out: Record<string, unknown>[] = [];
    const seen = new Set<string>();
    for (const c of clients) {
      if (!c || typeof c !== 'object') continue;
      const row = c as Record<string, unknown>;
      const em = clientEmail(row);
      if (!em || seen.has(em)) continue;
      if (!isNewsletterOptIn(row)) continue;
      seen.add(em);
      out.push(row);
    }
    out.sort((a, b) => clientLabel(a).localeCompare(clientLabel(b)));
    return out;
  }, [clients]);

  const filteredSubscribers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((row) => clientLabel(row).toLowerCase().includes(q));
  }, [subscribers, search]);

  const selectedCount = selected.size;
  const canSend = Boolean(subject.trim() && html.trim() && selectedCount > 0 && !sending);

  useEffect(() => {
    onCountsChange?.(subscribers.length, selectedCount);
  }, [subscribers.length, selectedCount, onCountsChange]);

  useEffect(() => {
    onCanSendChange?.(canSend);
  }, [canSend, onCanSendChange]);

  useImperativeHandle(
    ref,
    () => ({
      openSendConfirm: () => {
        if (!subject.trim() || !html.trim() || selected.size === 0) {
          setSendMessage('Add subject, HTML body, and at least one recipient.');
          return;
        }
        setSendMessage(null);
        setShowSendConfirm(true);
      },
    }),
    [subject, html, selected]
  );

  const toggleEmail = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const selectAllSubscribers = () => {
    setSelected(new Set(subscribers.map((r) => clientEmail(r)).filter(Boolean)));
  };

  const clearSelection = () => setSelected(new Set());

  const selectVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of filteredSubscribers) {
        const em = clientEmail(r);
        if (em) next.add(em);
      }
      return next;
    });
  };

  const deselectVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of filteredSubscribers) {
        const em = clientEmail(r);
        if (em) next.delete(em);
      }
      return next;
    });
  };

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    setSubject(t.subject);
    setHtml(t.html);
  };

  const runSend = async () => {
    if (sending) return;
    const sub = subject.trim();
    const body = html.trim();
    const emails = [...selected];
    if (!sub || !body || emails.length === 0) return;
    setSending(true);
    setSendMessage(null);
    let totalSent = 0;
    const failures: string[] = [];
    try {
      for (let i = 0; i < emails.length; i += CHUNK) {
        const slice = emails.slice(i, i + CHUNK);
        const result = await sendAdminNewsletter({ subject: sub, html: body, to: slice });
        if (result.error) {
          setSendMessage(result.error);
          setSending(false);
          setShowSendConfirm(false);
          return;
        }
        totalSent += result.sent ?? 0;
        (result.failed || []).forEach((f) => failures.push(`${f.email}: ${f.error}`));
      }
      const failNote = failures.length ? ` Some addresses failed: ${failures.slice(0, 3).join('; ')}` : '';
      setSendMessage(`Sent to ${totalSent} recipient(s).${failNote}`);
      setShowSendConfirm(false);
    } catch (e) {
      setSendMessage(e instanceof Error ? e.message : 'Send failed');
      setShowSendConfirm(false);
    } finally {
      setSending(false);
    }
  };

  const labelStyle: CSSProperties = {
    fontFamily: '"Futura PT Medium"',
    fontSize: '10px',
    color: '#808080',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  };

  const inputStyle: CSSProperties = {
    fontFamily: '"Futura PT Book"',
    fontSize: '11px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1.3px solid #000',
    borderRadius: 0,
    padding: '8px',
    background: 'rgba(255,255,255,0.9)',
  };

  return (
    <div className="py-2">
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', marginBottom: '12px' }}>
        Recipients must have <strong style={{ color: '#374151' }}>newsletter</strong> enabled on Account → Settings (
        <code style={{ fontSize: '10px' }}>notificationNewsletter</code>
        ). Choose a template, edit the copy, then select everyone or individual clients. Sending uses{' '}
        <strong style={{ color: '#374151' }}>Resend</strong> — set <code style={{ fontSize: '10px' }}>RESEND_API_KEY</code> and{' '}
        <code style={{ fontSize: '10px' }}>NEWSLETTER_FROM_EMAIL</code> on the server (max {CHUNK} per API call; larger sends are chunked automatically).
      </p>

      {loadError && (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', marginBottom: '8px' }}>{loadError}</p>
      )}
      {sendMessage && (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#374151', marginBottom: '8px' }}>{sendMessage}</p>
      )}

      <div style={{ marginBottom: '12px' }}>
        <span style={labelStyle}>Quick templates</span>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className="py-1.5 px-2 border border-black"
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '9px',
                background: '#fff',
                cursor: 'pointer',
                color: '#EB1C24',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label style={{ display: 'block', marginBottom: '10px' }}>
        <span style={labelStyle}>Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
      </label>

      <label style={{ display: 'block', marginBottom: '12px' }}>
        <span style={labelStyle}>Body (HTML)</span>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={10}
          style={{ ...inputStyle, minHeight: '160px', resize: 'vertical' as const }}
        />
      </label>

      <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ ...labelStyle, marginBottom: 0 }}>Recipients</span>
        <button
          type="button"
          onClick={selectAllSubscribers}
          disabled={loadingList || subscribers.length === 0}
          className="py-1 px-2 border border-black"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', background: '#fff', cursor: 'pointer' }}
        >
          SELECT ALL SUBSCRIBERS
        </button>
        <button
          type="button"
          onClick={clearSelection}
          disabled={selected.size === 0}
          className="py-1 px-2 border border-black"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', background: '#fff', cursor: 'pointer' }}
        >
          CLEAR
        </button>
        <button
          type="button"
          onClick={selectVisible}
          disabled={loadingList || filteredSubscribers.length === 0}
          className="py-1 px-2 border border-black"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', background: '#fff', cursor: 'pointer' }}
        >
          ADD FILTERED
        </button>
        <button
          type="button"
          onClick={deselectVisible}
          disabled={filteredSubscribers.length === 0}
          className="py-1 px-2 border border-black"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', background: '#fff', cursor: 'pointer' }}
        >
          REMOVE FILTERED
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH NAME OR EMAIL"
        style={{ ...inputStyle, marginBottom: '8px' }}
      />

      <div
        className="border border-gray-200 overflow-y-auto"
        style={{ maxHeight: '200px', background: 'rgba(255,255,255,0.5)' }}
      >
        {loadingList ? (
          <p style={{ padding: '12px', fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>Loading clients…</p>
        ) : filteredSubscribers.length === 0 ? (
          <p style={{ padding: '12px', fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>
            No newsletter subscribers match.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filteredSubscribers.map((row) => {
              const em = clientEmail(row);
              if (!em) return null;
              const checked = selected.has(em);
              return (
                <li
                  key={em}
                  style={{
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontFamily: '"Futura PT Book"',
                    fontSize: '11px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEmail(em)}
                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleEmail(em)}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#111',
                      flex: 1,
                    }}
                  >
                    {clientLabel(row)}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmationModal
        isOpen={showSendConfirm}
        onClose={() => !sending && setShowSendConfirm(false)}
        onConfirm={() => void runSend()}
        title="SEND NEWSLETTER"
        message={`Send this email to ${selected.size} recipient(s)? This cannot be undone.`}
        confirmText={sending ? 'SENDING…' : 'SEND'}
        cancelText="CANCEL"
        dataAttribute="newsletter-send-confirm"
      />
    </div>
  );
});

export default NewsletterPanel;
