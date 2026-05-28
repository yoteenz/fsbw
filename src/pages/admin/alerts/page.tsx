import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminHubPageShell } from '../../../components/admin/AdminHubPageShell';
import { AdminHubSortDropdown } from '../../../components/admin/AdminHubSortDropdown';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import {
  adminNotificationCategoryColor,
  adminNotificationUrgencyBorderColor,
  type AdminNotificationHubTab,
} from '../../../utils/adminHeaderNotificationsData';
import {
  computeAdminNotificationsPanelCounts,
  filterAdminNotificationsByTab,
  loadAdminNotificationsHubRows,
  markAdminHubNotificationRead,
  type AdminHubNotificationRow,
} from '../../../utils/adminNotificationsHub';
import {
  ADMIN_NOTIFICATIONS_DEFAULT_SORT,
  adminNotificationsSortOptionsForTab,
  sortAdminNotificationsByOption,
  type AdminNotificationsSortOption,
} from '../../../utils/adminNotificationsHubSort';

const ALERT_TABS = ['ALERTS', 'ORDERS', 'SYSTEM'] as const;

function formatNotificationText(text: string) {
  if (text.includes('ORDER #17 NEEDS ORDER FORM (24 HOURS)')) {
    return (
      <>
        <span className="font-covered-by-your-grace">ORDER #17 NEEDS ORDER FORM </span>
        <span className="font-covered-by-your-grace" style={{ color: '#EB1C24' }}>
          (24 HOURS)
        </span>
      </>
    );
  }
  const parts = text.split(' - ');
  if (parts.length === 2) {
    return (
      <>
        <span className="font-covered-by-your-grace">{parts[0]} - </span>
        <span className="font-covered-by-your-grace" style={{ color: '#EB1C24' }}>
          {parts[1]}
        </span>
      </>
    );
  }
  return <span className="font-covered-by-your-grace">{text}</span>;
}

const rowDivider = { borderBottom: '1px solid #e5e7eb' as const };

export default function AdminAlertsPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminHubNotificationRow[]>([]);
  const [sortByTab, setSortByTab] = useState<Partial<Record<AdminNotificationHubTab, AdminNotificationsSortOption>>>({});

  const [activeTab, setActiveTab] = usePersistentQueryState<(typeof ALERT_TABS)[number]>({
    queryKey: 'tab',
    storageKey: 'adminAlertsActiveTab',
    defaultValue: 'ALERTS',
    allowedValues: ALERT_TABS,
  });

  const sortOptions = useMemo(
    () => adminNotificationsSortOptionsForTab(activeTab as AdminNotificationHubTab),
    [activeTab]
  );
  const sortOption = useMemo(() => {
    const stored = sortByTab[activeTab as AdminNotificationHubTab];
    if (stored && sortOptions.includes(stored)) return stored;
    return ADMIN_NOTIFICATIONS_DEFAULT_SORT;
  }, [activeTab, sortByTab, sortOptions]);

  const setSortOption = useCallback(
    (next: AdminNotificationsSortOption) => {
      setSortByTab((prev) => ({ ...prev, [activeTab as AdminNotificationHubTab]: next }));
    },
    [activeTab]
  );

  const refresh = useCallback(() => {
    setRows(loadAdminNotificationsHubRows());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('adminNotificationsHubUpdated', onUpdate);
    return () => window.removeEventListener('adminNotificationsHubUpdated', onUpdate);
  }, [refresh]);

  const panels = useMemo(() => {
    const { totalUrgent, totalOrders } = computeAdminNotificationsPanelCounts(rows);
    return [
      { label: 'TOTAL URGENT', value: String(totalUrgent) },
      { label: 'TOTAL ORDERS', value: String(totalOrders) },
    ];
  }, [rows]);

  const tabRows = useMemo(() => {
    const filtered = filterAdminNotificationsByTab(rows, activeTab as AdminNotificationHubTab);
    return sortAdminNotificationsByOption(filtered, sortOption);
  }, [rows, activeTab, sortOption]);

  const handleOpenRow = (row: AdminHubNotificationRow) => {
    markAdminHubNotificationRead(row.hubId);
    refresh();
    if (row.hubTab === 'ORDERS') {
      navigate('/admin/pending?tab=FORMS');
      return;
    }
    if (row.category === 'ALERTS' && row.text.toUpperCase().includes('INVENTORY')) {
      navigate('/admin/revenue/edit-inventory');
      return;
    }
    if (row.category === 'BOOKINGS') {
      navigate('/admin/meetings');
      return;
    }
    if (row.category === 'CLIENTS') {
      navigate('/admin/clients/overview');
    }
  };

  return (
    <AdminHubPageShell
      title="NOTIFICATIONS"
      panels={panels}
      tabs={ALERT_TABS}
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t as AdminNotificationHubTab)}
      onBack={() => navigate('/admin/dashboard')}
    >
      {tabRows.length > 0 && (
        <div className="flex items-center justify-start" style={{ marginTop: '8px', marginBottom: '10px', position: 'relative', zIndex: 3 }}>
          <AdminHubSortDropdown
            value={sortOption}
            options={sortOptions}
            onChange={(opt) => setSortOption(opt as AdminNotificationsSortOption)}
            ariaLabel="Sort notifications"
          />
        </div>
      )}
      {tabRows.length === 0 ? (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
          NO NOTIFICATIONS IN THIS TAB.
        </p>
      ) : (
        tabRows.map((row) => {
          const borderColor = adminNotificationUrgencyBorderColor(row.urgent, row.isUnread);
          const categoryColor = adminNotificationCategoryColor(row.category);
          return (
            <button
              key={row.hubId}
              type="button"
              onClick={() => handleOpenRow(row)}
              className={`w-full text-left py-3 hover:bg-white/30 transition-colors ${row.isUnread ? 'bg-white/10' : ''}`}
              style={rowDivider}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: categoryColor, fontWeight: 600 }}>
                  {row.category}
                </span>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080' }}>{row.timestamp}</span>
                  {row.isUnread && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: row.urgent ? '#EB1C24' : '#FF8C00',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              </div>
              <div style={{ borderLeft: `2px solid ${borderColor}`, paddingLeft: '10px' }}>
                <p
                  className="leading-relaxed uppercase"
                  style={{ fontSize: '12px', margin: 0, color: row.isUnread ? '#000' : '#808080' }}
                >
                  {formatNotificationText(row.text)}
                </p>
              </div>
            </button>
          );
        })
      )}
    </AdminHubPageShell>
  );
}
