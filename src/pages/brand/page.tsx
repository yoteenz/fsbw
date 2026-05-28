import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { getBrandCardHeaderTitle, getBrandNavTitle } from '../../constants/brandMenu';
import { clearAppAuth } from '../../utils/adminAuth';
import { ShopMobileMenuShopTab } from '../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../components/shop/useShopNavSearchBar';
import BrandAboutUsBody from '../../components/brand/BrandAboutUsBody';
import BrandContactSection from '../../components/brand/BrandContactSection';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../layouts/PageActionsBelowCard';
import BrandMemberSection from '../../components/brand/BrandMemberSection';
import BrandReviewsEmptyState from '../../components/brand/BrandReviewsEmptyState';
import BrandFaqPageContent from '../../components/brand/BrandFaqPageContent';
import BrandTermsBody from '../../components/brand/BrandTermsBody';
import PremiumSubscriptionUpgradeChart from '../../components/membership/PremiumSubscriptionUpgradeChart';
import { usePremiumSubscriptionUpgrade } from '../../hooks/usePremiumSubscriptionUpgrade';
import { isMockDataAccount } from '../../utils/adminAuth';

const VALID_SLUGS: string[] = ['about', 'contact', 'member', 'faq', 'reviews', 'terms'];

/** Max height when brand main card scrolls (contact form, member premium chart). */
const BRAND_PAGE_MAIN_CARD_HEIGHT = 'calc(100dvh - 80px)';

/** Empty Reviews shell matches Become a Member main card height (not About). */
const BRAND_SLUGS_MATCH_MEMBER_CARD_HEIGHT = new Set(['reviews']);

function BrandPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const { slug: paramSlug } = useParams<{ slug?: string }>();
  const slug = paramSlug || (location.pathname.startsWith('/brand/') ? location.pathname.replace(/^\/brand\/?/, '').split('/')[0] : '') || 'about';
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState<'SHOP' | 'TOOLS' | 'BRAND'>('BRAND');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [showContactSuccessModal, setShowContactSuccessModal] = useState(false);
  const [faqQuestionSubmitting, setFaqQuestionSubmitting] = useState(false);
  const [showFaqQuestionSuccessModal, setShowFaqQuestionSuccessModal] = useState(false);

  const memberHasPremiumSubscription = (() => {
    if (!isSignedIn) return false;
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) return false;
      const user = JSON.parse(currentUser);
      return (
        (Boolean(user?.subscriptionTier) && user?.membershipType === 'PREMIUM') ||
        (isMockDataAccount(user) && (user?.membershipType === 'PREMIUM' || user?.membershipType === 'Premium'))
      );
    } catch {
      return false;
    }
  })();


  const memberPremium = usePremiumSubscriptionUpgrade({
    hasPremiumSubscription: memberHasPremiumSubscription,
  });

  useEffect(() => {
    if (slug !== 'member' && memberPremium.showPremiumChart) {
      memberPremium.closePremiumChart();
    }
  }, [slug, memberPremium.showPremiumChart, memberPremium.closePremiumChart]);

  const handleMemberUpgradeClick = () => {
    if (!isSignedIn) {
      navigate(signInHrefWithReturnTo(location));
      return;
    }
    memberPremium.handleUpgradeAction();
  };
  const handleBrandSubmitReviewClick = () => {
    if (isSignedIn) {
      navigate('/account/orders');
      return;
    }
    navigate(`/sign-in?returnTo=${encodeURIComponent('/account/orders')}`);
  };


  const validSlug = slug && VALID_SLUGS.includes(slug);
  const navTitle = validSlug ? getBrandNavTitle(slug) : 'ABOUT';
  const cardHeaderTitle = validSlug ? getBrandCardHeaderTitle(slug) : 'MISSION STATEMENT';

  /** Tall content only: cap card height and scroll inside; short pages hug content (no viewport gap). */
  const brandMainCardScrollable =
    slug === 'contact' || slug === 'faq' || slug === 'terms' || (slug === 'member' && memberPremium.showPremiumChart);

  const hideMemberCardHeader = slug === 'member' && memberPremium.showPremiumChart;

  const brandMainCardMatchMemberHeight = BRAND_SLUGS_MATCH_MEMBER_CARD_HEIGHT.has(slug);

  const memberMainCardMeasureRef = useRef<HTMLDivElement>(null);
  const [memberMainCardMinHeightPx, setMemberMainCardMinHeightPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = memberMainCardMeasureRef.current;
    if (!node) return;

    const measure = () => {
      setMemberMainCardMinHeightPx(node.offsetHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (slug && !VALID_SLUGS.includes(slug)) {
      navigate('/brand/about', { replace: true });
    }
  }, [slug, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => setCartCount(event.detail);
    const handleStorageChange = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
      } catch (e) {
        setCartCount(0);
      }
    };
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuTabClick = (tab: 'SHOP' | 'TOOLS' | 'BRAND') => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      clearAppAuth();
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
    }
    navigate(signInHrefWithReturnTo(location));
  };
  const handleBack = () => navigate(-1);

  if (!validSlug && slug) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10">
        <div
          className="flex flex-col py-5 px-4"
          style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', position: 'relative' }}
        >
          <div
            ref={memberMainCardMeasureRef}
            aria-hidden
            className="border border-black bg-white/60 backdrop-blur-sm p-4 w-full flex flex-col mb-2"
            style={{
              borderWidth: '1.3px',
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              visibility: 'hidden',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '12px',
                color: '#EB1C24',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                fontWeight: '500',
                flexShrink: 0,
              }}
            >
              {getBrandCardHeaderTitle('member')}
            </p>
            <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '12px', flexShrink: 0 }} />
            <BrandMemberSection />
          </div>
          {/* HEADER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}>
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} className="cursor-pointer" style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}>
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleBack} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}>
                    <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                  </button>
                  <SearchTrigger className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img alt="" width="16" height="15" src="/assets/search-icon.svg" />
                  </SearchTrigger>
                </>
              )}
            </div>
            <NavCenter showMobileMenu={showMobileMenu}>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)', margin: 0 }}>
                {showMobileMenu ? (
                  <>
                    <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/lobby')}>HOME &gt;</span>{' '}
                    <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400' }}>BRAND &gt;</span>{' '}
                    <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>{navTitle}</span>
                  </>
                )}
              </p>
            </NavCenter>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="18" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" onClick={handleMobileMenuToggle} style={{ marginTop: '2px' }}>
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" />
                </svg>
              </div>
            </div>
          </div>

          {showMobileMenu ? (
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
              style={{ borderWidth: '1.3px', minWidth: '100%', maxWidth: 'none', overflow: 'visible', backgroundColor: 'rgba(255, 255, 255, 0.6)', minHeight: BRAND_PAGE_MAIN_CARD_HEIGHT, height: BRAND_PAGE_MAIN_CARD_HEIGHT }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {(['SHOP', 'TOOLS', 'BRAND'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleMobileMenuTabClick(tab)}
                      style={{
                        fontFamily: mobileMenuActiveTab === tab ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === tab ? '#EB1C24' : 'black',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        borderBottom: mobileMenuActiveTab === tab ? '1px solid #EB1C24' : 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (

                      <ShopMobileMenuToolsTab

                        navigate={navigate}

                        closeMenu={() => setShowMobileMenu(false)}

                        labelTranslateX="13px"

                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                            />
                    )}
                  </div>
                </div>
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span onClick={handleMobileMenuSignInToggle} style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
              </div>
            </div>
          ) : (
            <>
            <div className="flex flex-col gap-4">
              <div
                className="border border-black bg-white/60 backdrop-blur-sm p-4 w-full flex flex-col mb-2"
                style={{
                  borderWidth: '1.3px',
                  ...(brandMainCardScrollable
                    ? {
                        maxHeight: BRAND_PAGE_MAIN_CARD_HEIGHT,
                        overflow: 'hidden',
                      }
                    : brandMainCardMatchMemberHeight && memberMainCardMinHeightPx != null
                      ? {
                          height: memberMainCardMinHeightPx,
                          minHeight: memberMainCardMinHeightPx,
                          boxSizing: 'border-box',
                        }
                      : {}),
                }}
              >
                {!hideMemberCardHeader ? (
                  <>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '12px',
                        color: '#EB1C24',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        flexShrink: 0,
                      }}
                    >
                      {cardHeaderTitle}
                    </p>
                    <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '12px', flexShrink: 0 }} />
                  </>
                ) : null}
                <div
                  style={
                    brandMainCardScrollable
                      ? { flex: 1, minHeight: 0, overflowY: 'auto' }
                      : brandMainCardMatchMemberHeight
                        ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }
                        : undefined
                  }
                >
                  {slug === 'about' ? (
                    <BrandAboutUsBody />
                  ) : slug === 'member' ? (
                    memberPremium.showPremiumChart ? (
                      <PremiumSubscriptionUpgradeChart
                        embedded
                        onClose={memberPremium.closePremiumChart}
                        hasPremiumSubscription={memberHasPremiumSubscription}
                        selectedTier={memberPremium.selectedTier}
                        setSelectedTier={memberPremium.setSelectedTier}
                        showAllBenefits={memberPremium.showAllBenefits}
                        setShowAllBenefits={memberPremium.setShowAllBenefits}
                        formatPrice={memberPremium.formatPrice}
                        subscriptionTiers={memberPremium.subscriptionTiers}
                      />
                    ) : (
                      <BrandMemberSection />
                    )
                  ) : slug === 'contact' ? (
                    <BrandContactSection
                      formId="brand-contact-form"
                      onSubmittingChange={setContactSubmitting}
                      onSubmitted={() => setShowContactSuccessModal(true)}
                    />
                  ) : slug === 'reviews' ? (
                    <BrandReviewsEmptyState />
                  ) : slug === 'faq' ? (
                    <BrandFaqPageContent
                      formId="brand-faq-question-form"
                      onSubmittingChange={setFaqQuestionSubmitting}
                      onSubmitted={() => setShowFaqQuestionSuccessModal(true)}
                    />
                  ) : slug === 'terms' ? (
                    <BrandTermsBody />
                  ) : null}
                </div>
              </div>
            </div>
            {slug === 'about' ? (
              <PageActionsBelowCard>
                <button
                  type="button"
                  onClick={() => navigate('/lobby')}
                  className="w-full py-2 border border-black text-center cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  HOME PAGE
                </button>
              </PageActionsBelowCard>
            ) : null}
            {slug === 'contact' ? (
              <PageActionsBelowCard>
                <button
                  type="submit"
                  form="brand-contact-form"
                  disabled={contactSubmitting}
                  className="w-full py-2 border border-black text-center cursor-pointer hover:bg-gray-50 disabled:opacity-60"
                  style={pageActionButtonStyle}
                >
                  {contactSubmitting ? 'SENDING…' : 'SEND MESSAGE'}
                </button>
              </PageActionsBelowCard>
            ) : null}
            {slug === 'member' ? (
              <PageActionsBelowCard>
                <button
                  type="button"
                  onClick={handleMemberUpgradeClick}
                  className="w-full py-2 border border-black text-center cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  {memberPremium.showPremiumChart ? 'CONFIRM SUBSCRIPTION' : 'UPGRADE SUBSCRIPTION'}
                </button>
              </PageActionsBelowCard>
            ) : null}
            {slug === 'reviews' ? (
              <PageActionsBelowCard>
                <button
                  type="button"
                  onClick={handleBrandSubmitReviewClick}
                  className="w-full py-2 border border-black text-center cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  SUBMIT REVIEW
                </button>
              </PageActionsBelowCard>
            ) : null}
            {slug === 'faq' ? (
              <PageActionsBelowCard>
                <button
                  type="submit"
                  form="brand-faq-question-form"
                  disabled={faqQuestionSubmitting}
                  className="w-full py-2 border border-black text-center cursor-pointer hover:bg-gray-50 disabled:opacity-60"
                  style={pageActionButtonStyle}
                >
                  {faqQuestionSubmitting ? 'SUBMITTING…' : 'SUBMIT'}
                </button>
              </PageActionsBelowCard>
            ) : null}
            <ConfirmationModal
              isOpen={memberPremium.showValidationModal}
              onClose={() => memberPremium.setShowValidationModal(false)}
              onConfirm={() => memberPremium.setShowValidationModal(false)}
              title="FORGETTING SOMETHING?"
              message="PLEASE SELECT A SUBSCRIPTION TIER TO CONTINUE."
              confirmText="OK"
              cancelText=""
              dataAttribute="subscription-validation"
            />
            <ConfirmationModal
              isOpen={showContactSuccessModal}
              onClose={() => setShowContactSuccessModal(false)}
              onConfirm={() => setShowContactSuccessModal(false)}
              title="MESSAGE SENT"
              message="YOUR MESSAGE HAS BEEN SUBMITTED. PLEASE ALLOW AT LEAST 72 HOURS FOR A RESPONSE."
              confirmText="OK"
              cancelText=""
            />
            <ConfirmationModal
              isOpen={showFaqQuestionSuccessModal}
              onClose={() => setShowFaqQuestionSuccessModal(false)}
              onConfirm={() => setShowFaqQuestionSuccessModal(false)}
              title="QUESTION SENT"
              message="YOUR QUESTION HAS BEEN SUBMITTED. IF SELECTED, IT MAY BE ADDED TO OUR FAQ. PLEASE ALLOW AT LEAST 72 HOURS FOR A RESPONSE."
              confirmText="OK"
              cancelText=""
            />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrandPage;
