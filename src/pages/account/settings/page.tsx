import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import ConfirmationModal from '../../../components/ConfirmationModal';

const inputBaseStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  color: 'black',
  width: '100%',
  height: '36px',
  padding: '8px',
  border: '1.3px solid black',
  borderRadius: 0,
  background: 'white',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  color: 'black',
  textTransform: 'uppercase',
  fontWeight: '500',
  marginBottom: '6px',
  display: 'block'
};

const sectionHeaderWrapperStyle = { marginBottom: '16px' };
const sectionHeaderTextStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  color: '#EB1C24',
  fontSize: '12px',
  fontWeight: '500',
  margin: 0,
  textTransform: 'uppercase'
};

function SettingsPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState<'SHOP' | 'TOOLS' | 'BRAND'>(() => {
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [sales, setSales] = useState(true);
  const [orderTracking, setOrderTracking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [socialViewMode, setSocialViewMode] = useState<Record<string, boolean>>({ facebook: false, instagram: false, youtube: false, tiktok: false, twitter: false });
  const [resetOldPassword, setResetOldPassword] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  const socialPrefixes: Record<string, string> = {
    facebook: 'FACEBOOK.COM/',
    instagram: 'INSTAGRAM.COM/',
    youtube: 'YOUTUBE.COM/',
    tiktok: 'TIKTOK.COM/',
    twitter: 'X.COM/'
  };

  const persistSocials = () => {
    try {
      const email = (userData?.email || '').trim().toLowerCase();
      if (!email) return;
      const stripAt = (s: string) => s.trim().replace(/^@/, '');
      const payload = {
        facebook: stripAt(facebook) ? `facebook.com/${stripAt(facebook)}` : '',
        instagram: stripAt(instagram) ? `instagram.com/${stripAt(instagram)}` : '',
        youtube: stripAt(youtube) ? `youtube.com/${stripAt(youtube)}` : '',
        tiktok: stripAt(tiktok) ? `tiktok.com/${stripAt(tiktok)}` : '',
        twitter: stripAt(twitter) ? `x.com/${stripAt(twitter)}` : ''
      };
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...payload };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      const current = localStorage.getItem('currentUser');
      if (current) {
        const parsed = JSON.parse(current);
        if ((parsed.email || '').trim().toLowerCase() === email) {
          localStorage.setItem('currentUser', JSON.stringify({ ...parsed, ...payload }));
        }
      }
      setUserData((prev: any) => (prev ? { ...prev, ...payload } : prev));
    } catch (_) {}
  };

  const handleResetPasswordSubmit = () => {
    setResetPasswordError('');
    if (resetOldPassword.trim() !== accountPassword) {
      setResetPasswordError('Current password is incorrect.');
      return;
    }
    if (resetNewPassword.trim().length === 0) {
      setResetPasswordError('Enter a new password.');
      return;
    }
    if (resetNewPassword.trim() !== resetConfirmPassword.trim()) {
      setResetPasswordError('New password and confirm do not match.');
      return;
    }
    try {
      const email = (userData?.email || '').trim().toLowerCase();
      if (!email) return;
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx === -1) return;
      const newPassword = resetNewPassword.trim();
      registered[idx] = { ...registered[idx], password: newPassword };
      localStorage.setItem('registeredUsers', JSON.stringify(registered));
      const current = localStorage.getItem('currentUser');
      if (current) {
        const parsed = JSON.parse(current);
        if ((parsed.email || '').trim().toLowerCase() === email) {
          localStorage.setItem('currentUser', JSON.stringify({ ...parsed, password: newPassword }));
        }
      }
      setResetOldPassword('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setShowResetPasswordForm(false);
    } catch (e) {
      setResetPasswordError('Failed to update password.');
    }
  };

  const handleDeleteAccount = () => {
    try {
      const currentUser = userData ? userData : (() => {
        try {
          const raw = localStorage.getItem('currentUser');
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();
      const email = currentUser?.email;
      if (email) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userToDelete = registeredUsers.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
        if (userToDelete) {
          const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
          deletedUsers.push({
            ...userToDelete,
            deletedAt: new Date().toISOString()
          });
          localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
        }
        const filtered = registeredUsers.filter((u: any) => (u.email || '').toLowerCase() !== email.toLowerCase());
        localStorage.setItem('registeredUsers', JSON.stringify(filtered));
      }
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowDeleteAccountConfirm(false);
      navigate('/sign-in');
    } catch (e) {
      console.error('Delete account failed', e);
      setShowDeleteAccountConfirm(false);
      navigate('/sign-in');
    }
  };

  // Actual account password (from current user or registeredUsers) for "Show password"
  const accountPassword = (() => {
    if (userData?.password) return String(userData.password);
    try {
      const email = userData?.email || (typeof window !== 'undefined' && (() => {
        const u = localStorage.getItem('currentUser');
        return u ? JSON.parse(u)?.email : null;
      })());
      if (email) {
        const raw = localStorage.getItem('registeredUsers');
        const list = raw ? JSON.parse(raw) : [];
        const user = list.find((u: any) => (u.email || '').toLowerCase() === String(email).toLowerCase());
        return user?.password != null ? String(user.password) : '';
      }
    } catch (_) {}
    return '';
  })();

  // Parse stored social value to handle only (strip domain prefix and any leading @)
  const parseSocialHandle = (key: string, raw: string): string => {
    const v = (raw || '').trim();
    const prefixes: Record<string, RegExp> = {
      facebook: /^facebook\.com\/?/i,
      instagram: /^instagram\.com\/?/i,
      youtube: /^youtube\.com\/?/i,
      tiktok: /^tiktok\.com\/?/i,
      twitter: /^(?:twitter|x)\.com\/?/i
    };
    return v.replace(prefixes[key] || /^@/, '').replace(/^@/, '').trim();
  };

  useEffect(() => {
    if (userData) {
      const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ').toUpperCase();
      setName(fullName || '');
      setEmail((userData.email || '').toUpperCase());
      setBirthday(userData.birthday || '');
      setFacebook(parseSocialHandle('facebook', userData.facebook || ''));
      setInstagram(parseSocialHandle('instagram', userData.instagram || ''));
      setYoutube(parseSocialHandle('youtube', userData.youtube || ''));
      setTiktok(parseSocialHandle('tiktok', userData.tiktok || ''));
      setTwitter(parseSocialHandle('twitter', userData.twitter || ''));
    } else {
      setEmail('BRUNO203@GMAIL.COM');
      setName('KRISTIN WATSON');
      setBirthday('08/30/1989');
    }
  }, [userData]);

  // Clear settings card badge when user visits this page
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;
      const email = user?.email;
      if (email) {
        localStorage.removeItem(`settingsAlert_${email}`);
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
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
    }
    navigate('/sign-in');
  };
  const handleBack = () => navigate('/account');

  const ToggleSwitch = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: '1px solid black',
        background: on ? '#EB1C24' : '#e5e5e5',
        cursor: 'pointer',
        padding: 0,
        position: 'relative',
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: on ? '22px' : '2px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.2)',
          transition: 'left 0.2s ease'
        }}
      />
    </button>
  );

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <style>{`
        .social-input-no-focus-ring:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
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
                  <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img alt="Search" width="16" height="15" src="/assets/search-icon.svg" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/build-a-wig')}>HOME &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/account')}>ACCOUNT &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>SETTINGS</span>
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
                className="border border-black bg-white/60 backdrop-blur-sm p-4 w-full"
                style={{ borderWidth: '1.3px' }}
              >
                {/* Personal Information */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={sectionHeaderWrapperStyle}>
                  <h2 style={sectionHeaderTextStyle}>PERSONAL INFORMATION</h2>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>NAME</label>
                  <input type="text" value={name} readOnly style={{ ...inputBaseStyle, fontFamily: '"Futura PT Medium"', color: '#808080' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>BIRTHDAY</label>
                  <input type="text" value={birthday} readOnly placeholder="MM/DD/YYYY" style={{ ...inputBaseStyle, fontFamily: '"Futura PT Medium"', color: '#808080' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>EMAIL</label>
                  <input type="email" value={email} readOnly placeholder="EMAIL@EXAMPLE.COM" style={{ ...inputBaseStyle, fontFamily: '"Futura PT Medium"', color: '#808080', textTransform: 'uppercase' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  {!showResetPasswordForm && <label style={labelStyle}>PASSWORD</label>}
                  {!showResetPasswordForm ? (
                    <>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        readOnly
                        value={showPassword ? accountPassword : '••••••••••'}
                        style={inputBaseStyle}
                      />
                      <div className="flex justify-between items-center" style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setShowResetPasswordForm(true)}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transform: 'translateX(2px)'
                          }}
                        >
                          RESET PASSWORD
                        </button>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowPassword((p) => !p)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword((p) => !p); }}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            cursor: 'pointer',
                            padding: 0,
                            transform: 'translateX(-2px)'
                          }}
                        >
                          {showPassword ? 'HIDE PASSWORD' : 'SHOW PASSWORD'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <label style={{ ...labelStyle, marginBottom: '4px' }}>CURRENT PASSWORD</label>
                      <input
                        type="text"
                        value={resetOldPassword}
                        onChange={(e) => setResetOldPassword(e.target.value)}
                        style={{ ...inputBaseStyle, marginBottom: '12px' }}
                      />
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ ...labelStyle, marginBottom: '4px' }}>NEW PASSWORD</label>
                        <input
                          type="text"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          style={inputBaseStyle}
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ ...labelStyle, marginBottom: '4px' }}>CONFIRM PASSWORD</label>
                        <input
                          type="text"
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          style={inputBaseStyle}
                        />
                      </div>
                      {resetPasswordError && (
                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#EB1C24', margin: '0 0 8px 0' }}>
                          {resetPasswordError}
                        </p>
                      )}
                      <div className="flex justify-between items-center" style={{ marginTop: '8px', transform: 'translateY(-5px)' }}>
                        <button
                          type="button"
                          onClick={handleResetPasswordSubmit}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transform: 'translateX(2px)'
                          }}
                        >
                          RESET PASSWORD
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowResetPasswordForm(false);
                            setResetOldPassword('');
                            setResetNewPassword('');
                            setResetConfirmPassword('');
                            setResetPasswordError('');
                          }}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transform: 'translateX(-2px)'
                          }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>SOCIALS</label>
                  {(['instagram', 'twitter', 'tiktok', 'facebook', 'youtube'] as const).map((key) => {
                    const prefix = socialPrefixes[key];
                    const value = key === 'facebook' ? facebook : key === 'instagram' ? instagram : key === 'youtube' ? youtube : key === 'tiktok' ? tiktok : twitter;
                    const setValue = key === 'facebook' ? setFacebook : key === 'instagram' ? setInstagram : key === 'youtube' ? setYoutube : key === 'tiktok' ? setTiktok : setTwitter;
                    const isView = socialViewMode[key];
                    return (
                      <div key={key} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', border: '1.3px solid black', background: 'white', boxSizing: 'border-box', minHeight: '36px', paddingLeft: '8px', paddingRight: '8px' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', flexShrink: 0, textTransform: 'uppercase' }}>{prefix}</span>
                        {isView ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => setSocialViewMode((s) => ({ ...s, [key]: false }))}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSocialViewMode((s) => ({ ...s, [key]: false })); }}
                            style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24', flex: 1, cursor: 'pointer', padding: '8px 0', minHeight: '36px', display: 'flex', alignItems: 'center', textTransform: 'uppercase' }}
                          >
                            {value ? value.replace(/^@/, '').toUpperCase() : '\u00A0'}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={value.replace(/^@/, '')}
                            onChange={(e) => setValue(e.target.value.replace(/^@/, '').toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                persistSocials();
                                setSocialViewMode((s) => ({ ...s, [key]: true }));
                              }
                            }}
                            onBlur={() => { persistSocials(); setSocialViewMode((s) => ({ ...s, [key]: true })); }}
                            placeholder=""
                            style={{
                              ...inputBaseStyle,
                              border: 'none',
                              marginBottom: 0,
                              paddingLeft: 0,
                              flex: 1,
                              minWidth: 0,
                              color: '#EB1C24',
                              textTransform: 'uppercase',
                              outline: 'none',
                              boxShadow: 'none'
                            }}
                            className="social-input-no-focus-ring"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ ...sectionHeaderWrapperStyle, marginTop: '8px' }}>
                  <h2 style={sectionHeaderTextStyle}>NOTIFICATIONS</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: 'black', textTransform: 'uppercase', fontWeight: '500' }}>Newsletter</span>
                    <ToggleSwitch on={newsletter} onClick={() => setNewsletter(!newsletter)} />
                  </div>
                  <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: 'black', textTransform: 'uppercase', fontWeight: '500' }}>Sales</span>
                    <ToggleSwitch on={sales} onClick={() => setSales(!sales)} />
                  </div>
                  <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: 'black', textTransform: 'uppercase', fontWeight: '500' }}>Order Tracking</span>
                    <ToggleSwitch on={orderTracking} onClick={() => setOrderTracking(!orderTracking)} />
                  </div>
                </div>

                {/* Help Center */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ ...sectionHeaderWrapperStyle, marginTop: '8px' }}>
                  <h2 style={sectionHeaderTextStyle}>HELP CENTER</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '6px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/faq')}
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: 'black',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/contact')}
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: 'black',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    CONTACT
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/terms')}
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: 'black',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    TERMS OF SERVICE
                  </button>
                </div>
              </div>

              {/* Delete Account - below main card, matches account profile sign out button */}
              <div className="px-0 md:px-0" style={{ marginTop: '-4px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountConfirm(true)}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  DELETE ACCOUNT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteAccountConfirm}
        onClose={() => setShowDeleteAccountConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="DELETE ACCOUNT"
        message={<>ARE YOU SURE YOU WANT TO DELETE YOUR ACCOUNT?<br />THIS ACTION IS PERMANENT & CANNOT BE UNDONE.</>}
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="delete-account-confirm"
      />
    </div>
  );
}

export default SettingsPage;
