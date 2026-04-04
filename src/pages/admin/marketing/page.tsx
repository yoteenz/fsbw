import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSpecialOffer, { type SpecialOfferActionsRef } from '../special-offer/page';
import NewsletterPanel, { type NewsletterPanelHandle } from './NewsletterPanel';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';

const MARKETING_TABS = ['AFFILIATE', 'CHALLENGES', 'SPECIAL OFFERS', 'NEWSLETTER'] as const;

const TAB_PANEL_LABELS: Record<(typeof MARKETING_TABS)[number], { left: string; right: string }> = {
  AFFILIATE: { left: 'CONTENT', right: 'POINTS' },
  CHALLENGES: { left: 'REWARDS', right: 'ORDERS' },
  'SPECIAL OFFERS': { left: 'SALES', right: 'ORDERS' },
  NEWSLETTER: { left: 'SUBSCRIBERS', right: 'SELECTED' },
};

export default function AdminMarketing() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const specialOfferRef = useRef<SpecialOfferActionsRef>(null);
  const newsletterRef = useRef<NewsletterPanelHandle>(null);
  const [activeTab, setActiveTab] = usePersistentQueryState<(typeof MARKETING_TABS)[number]>({
    queryKey: 'tab',
    storageKey: 'adminMarketingTab',
    defaultValue: 'AFFILIATE',
    allowedValues: MARKETING_TABS,
  });
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(0);
  const [newsletterSelected, setNewsletterSelected] = useState(0);
  const [newsletterCanSend, setNewsletterCanSend] = useState(false);

  const handleNewsletterCounts = useCallback((subscribers: number, selected: number) => {
    setNewsletterSubscribers(subscribers);
    setNewsletterSelected(selected);
  }, []);

  const panelLabels = TAB_PANEL_LABELS[activeTab];
  const panelValues =
    activeTab === 'NEWSLETTER'
      ? { left: newsletterSubscribers, right: newsletterSelected }
      : { left: 0, right: 0 };

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
              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
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
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>{panelValues.left.toLocaleString()}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>{panelLabels.left}</p>
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
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>{panelValues.right.toLocaleString()}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>{panelLabels.right}</p>
                </div>
              </div>

              {/* Single row like other admin tabs: nowrap + horizontal scroll only if needed. */}
              <div
                className="px-5"
                style={{
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <div
                  className="flex flex-nowrap items-center gap-[10px] py-1"
                  style={{
                    width: 'max-content',
                    minWidth: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {MARKETING_TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className="py-3 font-medium transition-colors flex-shrink-0"
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: activeTab === tab ? '#EB1C24' : '#808080',
                        border: 'none',
                        paddingBottom: '4px',
                        paddingLeft: '4px',
                        paddingRight: '4px',
                        background: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
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
              </div>

              <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                <div
                  className="overflow-y-auto"
                  style={{
                    maxHeight: '380px',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
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

                {activeTab === 'SPECIAL OFFERS' && (
                  <div className="py-2">
                    <AdminSpecialOffer ref={specialOfferRef} embedded />
                  </div>
                )}

                {activeTab === 'NEWSLETTER' && (
                  <NewsletterPanel
                    ref={newsletterRef}
                    onCountsChange={handleNewsletterCounts}
                    onCanSendChange={setNewsletterCanSend}
                  />
                )}
                </div>
              </div>
            </div>

            {activeTab === 'NEWSLETTER' && (
              <PageActionsBelowCard>
                <button
                  type="button"
                  onClick={() => newsletterRef.current?.openSendConfirm()}
                  disabled={!newsletterCanSend}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={pageActionButtonStyle}
                >
                  SEND NEWSLETTER
                </button>
              </PageActionsBelowCard>
            )}

            {activeTab === 'SPECIAL OFFERS' && (
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
  );
}
