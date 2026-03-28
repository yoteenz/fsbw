import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { clearAppAuth } from '../../../utils/adminAuth';

interface AddressEntry {
  firstName?: string;
  lastName?: string;
  address?: string;
  aptSuite?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  isDefault?: boolean;
}

function ShippingPage() {
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
    try {
      if (typeof window === 'undefined') return 'SHOP';
      const pathname = window.location.pathname || '';
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') return 'TOOLS';
      if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) return 'BRAND';
      return 'SHOP';
    } catch {
      return 'SHOP';
    }
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
      if (!currentUser) return null;
      return JSON.parse(currentUser);
    } catch (_e) {
      return null;
    }
  });
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [saveAsDefaultAddress, setSaveAsDefaultAddress] = useState(true);
  const [addressToRemove, setAddressToRemove] = useState<AddressEntry | null>(null);
  const [invalidAddressFields, setInvalidAddressFields] = useState<Set<string>>(new Set());
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newAptUnit, setNewAptUnit] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newCountry, setNewCountry] = useState<'US' | 'CA' | 'GB' | 'AU' | 'OTHER'>('US');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Clear shipping address card badge when user visits this page
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;
      const email = user?.email;
      if (email) {
        localStorage.removeItem(`shippingAddressAlert_${email}`);
        window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
      }
    } catch (_) {}
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

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuTabClick = (tab: string) => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      clearAppAuth();
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
    }
    navigate('/sign-in');
  };
  const handleBack = () => navigate('/account');

  const setDefaultAddress = (addr: AddressEntry) => {
    const email = (userData?.email || '').trim().toLowerCase();
    if (!email) return;
    try {
      const current = localStorage.getItem('currentUser');
      if (!current) return;
      const user = JSON.parse(current);
      if ((user.email || '').trim().toLowerCase() !== email) return;
      const updatedUser = { ...user, defaultAddress: { ...addr, isDefault: true } };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], defaultAddress: updatedUser.defaultAddress };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      setUserData(updatedUser);
    } catch (_e) {}
  };

  const removeAddress = (addr: AddressEntry) => {
    const email = (userData?.email || '').trim().toLowerCase();
    if (!email) return;
    try {
      const current = localStorage.getItem('currentUser');
      if (!current) return;
      const user = JSON.parse(current);
      if ((user.email || '').trim().toLowerCase() !== email) return;
      const saved = Array.isArray(user.savedAddresses) ? user.savedAddresses : [];
      const defaultAddr = user.defaultAddress;
      const isSame = (a: AddressEntry, b: AddressEntry) =>
        (a.address === b.address &&
          (a.aptSuite || '') === (b.aptSuite || '') &&
          a.city === b.city &&
          a.zip === b.zip &&
          a.firstName === b.firstName &&
          a.lastName === b.lastName);
      const newSaved = saved.filter((a: AddressEntry) => !isSame(a, addr));
      const wasDefault = defaultAddr && isSame(defaultAddr, addr);
      const updatedUser = {
        ...user,
        savedAddresses: newSaved,
        defaultAddress: wasDefault ? null : user.defaultAddress
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], savedAddresses: updatedUser.savedAddresses, defaultAddress: updatedUser.defaultAddress };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      setUserData(updatedUser);
    } catch (_e) {}
  };

  const openAddAddressForm = () => {
    const hasAny = !!(userData?.defaultAddress || userData?.shippingAddress || (userData?.savedAddresses?.length));
    setSaveAsDefaultAddress(!hasAny || !userData?.defaultAddress);
    setNewEmail(userData?.email || '');
    setNewPhone(userData?.phoneNumber || '');
    setShowAddAddressForm(true);
  };

  const cancelAddAddress = () => {
    setShowAddAddressForm(false);
    setInvalidAddressFields(new Set());
    setNewFirstName('');
    setNewLastName('');
    setNewAddress('');
    setNewAptUnit('');
    setNewCity('');
    setNewState('');
    setNewZip('');
    setNewCountry('US');
    setNewPhone('');
    setNewEmail('');
  };

  const saveNewAddress = () => {
    const email = (userData?.email || '').trim().toLowerCase();
    if (!email) return;
    // Validate in order; show popup and highlight only the first missing field (same as checkout)
    if (!newFirstName.trim()) {
      setValidationMessage('FIRST NAME IS REQUIRED.');
      setInvalidAddressFields(new Set(['firstName']));
      setShowValidationModal(true);
      return;
    }
    if (!newLastName.trim()) {
      setValidationMessage('LAST NAME IS REQUIRED.');
      setInvalidAddressFields(new Set(['lastName']));
      setShowValidationModal(true);
      return;
    }
    if (!newAddress.trim()) {
      setValidationMessage('ADDRESS IS REQUIRED.');
      setInvalidAddressFields(new Set(['address']));
      setShowValidationModal(true);
      return;
    }
    if (!newCity.trim()) {
      setValidationMessage('CITY IS REQUIRED.');
      setInvalidAddressFields(new Set(['city']));
      setShowValidationModal(true);
      return;
    }
    if (!newState.trim()) {
      setValidationMessage('STATE IS REQUIRED.');
      setInvalidAddressFields(new Set(['state']));
      setShowValidationModal(true);
      return;
    }
    if (!newZip.trim()) {
      setValidationMessage('ZIP CODE IS REQUIRED.');
      setInvalidAddressFields(new Set(['zip']));
      setShowValidationModal(true);
      return;
    }
    if (!newCountry?.trim()) {
      setValidationMessage('COUNTRY IS REQUIRED.');
      setInvalidAddressFields(new Set(['country']));
      setShowValidationModal(true);
      return;
    }
    if (!newPhone.trim()) {
      setValidationMessage('PHONE NUMBER IS REQUIRED.');
      setInvalidAddressFields(new Set(['phoneNumber']));
      setShowValidationModal(true);
      return;
    }
    setInvalidAddressFields(new Set());
    const addressEntry: AddressEntry = {
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      address: newAddress.trim(),
      ...(newAptUnit.trim() ? { aptSuite: newAptUnit.trim() } : {}),
      city: newCity.trim(),
      state: newState.trim(),
      zip: newZip.trim(),
      country: countryCodeToFullName(newCountry || 'US'),
      phoneNumber: newPhone.trim(),
      email: newEmail.trim() || email,
      isDefault: saveAsDefaultAddress
    };
    try {
      const current = localStorage.getItem('currentUser');
      if (!current) return;
      const user = JSON.parse(current);
      if ((user.email || '').trim().toLowerCase() !== email) return;
      const saved = Array.isArray(user.savedAddresses) ? user.savedAddresses : [];
      const updatedUser = {
        ...user,
        defaultAddress: saveAsDefaultAddress ? addressEntry : user.defaultAddress,
        savedAddresses: [...saved, addressEntry]
      };
      if (saveAsDefaultAddress) {
        updatedUser.defaultAddress = addressEntry;
      }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], defaultAddress: updatedUser.defaultAddress, savedAddresses: updatedUser.savedAddresses };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      setUserData(updatedUser);
      setShowAddAddressForm(false);
      setNewFirstName('');
      setNewLastName('');
      setNewAddress('');
      setNewAptUnit('');
      setNewCity('');
      setNewState('');
      setNewZip('');
      setNewCountry('US');
      setNewPhone('');
      setNewEmail('');
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

  // Build list of addresses: default first, then any savedAddresses (avoid dupes by address line)
  const addressList: AddressEntry[] = [];
  try {
    const defaultAddr = userData?.defaultAddress || userData?.shippingAddress;
    if (defaultAddr && typeof defaultAddr === 'object' && (defaultAddr.address || defaultAddr.city)) {
      addressList.push({ ...defaultAddr, isDefault: true });
    }
    const saved = Array.isArray(userData?.savedAddresses) ? userData.savedAddresses : [];
    saved.forEach((a: AddressEntry) => {
      if (!a || typeof a !== 'object') return;
      if (!a.address && !a.city) return;
      const isDuplicate = addressList.some(
        (e) =>
          e.address === a.address &&
          (e.aptSuite || '') === (a.aptSuite || '') &&
          e.city === a.city &&
          e.zip === a.zip
      );
      if (!isDuplicate) addressList.push(a);
    });
  } catch (_e) {
    // ignore malformed userData
  }

  const formatCountry = (c: string | undefined) => {
    if (c == null || typeof c !== 'string') return '';
    const u = c.trim().toUpperCase();
    if (u === 'US' || u === 'USA') return 'UNITED STATES OF AMERICA';
    if (u === 'UNITED STATES' || u === 'UNITED STATES OF AMERICA') return 'UNITED STATES OF AMERICA';
    return u;
  };
  const countryCodeToFullName = (code: string): string => {
    const map: Record<string, string> = {
      US: 'UNITED STATES OF AMERICA',
      CA: 'CANADA',
      GB: 'UNITED KINGDOM',
      AU: 'AUSTRALIA',
      OTHER: 'OTHER'
    };
    return map[code] || code;
  };

  const renderAddress = (addr: AddressEntry, index: number) => {
    if (!addr || typeof addr !== 'object') return null;
    const name = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : '');
    const line1 = addr.address || '';
    const lineApt = (addr.aptSuite || '').trim();
    const cityStateZip = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
    const country = formatCountry(addr.country);
    const phone = addr.phoneNumber || '';
    const email = addr.email || userData?.email || '';

    return (
      <div key={index} style={{ marginBottom: '50px', marginLeft: '3px', ...(index === 0 && { marginTop: '6px' }), display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {name && (
            <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '15px', color: '#000000', margin: '0 0 6px 0', lineHeight: '1.2', textTransform: 'uppercase' }}>
              {name}
            </p>
          )}
          {line1 && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: '0 0 4px 0', lineHeight: '1.4', textTransform: 'uppercase' }}>
              {line1}
            </p>
          )}
          {lineApt && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: '0 0 4px 0', lineHeight: '1.4', textTransform: 'uppercase' }}>
              {lineApt}
            </p>
          )}
          {cityStateZip && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: '0 0 4px 0', lineHeight: '1.4', textTransform: 'uppercase' }}>
              {cityStateZip}
            </p>
          )}
          {country && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: '0 0 4px 0', lineHeight: '1.4', textTransform: 'uppercase' }}>
              {country}
            </p>
          )}
          {phone && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
              {phone}
            </p>
          )}
          {email && (
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: '3px 0 0 0', textTransform: 'uppercase' }}>
              {email}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '9px' }}>
            <div
              onClick={() => setDefaultAddress(addr)}
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
              {addr.isDefault && (
                <img src="/assets/checkbox.svg" alt="" style={{ width: '14px', height: '14px', position: 'absolute' }} />
              )}
            </div>
            <label
              onClick={() => setDefaultAddress(addr)}
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '10px',
                color: '#000000',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              DEFAULT ADDRESS
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setAddressToRemove(addr);
          }}
          aria-label="Remove address"
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
              setAddressToRemove(addr);
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
        .shipping-address-select {
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-image: url('/assets/dropdown.svg') !important;
          background-repeat: no-repeat !important;
          background-position: right 8px center !important;
          background-size: 7.2px !important;
          padding-right: 28px !important;
        }
        .account-shipping-card .account-shipping-card-header,
        .account-shipping-card .account-shipping-card-header img {
          opacity: 1 !important;
          filter: none !important;
        }
        .account-shipping-card .account-shipping-card-fields input:focus {
          outline: none !important;
          box-shadow: none !important;
          background-color: #FFFFFF !important;
        }
        .account-shipping-card .account-shipping-card-fields input:-webkit-autofill,
        .account-shipping-card .account-shipping-card-fields input:-webkit-autofill:hover,
        .account-shipping-card .account-shipping-card-fields input:-webkit-autofill:focus,
        .account-shipping-card .account-shipping-card-fields input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 100px #FFFFFF inset !important;
          box-shadow: 0 0 0 100px #FFFFFF inset !important;
          background-color: #FFFFFF !important;
          -webkit-text-fill-color: #808080 !important;
          color: #808080 !important;
        }
        .account-shipping-card .account-shipping-card-fields input,
        .account-shipping-card .account-shipping-card-fields select {
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
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>SHIPPING</span>
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
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', transform: 'translateX(13px)' }}>GIFT CARD</span>
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
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transform: 'translateX(13px)' }}
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
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-11px) translateY(-4px) rotate(90deg)' : 'translateX(-11px) translateY(-4px) rotate(0deg)'}`,
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
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-5">
              <div
                className="account-shipping-card border border-black bg-white/60 backdrop-blur-sm p-4 w-full"
                style={{
                  borderWidth: '1.3px',
                  /* Same as wishlist lists main card; add-address form scrolls inside fields area */
                  height: 'calc(100vh * 520 / 745)',
                  minHeight: 'calc(100vh * 520 / 745)',
                  maxHeight: 'calc(100vh * 520 / 745)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div className="account-shipping-card-header flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px', flexShrink: 0 }}>
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
                    SHIPPING ADDRESS
                  </h2>
                  <img src="/assets/ship-icon.svg" alt="" className="account-shipping-header-icon" style={{ width: 15, height: 15, opacity: 1 }} />
                </div>
                <div
                  className="account-shipping-card-fields"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    paddingBottom: showAddAddressForm ? '8px' : 0,
                  }}
                >
                {showAddAddressForm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={inputLabelStyle}>FIRST NAME<span style={{ color: '#EB1C24' }}>*</span></label>
                        <input
                          type="text"
                          value={newFirstName}
                          onChange={(e) => {
                            setNewFirstName(e.target.value.toUpperCase());
                            setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('firstName'); return next; });
                          }}
                          style={{ ...inputStyle, border: invalidAddressFields.has('firstName') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                        />
                      </div>
                      <div>
                        <label style={inputLabelStyle}>LAST NAME<span style={{ color: '#EB1C24' }}>*</span></label>
                        <input
                          type="text"
                          value={newLastName}
                          onChange={(e) => {
                            setNewLastName(e.target.value.toUpperCase());
                            setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('lastName'); return next; });
                          }}
                          style={{ ...inputStyle, border: invalidAddressFields.has('lastName') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={inputLabelStyle}>ADDRESS<span style={{ color: '#EB1C24' }}>*</span></label>
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => {
                          setNewAddress(e.target.value.toUpperCase());
                          setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('address'); return next; });
                        }}
                        style={{ ...inputStyle, border: invalidAddressFields.has('address') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                      />
                    </div>
                    <div>
                      <label style={inputLabelStyle}>APT, UNIT, SUITE</label>
                      <input
                        type="text"
                        value={newAptUnit}
                        onChange={(e) => setNewAptUnit(e.target.value.toUpperCase())}
                        style={{ ...inputStyle, border: '1.3px solid #000000' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={inputLabelStyle}>CITY<span style={{ color: '#EB1C24' }}>*</span></label>
                        <input
                          type="text"
                          maxLength={40}
                          value={newCity}
                          onChange={(e) => {
                            setNewCity(e.target.value.toUpperCase());
                            setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('city'); return next; });
                          }}
                          style={{ ...inputStyle, border: invalidAddressFields.has('city') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                        />
                      </div>
                      <div>
                        <label style={inputLabelStyle}>STATE<span style={{ color: '#EB1C24' }}>*</span></label>
                        {newCountry === 'US' ? (
                          <select
                            className="shipping-address-select"
                            value={newState}
                            onChange={(e) => {
                              setNewState(e.target.value);
                              setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('state'); return next; });
                            }}
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '8px',
                              border: invalidAddressFields.has('state') ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                              fontFamily: '"Futura PT Demi"',
                              fontSize: '11px',
                              color: '#808080',
                              backgroundColor: '#FFFFFF',
                              boxSizing: 'border-box',
                              borderRadius: '0'
                            }}
                          >
                            <option value=""></option>
                            <option value="AL">AL</option>
                            <option value="AK">AK</option>
                            <option value="AZ">AZ</option>
                            <option value="AR">AR</option>
                            <option value="CA">CA</option>
                            <option value="CO">CO</option>
                            <option value="CT">CT</option>
                            <option value="DE">DE</option>
                            <option value="FL">FL</option>
                            <option value="GA">GA</option>
                            <option value="HI">HI</option>
                            <option value="ID">ID</option>
                            <option value="IL">IL</option>
                            <option value="IN">IN</option>
                            <option value="IA">IA</option>
                            <option value="KS">KS</option>
                            <option value="KY">KY</option>
                            <option value="LA">LA</option>
                            <option value="ME">ME</option>
                            <option value="MD">MD</option>
                            <option value="MA">MA</option>
                            <option value="MI">MI</option>
                            <option value="MN">MN</option>
                            <option value="MS">MS</option>
                            <option value="MO">MO</option>
                            <option value="MT">MT</option>
                            <option value="NE">NE</option>
                            <option value="NV">NV</option>
                            <option value="NH">NH</option>
                            <option value="NJ">NJ</option>
                            <option value="NM">NM</option>
                            <option value="NY">NY</option>
                            <option value="NC">NC</option>
                            <option value="ND">ND</option>
                            <option value="OH">OH</option>
                            <option value="OK">OK</option>
                            <option value="OR">OR</option>
                            <option value="PA">PA</option>
                            <option value="RI">RI</option>
                            <option value="SC">SC</option>
                            <option value="SD">SD</option>
                            <option value="TN">TN</option>
                            <option value="TX">TX</option>
                            <option value="UT">UT</option>
                            <option value="VT">VT</option>
                            <option value="VA">VA</option>
                            <option value="WA">WA</option>
                            <option value="WV">WV</option>
                            <option value="WI">WI</option>
                            <option value="WY">WY</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            maxLength={30}
                            value={newState}
                            onChange={(e) => {
                              setNewState(e.target.value.toUpperCase());
                              setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('state'); return next; });
                            }}
                            style={{ ...checkoutBoxStyle, width: '100%', border: invalidAddressFields.has('state') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                          />
                        )}
                      </div>
                      <div>
                        <label style={inputLabelStyle}>ZIP<span style={{ color: '#EB1C24' }}>*</span></label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          value={newZip}
                          onChange={(e) => {
                            setNewZip(e.target.value.replace(/\D/g, '').slice(0, 10));
                            setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('zip'); return next; });
                          }}
                          style={{ ...checkoutBoxStyle, width: '100%', border: invalidAddressFields.has('zip') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={inputLabelStyle}>COUNTRY<span style={{ color: '#EB1C24' }}>*</span></label>
                      <select
                        className="shipping-address-select"
                        value={newCountry}
                        onChange={(e) => {
                          setNewCountry(e.target.value as 'US' | 'CA' | 'GB' | 'AU' | 'OTHER');
                          if (e.target.value !== 'US') setNewState('');
                          setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('country'); return next; });
                        }}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: invalidAddressFields.has('country') ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          fontFamily: '"Futura PT Demi"',
                          fontSize: '11px',
                          color: '#808080',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                          borderRadius: '0'
                        }}
                      >
                        <option value="US">UNITED STATES</option>
                        <option value="CA">CANADA</option>
                        <option value="GB">UNITED KINGDOM</option>
                        <option value="AU">AUSTRALIA</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div>
                      <label style={inputLabelStyle}>PHONE NUMBER<span style={{ color: '#EB1C24' }}>*</span></label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={15}
                        value={newPhone}
                        onChange={(e) => {
                          setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 15));
                          setInvalidAddressFields((prev) => { const next = new Set(prev); next.delete('phoneNumber'); return next; });
                        }}
                        style={{ ...inputStyle, border: invalidAddressFields.has('phoneNumber') ? '1.3px solid #EB1C24' : '1.3px solid #000000' }}
                      />
                    </div>
                    <div>
                      <label style={inputLabelStyle}>EMAIL</label>
                      <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value.toUpperCase())} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                      <div
                        onClick={() => addressList.length > 0 && setSaveAsDefaultAddress(!saveAsDefaultAddress)}
                        style={{
                          width: '14px',
                          height: '14px',
                          cursor: addressList.length === 0 ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative',
                          opacity: addressList.length === 0 ? 0.8 : 1
                        }}
                      >
                        {(addressList.length === 0 || saveAsDefaultAddress) && (
                          <img src="/assets/checkbox.svg" alt="" style={{ width: '14px', height: '14px', position: 'absolute' }} />
                        )}
                      </div>
                      <label
                        onClick={() => addressList.length > 0 && setSaveAsDefaultAddress(!saveAsDefaultAddress)}
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: addressList.length === 0 ? 'default' : 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        SAVE AS DEFAULT
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    {addressList.length === 0 ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                        <p
                          style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                          dangerouslySetInnerHTML={{ __html: "YOU DON'T HAVE A SHIPPING ADDRESS ON FILE.<br>ADD A NEW ONE BELOW!" }}
                        />
                      </div>
                    ) : (
                      addressList.map((addr, i) => renderAddress(addr, i))
                    )}
                  </>
                )}
                </div>
              </div>
              {showAddAddressForm ? (
                <>
                  <button
                    type="button"
                    onClick={saveNewAddress}
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
                    SAVE ADDRESS
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddAddress}
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
                  onClick={openAddAddressForm}
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
                  ADD NEW ADDRESS
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      <ConfirmationModal
        isOpen={addressToRemove !== null}
        onClose={() => setAddressToRemove(null)}
        onConfirm={() => {
          if (addressToRemove) {
            removeAddress(addressToRemove);
            setAddressToRemove(null);
          }
        }}
        title="REMOVE ADDRESS?"
        message={<>ARE YOU SURE YOU WANT TO REMOVE THIS ADDRESS?<br />YOU CAN ADD IT AGAIN LATER.</>}
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="remove-address-confirm"
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

export default ShippingPage;
