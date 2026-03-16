import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import ConfirmationModal from '../../../components/ConfirmationModal';

interface PaymentEntry {
  cardholder?: string;
  cardNumber?: string;
  cardBrand?: string;
  expirationDate?: string;
  billingZip?: string;
  isDefault?: boolean;
  savedAt?: string;
}

function getCardBrandFromNumber(fullNumber: string): string {
  const digits = fullNumber.replace(/\D/g, '');
  if (digits.length < 4) return 'card';
  if (digits.startsWith('4')) return 'visa';
  if (digits.startsWith('5') && /^5[1-5]/.test(digits)) return 'mastercard';
  if (/^5[6-9]|^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (digits.startsWith('6011') || digits.startsWith('65') || /^64[4-9]/.test(digits)) return 'discover';
  return 'card';
}

function PaymentPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') return 'TOOLS';
    if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) return 'BRAND';
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [userData, setUserData] = useState<any>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const currentUser = localStorage.getItem('currentUser');
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [saveAsDefaultPayment, setSaveAsDefaultPayment] = useState(true);
  const [paymentToRemove, setPaymentToRemove] = useState<PaymentEntry | null>(null);
  const [invalidPaymentFields, setInvalidPaymentFields] = useState<Set<string>>(new Set());
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [newCardholder, setNewCardholder] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newExpirationDate, setNewExpirationDate] = useState('');
  const [newCvv, setNewCvv] = useState('');
  const [newBillingZip, setNewBillingZip] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => setCartCount(event.detail);
    const handleStorageChange = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) setUserData(JSON.parse(currentUser));
      } catch (e) {
        setCartCount(0);
      }
    };
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('signInStateChanged', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Clear payment-method card "new card" alerts when user visits payment page (they've seen the cards).
  // Always dispatch so account profile re-evaluates and the alert doesn't persist.
  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser');
      const parsed = user ? JSON.parse(user) : null;
      const email = parsed?.email;
      if (email) {
        const raw = localStorage.getItem(`savedCards_${email}`);
        if (raw) {
          const cards = JSON.parse(raw);
          if (Array.isArray(cards)) {
            cards.forEach((card: { id?: string }) => {
              if (card.id) localStorage.setItem(`cardSeen_${card.id}`, 'true');
            });
          }
        }
      }
      window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    } catch (_) {}
  }, []);

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuTabClick = (tab: string) => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
    }
    navigate('/sign-in');
  };
  const handleBack = () => navigate('/account');

  const setDefaultPaymentMethod = (entry: PaymentEntry) => {
    const email = (userData?.email || '').trim().toLowerCase();
    if (!email) return;
    try {
      const current = localStorage.getItem('currentUser');
      if (!current) return;
      const user = JSON.parse(current);
      if ((user.email || '').trim().toLowerCase() !== email) return;
      const updatedUser = { ...user, defaultPaymentMethod: { ...entry, isDefault: true } };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], defaultPaymentMethod: updatedUser.defaultPaymentMethod };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      setUserData(updatedUser);
    } catch (_e) {}
  };

  const removePaymentMethod = (entry: PaymentEntry) => {
    const email = (userData?.email || '').trim().toLowerCase();
    if (!email) return;
    try {
      const current = localStorage.getItem('currentUser');
      if (!current) return;
      const user = JSON.parse(current);
      if ((user.email || '').trim().toLowerCase() !== email) return;
      const saved = Array.isArray(user.savedPaymentMethods) ? user.savedPaymentMethods : [];
      const defaultPay = user.defaultPaymentMethod;
      const isSame = (a: PaymentEntry, b: PaymentEntry) =>
        (a.cardNumber === b.cardNumber && a.cardholder === b.cardholder);
      const newSaved = saved.filter((p: PaymentEntry) => !isSame(p, entry));
      const wasDefault = defaultPay && isSame(defaultPay, entry);
      const updatedUser = {
        ...user,
        savedPaymentMethods: newSaved,
        defaultPaymentMethod: wasDefault ? null : user.defaultPaymentMethod
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], savedPaymentMethods: updatedUser.savedPaymentMethods, defaultPaymentMethod: updatedUser.defaultPaymentMethod };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      setUserData(updatedUser);
    } catch (_e) {}
  };

  const openAddPaymentForm = () => {
    const hasAny = !!(userData?.defaultPaymentMethod || (userData?.savedPaymentMethods?.length));
    setSaveAsDefaultPayment(!hasAny || !userData?.defaultPaymentMethod);
    setInvalidPaymentFields(new Set());
    setShowAddPaymentForm(true);
  };

  const cancelAddPayment = () => {
    setShowAddPaymentForm(false);
    setInvalidPaymentFields(new Set());
    setNewCardholder('');
    setNewCardNumber('');
    setNewExpirationDate('');
    setNewCvv('');
    setNewBillingZip('');
  };

  const saveNewPaymentMethod = () => {
    const email = (userData?.email || '').trim().toLowerCase();
    if (!email) return;
    // Validate in order; show popup and highlight only the first missing field (same as checkout)
    if (!newCardholder.trim()) {
      setValidationMessage('CARDHOLDER NAME IS REQUIRED.');
      setInvalidPaymentFields(new Set(['cardholder']));
      setShowValidationModal(true);
      return;
    }
    if (!newCardNumber.replace(/\D/g, '').trim()) {
      setValidationMessage('CARD NUMBER IS REQUIRED.');
      setInvalidPaymentFields(new Set(['cardNumber']));
      setShowValidationModal(true);
      return;
    }
    if (!newExpirationDate.trim()) {
      setValidationMessage('EXPIRATION DATE IS REQUIRED.');
      setInvalidPaymentFields(new Set(['expirationDate']));
      setShowValidationModal(true);
      return;
    }
    if (!newBillingZip.trim()) {
      setValidationMessage('BILLING ZIP CODE IS REQUIRED.');
      setInvalidPaymentFields(new Set(['billingZip']));
      setShowValidationModal(true);
      return;
    }
    setInvalidPaymentFields(new Set());
    const digits = newCardNumber.replace(/\D/g, '');
    const last4 = digits.slice(-4);
    const cardBrand = getCardBrandFromNumber(digits);
    const isFirstCard = !(userData?.savedPaymentMethods?.length) && !userData?.defaultPaymentMethod?.cardNumber;
    const paymentMethodToSave = {
      cardholder: newCardholder.trim(),
      cardNumber: last4,
      cardBrand,
      expirationDate: newExpirationDate.trim(),
      billingZip: newBillingZip.trim(),
      isDefault: isFirstCard || saveAsDefaultPayment,
      savedAt: new Date().toISOString()
    };
    try {
      const current = localStorage.getItem('currentUser');
      if (!current) return;
      const user = JSON.parse(current);
      if ((user.email || '').trim().toLowerCase() !== email) return;
      const saved = Array.isArray(user.savedPaymentMethods) ? user.savedPaymentMethods : [];
      const updatedUser = {
        ...user,
        defaultPaymentMethod: (isFirstCard || saveAsDefaultPayment) ? paymentMethodToSave : user.defaultPaymentMethod,
        savedPaymentMethods: [...saved, paymentMethodToSave]
      };
      if (isFirstCard || saveAsDefaultPayment) updatedUser.defaultPaymentMethod = paymentMethodToSave;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], defaultPaymentMethod: updatedUser.defaultPaymentMethod, savedPaymentMethods: updatedUser.savedPaymentMethods };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      setUserData(updatedUser);
      setShowAddPaymentForm(false);
      setNewCardholder('');
      setNewCardNumber('');
      setNewExpirationDate('');
      setNewCvv('');
      setNewBillingZip('');
    } catch (_e) {}
  };

  const inputLabelStyle: React.CSSProperties = {
    fontFamily: '"Futura PT Book"',
    fontSize: '10px',
    color: '#000000',
    display: 'block',
    marginBottom: '4px',
    textTransform: 'uppercase'
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '36px',
    padding: '8px',
    border: '1.3px solid #000000',
    fontFamily: '"Futura PT Demi"',
    fontSize: '11px',
    backgroundColor: '#FFFFFF',
    color: '#808080',
    boxSizing: 'border-box',
    borderRadius: '0',
    outline: 'none',
    textTransform: 'uppercase'
  };
  // Match checkout expiration/billing zip box format; gray Futura Demi for consistency with other inputs
  const checkoutBoxStyle: React.CSSProperties = {
    height: '36px',
    padding: '8px',
    border: '1.3px solid #000000',
    fontFamily: '"Futura PT Demi"',
    fontSize: '11px',
    color: '#808080',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
    borderRadius: '0',
    outline: 'none'
  };
  const formatExpirationDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 4);
    if (limited.length >= 2) return limited.slice(0, 2) + '/' + limited.slice(2);
    return limited;
  };

  // Build list: default first, then savedPaymentMethods (avoid duplicate by last4)
  const paymentList: PaymentEntry[] = [];
  const defaultPay = userData?.defaultPaymentMethod;
  if (defaultPay && (defaultPay.cardholder || defaultPay.cardNumber)) {
    paymentList.push({ ...defaultPay, isDefault: true });
  }
  const saved = userData?.savedPaymentMethods || [];
  saved.forEach((p: PaymentEntry) => {
    const hasInfo = p.cardholder || p.cardNumber;
    const isDup = paymentList.some((e) => e.cardNumber === p.cardNumber && e.cardholder === p.cardholder);
    if (hasInfo && !isDup) paymentList.push(p);
  });

  const renderPaymentRow = (entry: PaymentEntry, index: number) => {
    const name = entry.cardholder || 'CARD ON FILE';
    const brand = entry.cardBrand || 'card';
    const brandDisplay = brand === 'amex' ? 'express' : brand;
    const last4 = entry.cardNumber ? `${brandDisplay} ending in ${entry.cardNumber}` : '';
    const expiry = entry.expirationDate ? `EXPIRES ${entry.expirationDate}` : '';

    return (
      <div key={index} style={{ marginBottom: '50px', marginLeft: '3px', ...(index === 0 && { marginTop: '6px' }), display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '15px', color: '#000000', margin: '0 0 6px 0', lineHeight: '1.2', textTransform: 'uppercase' }}>
            {name}
          </p>
          {last4 && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', margin: '0 0 4px 0', lineHeight: '1.4', textTransform: 'uppercase' }}>
              {last4}
            </p>
          )}
          {expiry && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
              {expiry}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '9px' }}>
            <div
              onClick={() => setDefaultPaymentMethod(entry)}
              style={{
                width: '14px',
                height: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.3px solid #000000',
                backgroundColor: 'transparent',
                position: 'relative'
              }}
            >
              {entry.isDefault && (
                <img src="/assets/checkbox.svg" alt="" style={{ width: '14px', height: '14px', position: 'absolute' }} />
              )}
            </div>
            <label
              onClick={() => setDefaultPaymentMethod(entry)}
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '10px',
                color: '#000000',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              DEFAULT PAYMENT
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPaymentToRemove(entry);
          }}
          aria-label="Remove card"
          style={{
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            transform: 'translateX(1px)'
          }}
        >
          <img
            src="/assets/close-icon.svg"
            alt="Remove"
            role="presentation"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPaymentToRemove(entry);
            }}
            style={{
              width: '14.5px',
              height: '14.5px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)'
            }}
          />
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .account-payment-card .account-payment-card-header,
        .account-payment-card .account-payment-card-header img {
          opacity: 1 !important;
          filter: none !important;
        }
        .account-payment-card .account-payment-card-fields input:focus {
          outline: none !important;
          box-shadow: none !important;
          background-color: #FFFFFF !important;
        }
        .account-payment-card .account-payment-card-fields input:-webkit-autofill,
        .account-payment-card .account-payment-card-fields input:-webkit-autofill:hover,
        .account-payment-card .account-payment-card-fields input:-webkit-autofill:focus,
        .account-payment-card .account-payment-card-fields input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 100px #FFFFFF inset !important;
          box-shadow: 0 0 0 100px #FFFFFF inset !important;
          background-color: #FFFFFF !important;
          -webkit-text-fill-color: #808080 !important;
          color: #808080 !important;
        }
        .account-payment-card .account-payment-card-fields input,
        .account-payment-card .account-payment-card-fields select {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", sans-serif !important;
          color: #808080 !important;
        }
      `}</style>
    <div className="min-h-screen" style={{ position: 'relative', minHeight: '100vh' }}>
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
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          {/* HEADER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}>
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')} className="cursor-pointer" style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}>
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleBack} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}>
                    <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/account')}>ACCOUNT &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>PAYMENT</span>
                </>
              )}
            </p>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
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
              style={{ borderWidth: '1.3px', minWidth: '100%', maxWidth: 'none', overflow: 'visible', backgroundColor: 'rgba(255, 255, 255, 0.6)', minHeight: '560px' }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {['SHOP', 'TOOLS', 'BRAND'].map((tab) => (
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
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/tools/gift-card')}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', transform: 'translateX(7px)' }}>GIFT CARD</span>
                      </div>
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between" style={{ alignItems: 'center' }}>
                            <span
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transform: 'translateX(7px)' }}
                              onClick={() => {
                                if (item.isExpandable) {
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) navigate('/shop/units');
                                  else handleMobileMenuItemToggle(item.label);
                                } else if (item.label === 'BUILD-A-WIG') navigate('/build-a-wig');
                                else if (item.label === 'ORDER AUTHORIZATION FORM') navigate('/shop/order-form');
                              }}
                            >
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-5px) translateY(-4px) rotate(90deg)' : 'translateX(-5px) translateY(-4px) rotate(0deg)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.isExpandable) handleMobileMenuItemToggle(item.label);
                                }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div style={{ marginLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {item.subItems.map((subItem, subIndex) => (
                                <span
                                  key={subIndex}
                                  style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}
                                  onClick={() => {
                                    if (item.label === 'UNITS') {
                                      if (subItem === 'STRAIGHT') navigate('/units/straight');
                                      else if (subItem === 'WAVY') navigate('/units/wavy');
                                      else if (subItem === 'CURLY') navigate('/units/curly');
                                    }
                                  }}
                                >
                                  {subItem}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span onClick={handleMobileMenuSignInToggle} style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>
                <SocialMenuIcons />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-5">
              <div
                className="account-payment-card border border-black bg-white/60 backdrop-blur-sm p-4 w-full"
                style={{
                  borderWidth: '1.3px',
                  /* Same as wishlist lists main card */
                  height: 'calc(100vh * 520 / 745)',
                  minHeight: 'calc(100vh * 520 / 745)',
                  maxHeight: 'calc(100vh * 520 / 745)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  ...(showAddPaymentForm && { paddingBottom: '24px' })
                }}
              >
                <div className="account-payment-card-header flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px', flexShrink: 0 }}>
                  <h2
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '12px',
                      fontWeight: '500',
                      margin: 0,
                      textTransform: 'uppercase'
                    }}
                  >
                    PAYMENT METHOD
                  </h2>
                  <img src="/assets/payment-icon.svg?v=2" alt="" className="account-payment-header-icon" style={{ width: 20, height: 20, opacity: 1 }} />
                </div>
                <div className="account-payment-card-fields" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {showAddPaymentForm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={inputLabelStyle}>CARDHOLDER<span style={{ color: '#EB1C24' }}>*</span></label>
                      <input
                        type="text"
                        value={newCardholder}
                        onChange={(e) => {
                          setNewCardholder(e.target.value.toUpperCase());
                          setInvalidPaymentFields((prev) => { const next = new Set(prev); next.delete('cardholder'); return next; });
                        }}
                        style={{ ...inputStyle, border: invalidPaymentFields.has('cardholder') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                      />
                    </div>
                    <div>
                      <label style={inputLabelStyle}>CARD NUMBER<span style={{ color: '#EB1C24' }}>*</span></label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={16}
                        value={newCardNumber}
                        onChange={(e) => {
                          setNewCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16));
                          setInvalidPaymentFields((prev) => { const next = new Set(prev); next.delete('cardNumber'); return next; });
                        }}
                        style={{ ...inputStyle, border: invalidPaymentFields.has('cardNumber') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={inputLabelStyle}>EXPIRATION<span style={{ color: '#EB1C24' }}>*</span></label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={5}
                          value={newExpirationDate}
                          onChange={(e) => {
                            setNewExpirationDate(formatExpirationDate(e.target.value));
                            setInvalidPaymentFields((prev) => { const next = new Set(prev); next.delete('expirationDate'); return next; });
                          }}
                          style={{ ...checkoutBoxStyle, width: '100%', border: invalidPaymentFields.has('expirationDate') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                        />
                      </div>
                      <div>
                        <label style={inputLabelStyle}>CVV</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          value={newCvv}
                          onChange={(e) => setNewCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          style={{ ...checkoutBoxStyle, width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={inputLabelStyle}>BILLING ZIP<span style={{ color: '#EB1C24' }}>*</span></label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          value={newBillingZip}
                          onChange={(e) => {
                            setNewBillingZip(e.target.value.replace(/\D/g, '').slice(0, 10));
                            setInvalidPaymentFields((prev) => { const next = new Set(prev); next.delete('billingZip'); return next; });
                          }}
                          style={{ ...checkoutBoxStyle, width: '100%', border: invalidPaymentFields.has('billingZip') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <div
                        onClick={() => paymentList.length > 0 && setSaveAsDefaultPayment(!saveAsDefaultPayment)}
                        style={{
                          width: '14px',
                          height: '14px',
                          cursor: paymentList.length === 0 ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative',
                          opacity: paymentList.length === 0 ? 0.8 : 1
                        }}
                      >
                        {(paymentList.length === 0 || saveAsDefaultPayment) && (
                          <img src="/assets/checkbox.svg" alt="" style={{ width: '14px', height: '14px', position: 'absolute' }} />
                        )}
                      </div>
                      <label
                        onClick={() => paymentList.length > 0 && setSaveAsDefaultPayment(!saveAsDefaultPayment)}
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: paymentList.length === 0 ? 'default' : 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        SAVE AS DEFAULT
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    {paymentList.length === 0 ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                        <p
                          style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                          dangerouslySetInnerHTML={{ __html: "YOU DON'T HAVE A PAYMENT METHOD ON FILE.<br>ADD A NEW ONE BELOW!" }}
                        />
                      </div>
                    ) : (
                      paymentList.map((entry, i) => renderPaymentRow(entry, i))
                    )}
                  </>
                )}
                </div>
              </div>
              {showAddPaymentForm ? (
                <>
                  <button
                    type="button"
                    onClick={saveNewPaymentMethod}
                    className="border border-black w-full py-2 font-medium"
                    style={{
                      borderWidth: '1.3px',
                      fontSize: '11px',
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      textTransform: 'uppercase',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      marginTop: '-5px'
                    }}
                  >
                    SAVE CARD
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddPayment}
                    className="border border-black w-full py-2 font-medium"
                    style={{
                      borderWidth: '1.3px',
                      fontSize: '11px',
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      textTransform: 'uppercase',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      marginTop: '-4px'
                    }}
                  >
                    CANCEL
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openAddPaymentForm}
                  className="border border-black w-full py-2 font-medium"
                  style={{
                    borderWidth: '1.3px',
                    fontSize: '11px',
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    marginTop: '-5px'
                  }}
                >
                  ADD NEW CARD
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      <ConfirmationModal
        isOpen={paymentToRemove !== null}
        onClose={() => setPaymentToRemove(null)}
        onConfirm={() => {
          if (paymentToRemove) {
            removePaymentMethod(paymentToRemove);
            setPaymentToRemove(null);
          }
        }}
        title="REMOVE CARD?"
        message={<>ARE YOU SURE YOU WANT TO REMOVE THIS CARD?<br />YOU CAN ADD IT AGAIN LATER.</>}
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="remove-payment-confirm"
      />

      {/* Required field validation modal (same as checkout) */}
      <ConfirmationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onConfirm={() => setShowValidationModal(false)}
        title="MISSING INPUT FIELD"
        message={validationMessage}
        confirmText="OK"
        cancelText="CLOSE"
        messageTextTransform="uppercase"
      />
    </>
  );
}

export default PaymentPage;
