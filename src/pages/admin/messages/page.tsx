import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminHubPageShell } from '../../../components/admin/AdminHubPageShell';
import { AdminHubSortDropdown } from '../../../components/admin/AdminHubSortDropdown';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import { patchAdminBrandContactInquiry } from '../../../utils/api';
import { markBrandFaqQuestionReadLocal } from '../../../utils/brandFaqQuestions';
import { PENDING_MOCK_REVIEWS_UPDATED_EVENT } from '../../../utils/adminPendingMockQueues';
import {
  computeAdminMessagesPanelCounts,
  filterAdminMessagesByTab,
  loadAdminMessagesHubRows,
  markAdminHubMessageRead,
  type AdminHubMessageRow,
  type AdminMessagesTab,
} from '../../../utils/adminMessagesHub';
import {
  ADMIN_MESSAGES_DEFAULT_SORT,
  adminMessagesSortOptionsForTab,
  sortAdminMessagesByOption,
  type AdminMessagesSortOption,
} from '../../../utils/adminMessagesHubSort';

const MESSAGE_TABS = ['INBOX', 'FAQ', 'CONTACT', 'REVIEWS'] as const;

const rowDivider = { borderBottom: '1px solid #e5e7eb' as const };

export default function AdminMessagesPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<AdminHubMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortByTab, setSortByTab] = useState<Partial<Record<AdminMessagesTab, AdminMessagesSortOption>>>({});

  const [activeTab, setActiveTab] = usePersistentQueryState<(typeof MESSAGE_TABS)[number]>({
    queryKey: 'tab',
    storageKey: 'adminMessagesActiveTab',
    defaultValue: 'INBOX',
    allowedValues: MESSAGE_TABS,
  });

  const sortOptions = useMemo(() => adminMessagesSortOptionsForTab(activeTab), [activeTab]);
  const sortOption = useMemo(() => {
    const stored = sortByTab[activeTab];
    if (stored && sortOptions.includes(stored)) return stored;
    return ADMIN_MESSAGES_DEFAULT_SORT;
  }, [activeTab, sortByTab, sortOptions]);

  const setSortOption = useCallback(
    (next: AdminMessagesSortOption) => {
      setSortByTab((prev) => ({ ...prev, [activeTab]: next }));
    },
    [activeTab]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await loadAdminMessagesHubRows());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab')?.toUpperCase();
    if (tab && MESSAGE_TABS.includes(tab as (typeof MESSAGE_TABS)[number])) {
      setActiveTab(tab as AdminMessagesTab);
    }
  }, [searchParams, setActiveTab]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('adminMessagesHubUpdated', onUpdate);
    window.addEventListener('brandFaqQuestionsUpdated', onUpdate);
    window.addEventListener('brandContactInquiriesUpdated', onUpdate);
    window.addEventListener(PENDING_MOCK_REVIEWS_UPDATED_EVENT, onUpdate);
    return () => {
      window.removeEventListener('adminMessagesHubUpdated', onUpdate);
      window.removeEventListener('brandFaqQuestionsUpdated', onUpdate);
      window.removeEventListener('brandContactInquiriesUpdated', onUpdate);
      window.removeEventListener(PENDING_MOCK_REVIEWS_UPDATED_EVENT, onUpdate);
    };
  }, [refresh]);

  const panels = useMemo(() => {
    const { unreadPriority, totalUnread } = computeAdminMessagesPanelCounts(rows);
    return [
      { label: 'UNREAD PRIORITY', value: String(unreadPriority) },
      { label: 'TOTAL UNREAD', value: String(totalUnread) },
    ];
  }, [rows]);

  const tabRows = useMemo(() => {
    const filtered = filterAdminMessagesByTab(rows, activeTab);
    return sortAdminMessagesByOption(filtered, sortOption);
  }, [rows, activeTab, sortOption]);

  const handleOpenRow = (row: AdminHubMessageRow) => {
    markAdminHubMessageRead(row.id);
    if (row.tab === 'FAQ') {
      const faqId = row.id.replace(/^faq-/, '');
      markBrandFaqQuestionReadLocal(faqId);
    }
    if (row.tab === 'CONTACT') {
      const contactId = row.id.replace(/^contact-/, '');
      void patchAdminBrandContactInquiry(contactId, 'read').finally(() => refresh());
    }
    if (row.tab === 'REVIEWS') {
      navigate('/admin/pending?tab=REVIEWS');
      return;
    }
    if (row.clientEmail) {
      navigate(`/admin/clients/overview?email=${encodeURIComponent(row.clientEmail)}&returnTo=messages`);
      return;
    }
    void refresh();
  };

  return (
    <AdminHubPageShell
      title="MESSAGES"
      panels={panels}
      tabs={MESSAGE_TABS}
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t as AdminMessagesTab)}
      onBack={() => navigate('/admin/dashboard')}
    >
      {!loading && tabRows.length > 0 && (
        <div className="flex items-center justify-start" style={{ marginTop: '8px', marginBottom: '10px', position: 'relative', zIndex: 3 }}>
          <AdminHubSortDropdown
            value={sortOption}
            options={sortOptions}
            onChange={(opt) => setSortOption(opt as AdminMessagesSortOption)}
            ariaLabel="Sort messages"
          />
        </div>
      )}
      {loading ? (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
          LOADING…
        </p>
      ) : tabRows.length === 0 ? (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
          {activeTab === 'INBOX' && 'NO PRIORITY CONCIERGE MESSAGES.'}
          {activeTab === 'FAQ' && 'NO FAQ SUBMISSIONS.'}
          {activeTab === 'CONTACT' && 'NO CONTACT SUBMISSIONS.'}
          {activeTab === 'REVIEWS' && 'NO PENDING PRODUCT REVIEWS.'}
        </p>
      ) : (
        tabRows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => handleOpenRow(row)}
            className="w-full text-left py-3 hover:bg-white/30 transition-colors"
            style={rowDivider}
          >
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#EB1C24' }}>{row.meta}</span>
              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080' }}>{row.timestampLabel}</span>
            </div>
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000', margin: '0 0 4px' }}>{row.title}</p>
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '0 0 6px' }}>{row.subtitle}</p>
            <p
              className="font-covered-by-your-grace"
              style={{
                fontSize: '12px',
                color: row.unread ? '#000' : '#808080',
                margin: 0,
                lineHeight: 1.35,
                borderLeft: `2px solid ${row.isPriority && row.unread ? '#EB1C24' : '#e5e7eb'}`,
                paddingLeft: '10px',
              }}
            >
              {row.body}
            </p>
            {row.unread && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#EB1C24',
                }}
              />
            )}
          </button>
        ))
      )}
      {activeTab === 'REVIEWS' && tabRows.length > 0 && (
        <button
          type="button"
          onClick={() => navigate('/admin/pending?tab=REVIEWS')}
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            color: '#EB1C24',
            marginTop: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
          }}
        >
          OPEN PENDING REVIEWS QUEUE
        </button>
      )}
    </AdminHubPageShell>
  );
}
