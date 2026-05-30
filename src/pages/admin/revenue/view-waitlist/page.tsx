import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import {
  buildWaitlistCatalogSections,
  buildWaitlistProductGroupsWithZeros,
  enrichWaitlistGroupsWithMockSignups,
  UNIT_STOCK_NOTIFY_UPDATED_EVENT,
  type WaitlistCatalogSection,
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

const panelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 0,
  padding: '10px',
};

const textureLabelStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  color: '#808080',
  margin: '8px 0 4px 0',
  textTransform: 'uppercase',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: '#000',
  margin: 0,
  textTransform: 'uppercase',
};

function WaitlistSignupTable({
  group,
  onViewClient,
}: {
  group: WaitlistProductGroup;
  onViewClient: (email: string) => void;
}) {
  if (group.count === 0) {
    return (
      <p style={{ ...rowLabelStyle, margin: '12px 0 0 0', fontSize: '10px' }}>NO SIGNUPS YET</p>
    );
  }

  return (
    <div style={{ marginTop: '12px' }}>
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

function WaitlistCatalogOverview({
  sections,
  onSelectProduct,
}: {
  sections: WaitlistCatalogSection[];
  onSelectProduct: (productName: string) => void;
}) {
  return (
    <div className="space-y-3" style={{ marginTop: '12px' }}>
      {sections.map((section) => (
        <div key={section.id} style={panelStyle}>
          <p style={sectionTitleStyle}>{section.label}</p>
          {section.subsections.map((subsection) => (
            <div key={subsection.textureLabel ?? 'units'}>
              {subsection.textureLabel ? (
                <p style={textureLabelStyle}>{subsection.textureLabel}</p>
              ) : null}
              <div>
                {subsection.products.map((product) => (
                  <button
                    key={product.productName}
                    type="button"
                    onClick={() => onSelectProduct(product.productName)}
                    className="w-full flex justify-between items-center cursor-pointer hover:bg-black/[0.04]"
                    style={{
                      border: 'none',
                      borderBottom: '1px solid #e5e7eb',
                      background: 'none',
                      padding: '8px 0',
                      margin: 0,
                    }}
                  >
                    <span style={rowLabelStyle}>{product.productName}</span>
                    <span style={rowValueStyle}>{product.count}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdminViewWaitlistPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
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

  const groups = useMemo(() => {
    const base = buildWaitlistProductGroupsWithZeros();
    return enrichWaitlistGroupsWithMockSignups(base);
  }, [refreshTick]);

  const sections = useMemo(() => buildWaitlistCatalogSections(groups), [groups]);

  const groupsByName = useMemo(() => new Map(groups.map((g) => [g.productName, g])), [groups]);

  const selectedGroup = selectedProduct ? groupsByName.get(selectedProduct) ?? null : null;

  const totalSignups = useMemo(
    () => groups.reduce((sum, g) => sum + g.count, 0),
    [groups]
  );

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

  const closeProductPanel = () => setSelectedProduct(null);

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
          <div
            className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden min-h-0"
            style={{ borderWidth: '1.3px', minHeight: 'calc(100dvh - 160px)' }}
          >
            {selectedProduct && selectedGroup ? (
              <>
                <div className="flex-shrink-0 px-5 pb-2" style={{ marginTop: '10px' }}>
                  <div className="flex items-center justify-between" style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: 500,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        flex: '1 1 auto',
                        maxWidth: 'calc(100% - 24px)',
                        paddingRight: '8px',
                      }}
                    >
                      {selectedProduct}
                    </h2>
                    <button
                      type="button"
                      onClick={closeProductPanel}
                      aria-label="Close waitlist signups"
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        lineHeight: 0,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src="/assets/close-icon.svg"
                        alt=""
                        width={16}
                        height={16}
                        style={{ display: 'block' }}
                      />
                    </button>
                  </div>
                  <div style={{ borderBottom: '1px solid #d1d5db', marginTop: '8px' }} />
                </div>
                <div
                  className="flex-1 min-h-0 overflow-y-auto admin-hub-tab-scroll px-5 pb-4"
                  style={{ paddingTop: '4px' }}
                >
                  <WaitlistSignupTable group={selectedGroup} onViewClient={openClientDetails} />
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 px-5" style={{ marginTop: '10px' }}>
                  <div className="grid grid-cols-2 gap-4" style={{ marginTop: '12px' }}>
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"Covered By Your Grace", cursive',
                          fontSize: '22px',
                          color: '#000',
                          margin: 0,
                          lineHeight: 1,
                        }}
                      >
                        {groups.length}
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '9px',
                          color: '#808080',
                          margin: '4px 0 0 0',
                        }}
                      >
                        PRODUCTS
                      </p>
                    </div>
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"Covered By Your Grace", cursive',
                          fontSize: '22px',
                          color: '#EB1C24',
                          margin: 0,
                          lineHeight: 1,
                        }}
                      >
                        {totalSignups}
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '9px',
                          color: '#808080',
                          margin: '4px 0 0 0',
                        }}
                      >
                        SIGNUPS
                      </p>
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '9px',
                      color: '#808080',
                      margin: '12px 0 0 0',
                      lineHeight: 1.4,
                    }}
                  >
                    TAP A PRODUCT TO VIEW NOTIFY-ME SIGNUPS. MOCK CLIENT ROWS ARE INCLUDED FOR UI
                    TESTING.
                  </p>
                </div>
                <div
                  className="flex-1 min-h-0 overflow-y-auto admin-hub-tab-scroll px-5 pb-4"
                  style={{ paddingTop: '2px' }}
                >
                  <WaitlistCatalogOverview
                    sections={sections}
                    onSelectProduct={setSelectedProduct}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
