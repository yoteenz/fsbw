import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

function ReferralsPage() {
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
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      return 'TOOLS';
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      return 'BRAND';
    }
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [userData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Generate referral code from user data with conflict checking (same as rewards page)
  const generateReferralCode = (): string => {
    if (userData?.referralCode) {
      return userData.referralCode;
    }
    if (!userData) {
      return 'KA3047';
    }
    const firstInitial = userData.firstName && userData.firstName.length > 0
      ? userData.firstName.charAt(0).toUpperCase()
      : 'K';
    const lastInitial = userData.lastName && userData.lastName.length > 0
      ? userData.lastName.charAt(0).toUpperCase()
      : 'A';
    let day = '30';
    if (userData.birthday) {
      const birthdayParts = userData.birthday.split('/');
      if (birthdayParts.length >= 2) {
        day = birthdayParts[1].padStart(2, '0');
      }
    }
    let phoneDigits = '2647';
    if (userData.phoneNumber) {
      phoneDigits = userData.phoneNumber.replace(/\D/g, '');
    }
    let lastTwoDigits = phoneDigits.length >= 2 ? phoneDigits.slice(-2) : '47';
    const primaryCode = `${firstInitial}${lastInitial}${day}${lastTwoDigits}`;
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const codeExists = registeredUsers.some((user: any) =>
        user.referralCode === primaryCode && user.email !== userData.email
      );
      if (codeExists && phoneDigits.length >= 4) {
        return `${firstInitial}${lastInitial}${day}${phoneDigits.slice(-4, -2)}`;
      }
    } catch (e) {
      // ignore
    }
    return primaryCode;
  };

  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };
    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
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
  const handleMobileMenuTabClick = (tab: string) => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };
  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
      navigate('/sign-in');
    } else {
      navigate('/sign-in');
    }
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
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          {/* NAV BAR */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img alt="Account icon" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')}
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate(-1)}
                  className="cursor-pointer"
                  style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                >
                  <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                </button>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/build-a-wig')}>
                    HOME &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/account')}>
                    ACCOUNT &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>REFERRALS</span>
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

          <div className="flex flex-col pb-4 mb-2 w-full" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible', minHeight: showMobileMenu ? '560px' : 'auto' }}>
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
                          borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                          paddingBottom: '4px', background: 'none', cursor: 'pointer'
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
                        ['ABOUT US', 'CONTACT', 'CARE & STORAGE', 'BECOME A MEMBER', 'FAQ', 'PAYMENT + SHIPPING', 'REVIEWS', 'TERMS OF SERVICE'].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', transform: 'translateX(7px)' }}>{item}</span>
                          </div>
                        ))
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
                                  } else if (item.label === 'ORDER AUTHORIZATION FORM') navigate('/shop/order-form');
                                }}
                              >
                                {item.label}
                              </span>
                              {item.hasArrow && (
                                <img
                                  src="/assets/NOIR/closed-arrow.svg"
                                  alt="Arrow"
                                  style={{ width: '16px', height: '16px', transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-5px) translateY(-4px) rotate(90deg)' : 'translateX(-5px) translateY(-4px) rotate(0deg)'}`, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                  onClick={(e) => { e.stopPropagation(); if (item.isExpandable) handleMobileMenuItemToggle(item.label); }}
                                />
                              )}
                            </div>
                            {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                              <div className="ml-4 mt-2 space-y-2">
                                {item.subItems.map((subItem, subIndex) => (
                                  <div key={subIndex} className="flex items-center cursor-pointer" onClick={() => {
                                    if (subItem === 'STRAIGHT') navigate('/units/straight');
                                    else if (subItem === 'WAVY') navigate('/units/wavy');
                                    else if (subItem === 'CURLY') navigate('/units/curly');
                                  }}>
                                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase' }}>{subItem}</span>
                                  </div>
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
                  <div className="flex justify-center" style={{ marginBottom: '0' }}>
                    <div className="flex" style={{ gap: '19px' }}>
                      <img src="/assets/instagram-icon.svg" alt="Instagram" style={{ width: '20px', height: '20px' }} />
                      <img src="/assets/twitter-icon.svg" alt="Twitter" style={{ width: '20px', height: '20px' }} />
                      <img src="/assets/facebook-icon.svg" alt="Facebook" style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* MAIN CARD - Referral code section (same as top of /rewards page) */
              <div
                className="border border-black bg-white/60 backdrop-blur-sm w-full pt-6 pb-4 px-5 mb-2 transition-all duration-300 ease-out"
                style={{ borderWidth: '1.3px', backgroundColor: 'rgba(255, 255, 255, 0.6)', minHeight: '560px' }}
              >
                <div style={{ marginBottom: '32px' }}>
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500', margin: '0', textTransform: 'uppercase' }}>
                      REFERRAL CODE
                    </h2>
                    <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#000000', fontSize: '13px', margin: '0', textTransform: 'uppercase' }}>
                      {generateReferralCode()}
                    </p>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                      ONCE YOU CREATE AN ACCOUNT, YOU'RE ASSIGNED A UNIQUE REFERRAL CODE. SHARE THIS CODE WITH FRIENDS & FAMILY TO EARN DIGITAL CASH EVERY TIME SOMEONE USES YOUR CODE AT CHECKOUT.
                    </p>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '500' }}>HOW IT WORKS:</p>
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                      WHEN SOMEONE MAKES A PURCHASE USING YOUR REFERRAL CODE, THEY RECEIVE <span style={{ color: '#EB1C24' }}>$20 OFF</span> THEIR ORDER AND YOU RECEIVE <span style={{ color: '#EB1C24' }}>$20</span> DEPOSITED INTO YOUR GIFT CARD BALANCE AFTER THEIR PURCHASE HAS BEEN CONFIRMED.
                    </p>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '500' }}>IMPORTANT NOTES:</p>
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>• REFERRAL CODES CAN ONLY BE APPLIED ONCE PER ACCOUNT</p>
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>• YOU CANNOT USE YOUR OWN REFERRAL CODE UNDER YOUR ACCOUNT</p>
                    <p style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px', margin: '0 0 12px 0', textTransform: 'uppercase' }}>• YOU MUST CREATE AN ACCOUNT OR BE SIGNED IN TO CHECKOUT WITH A REFERRAL CODE (FOR TRACKING PURPOSES)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferralsPage;
