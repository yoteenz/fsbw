import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import {
  buildWaitlistProductGroupsWithZeros,
  UNIT_STOCK_NOTIFY_UPDATED_EVENT,
  type WaitlistProductGroup,
} from '../../../../utils/adminUnitStockNotifyWaitlist';

const rowLabelStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '11px',
  color: '#808080',
};

const rowValueStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  color: '#EB1C24',
};

const detailCellStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000',
  textTransform: 'uppercase',
  wordBreak: 'break-word',
};

const viewClientLinkStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: '#EB1C24',
  cursor: 'pointer',
  textTransform: 'uppercase',
  background: 'none',
  border: 'none',
  padding: 0,
  textAlign: 'right' as const,
};

function WaitlistSignupRows({
  group,
  onViewClient,
}: {
  group: WaitlistProductGroup;
  onViewClient: (email: string) => void;
}) {
  if (group.count === 0) {
    return (
      <p style={{ ...rowLabelStyle, margin: '8px 0 0 0', fontSize: '10px' }}>NO SIGNUPS YET</p>
    );
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div
        className="grid gap-2 py-2"
        style={{
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) minmax(72px, auto)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <span style={{ ...rowLabelStyle, fontSize: '9px' }}>NAME</span>
        <span style={{ ...rowLabelStyle, fontSize: '9px' }}>EMAIL</span>
        <span style={{ ...rowLabelStyle, fontSize: '9px', textAlign: 'right' }}>CLIENT</span>
      </div>
      {group.signups.map((signup) => (
        <div
          key={`${group.productName}_${signup.email}`}
          className="grid gap-2 py-2 items-start"
          style={{
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) minmax(72px, auto)',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <span style={detailCellStyle}>{signup.displayName ?? 'NULL'}</span>
          <span style={{ ...detailCellStyle, color: '#808080' }}>{signup.email}</span>
          {signup.hasClientRecord ? (
            <button
              type="button"
              style={viewClientLinkStyle}
              onClick={() => onViewClient(signup.email)}
            >
              VIEW CLIENT
            </button>
          ) : (
            <span style={{ ...detailCellStyle, color: '#808080', textAlign: 'right' }}>NULL</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminViewWaitlistPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const bump = () => setRefreshTick((t) => t + 1);
    window.addEventListener(UNIT_STOCK_NOTIFY_UPDATED_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(UNIT_STOCK_NOTIFY_UPDATED_EVENT, bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  const groups = useMemo(() => buildWaitlistProductGroupsWithZeros(), [refreshTick]);

  const openClientDetails = useCallback(
    (email: string) => {
      const e = (email || '').trim();
      if (!e) return;
      navigate({
        pathname: '/admin/clients/overview',
        search: new URLSearchParams({ email: e }).toString(),
      });
    },
    [navigate]
  );

  const toggleProduct = (productName: string) => {
    setExpandedProduct((prev) => (prev === productName ? null : productName));
  };

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
          title="VIEW WAITLIST"
          showBack
          onBack={() => navigate('/admin/revenue')}
          breadcrumbParentLabel="REVENUE"
          breadcrumbParentPath="/admin/revenue"
        />
        <div className="pb-8 px-4 max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.3px' }}>
            <p
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '9px',
                color: '#808080',
                margin: '0 0 12px 0',
                lineHeight: 1.4,
                textTransform: 'uppercase',
              }}
            >
              NOTIFY-ME SIGNUPS WHEN UNITS ARE SOLD OUT. TAP A PRODUCT TO VIEW NAMES, EMAILS, AND OPEN CLIENT DETAILS.
            </p>
            <div className="space-y-0">
              {groups.map((group) => {
                const expanded = expandedProduct === group.productName;
                return (
                  <div key={group.productName}>
                    <button
                      type="button"
                      onClick={() => toggleProduct(group.productName)}
                      className="w-full flex justify-between items-center py-2 cursor-pointer hover:bg-black/5"
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        background: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: 'none',
                        paddingLeft: 0,
                        paddingRight: 0,
                      }}
                    >
                      <span style={rowLabelStyle}>{group.productName}</span>
                      <span style={rowValueStyle}>{group.count}</span>
                    </button>
                    {expanded ? (
                      <div className="pb-2 px-0">
                        <WaitlistSignupRows group={group} onViewClient={openClientDetails} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
